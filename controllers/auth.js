import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import nodemailer from 'nodemailer'

export const registerUser = async (req,res,next) =>{
    try{
        const {superAdminId} = req.query;
        let memberUser = {};
        if(superAdminId){
            // check if superAdminId is there in query parameter, if it is there then team member or admin is trying to register
            memberUser = {
                "superAdminId":superAdminId,
                "role": "member"
            }
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        let user = {
            ...memberUser,
            username:req.body.username,
            email:req.body.email,
            password:hash
        }
        console.log("user",user)
        const newUser =  new User(user);
        let responseUser = await newUser.save();
        console.log(responseUser)
        const {password , ...otherDetails} = responseUser._doc;
        let signedObj = {
            "id":otherDetails._id,
            "role":otherDetails.role,
            "superAdminId":otherDetails.superAdminId
        }
        const token = jwt.sign(signedObj,process.env.JWT,{ expiresIn: '1d' });
        const refresh_token = jwt.sign(
            signedObj,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        const updatedUser = await User.findByIdAndUpdate(otherDetails._id ,{refreshToken:refresh_token});
        res.status(200).json({...otherDetails,accessToken:token});
    }catch(error){
        next(error)
    }
}

export const handleSocialMediaInput = async(req,res,next) =>{
    try{
        let {userInfo} = req;
        if(userInfo.userRole == 'superAdmin'){
            let {twitter,facebook} = req.body;
            let pushedObj = {
                twitter,
                facebook
            }
            const user = await User.findByIdAndUpdate(userInfo.userId,{ $push: { socialNetworkHandle: pushedObj } });
            user && res.status(200).json({message:'Social network handle is registered successfully!'});
            res.status(400).json({message:"User not found!"})
        }else{
            res.status(403).json({message:'Forbidden'});
        }
    }catch(err){
        next(err)
    }
}

export const loginUser = async (req,res,next) =>{
    try{
        // console.log(req.cookies)
        const user = await User.findOne({email:req.body.email});
        if(!user) return next(createError(404,"User not found!"));

        const isPasswordCorrect = await bcrypt.compare(req.body.password,user.password);
        if(!isPasswordCorrect) return next(createError(401,"Wrong password or username!"));
        // change the expiry of access token
        let signedObj = {
            "id":user._id,
            "role":user.role,
            "superAdminId":user.superAdminId
        }
        const token = jwt.sign(signedObj,process.env.JWT,{ expiresIn: '1d' });
        const refresh_token = jwt.sign(
            signedObj,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // store the refresh token in uers collection for particular user
        const updatedUser = await User.findByIdAndUpdate(user._id ,{refreshToken:refresh_token});
        const {password,refreshToken, ...otherDetails} = user._doc;
        res.cookie("refresh_token",refresh_token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
        res.status(200)
        .json({...otherDetails,accessToken:token});
    }catch(error){
        next(error);
    }
};

export const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log("cookies",cookies)
    if (!cookies?.refresh_token) return res.sendStatus(401);
    const refreshToken = cookies.refresh_token;

    const foundUser = await User.findOne({refreshToken:refreshToken});
    console.log("foundUser");
    if (!foundUser) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser._id !== decoded.id) return res.sendStatus(403);
            let signedObj = {
                "id":decoded.id,
                "role":decoded.role,
                "superAdminId":decoded.superAdminId
            }
            const accessToken = jwt.sign(
                signedObj,
                process.env.JWT,
                { expiresIn: '1d' }
            );
            res.json({ accessToken })
        }
    );
}

export const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    console.log("cookies",cookies)
    if (!cookies?.refresh_token) return res.sendStatus(204); //No content
    const refreshToken = cookies.refresh_token;

    // Is refreshToken in db?
    const foundUser = await User.findOne({refreshToken:refreshToken});
    console.log(foundUser)
    if (!foundUser) {
        res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'None', secure: true });
        console.log(res)
        return res.sendStatus(204);
    }
    // Delete refreshToken in db
    const updatedUser = await User.findByIdAndUpdate(foundUser._id ,{refreshToken:''});
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

export const inviteNewTeammember = async (req,res) =>{
    try{
        let {userInfo} = req;
        if(userInfo.userRole == 'superAdmin'){
            let from = 'buggenixhelpdesk@gmail.com';
            let to = req.body.to;
            let subject = "Email invitation";
            let authUser = process.env.AUTH_USER;
            let authPass = process.env.AUTH_PASS;
            let transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:authUser,
                    pass:authPass
                }
            })
            let sId=userInfo.userId;
            let redirectedUrl = `https://zesty-sprinkles-e35f24.netlify.app/signup/sId=${sId}/email=${to}`;

            let mailOptions = {
                from: from,
                to:to,
                subject:subject,
                html:`<p>html code</p> <a href="${redirectedUrl}"><button>create</button></a>`
            }

            const sentMail = await transporter.sendMail(mailOptions);
            console.log("sentmail",sentMail);
            res.status(200).json({message:"sent successfully"});
        }else{
            res.status(403).json({message:'Forbidden'});
        }
        
    }catch(err){

    }
}

export const getAllTeamMembers = async(req,res) =>{
    try{
        let {userInfo} = req;
        let superAdminId = userInfo.userSuperAdminId;
        if(userInfo.userRole == 'superAdmin'){
            superAdminId = userInfo.userId
        }
        let user = await User.find({
            "superAdminId":superAdminId
        },{password:0,refreshToken:0,socialNetworkHandle:0});
        console.log("219",user)
        res.status(200).json({team:user});
    }catch(err){
        next(err);
    }
}

export const deleteTeamMember = async (req,res) =>{
    try{
        let {userInfo} = req;
        let {deleteId} = req.body;
        if(userInfo.userRole == 'superAdmin'){
            let user = await User.findByIdAndDelete(deleteId);
            user && res.status(200).json({message:'Deleted successfully!'});
            res.status(400).json({message:"User not found!"})
        }else{
            res.status(403).json({message:'Forbidden'});
        }
    }catch(err){
        next(err)
    }
}

export const changeRoleOfUser = async(req,res)=>{
    try{
        let {userInfo} = req;
        let {changedId,changedRole} = req.body;
        if(userInfo.userRole == 'superAdmin'){
            let user = await User.findByIdAndUpdate(changedId,{
                role:changedRole
            });
            user && res.status(200).json({message:'Changed successfully!'});
            res.status(400).json({message:"User not found!"})
        }else{
            res.status(403).json({message:'Forbidden'});
        }
    }catch(err){
        next(err);
    }
}
