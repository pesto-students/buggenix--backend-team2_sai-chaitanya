import {User} from "../../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../../utils/error.js";

export const registerUser = async (req,res,next) =>{
    try{
        let {username,email,password} = req.body;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        let user = {
            username,
            email,
            password:hash
        }
        let responseUser;
        if(req.body.member){
            let invitedUser = await User.findOne({email:req.body.email});
            if(invitedUser && invitedUser.status=='pending'){
                responseUser = await User.findByIdAndUpdate(invitedUser._id,{new: true},{
                    status:"active",
                    password,
                    username
                });
            }else{
                next(createError(404,"User not found!"))
            }
        }else{
            const newUser =  new User(user);
            responseUser = await newUser.save();
        }
        console.log(responseUser)
        const {password:pass , ...otherDetails} = responseUser._doc;
        console.log(otherDetails)
        let {_id:id,role,superAdminId} = otherDetails;
        let signedObj = {
            id,
            role,
            superAdminId
        }
        const token = jwt.sign(signedObj,process.env.JWT,{ expiresIn: '1d' });
        const refresh_token = jwt.sign(
            signedObj,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        const updatedUser = await User.findByIdAndUpdate(otherDetails._id ,{refreshToken:refresh_token});
        res.cookie("refresh_token",refresh_token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
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
            !user && res.status(400).json({message:"User not found!"})
        }else{
            res.status(403).json({message:'Forbidden'});
        }
    }catch(err){
        next(err)
    }
}

export const loginUser = async (req,res,next) =>{
    try{
        let {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user) return next(createError(404,"User not found!"));
        if(user && user.status=='pending'){
            next(createError(401,"User is not registered yet , please use the signup link sent by the super admin in your mail !"));
        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect) return next(createError(401,"Wrong password or username!"));
        let {_id:id,role,superAdminId} = user;
        let signedObj = {
            id,
            role,
            superAdminId
        }
        // change the expiry of access token
        const token = jwt.sign(signedObj,process.env.JWT,{ expiresIn: '1d' });
        const refresh_token = jwt.sign(
            signedObj,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // store the refresh token in uers collection for particular user
        const updatedUser = await User.findByIdAndUpdate(user._id ,{refreshToken:refresh_token});
        const {password:pass,refreshToken, ...otherDetails} = user._doc;
        res.cookie("refresh_token",refresh_token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
        res.status(200)
        .json({...otherDetails,accessToken:token});
    }catch(error){
        next(error);
    }
};

export const handleRefreshToken = async (req, res,next) => {
    try{
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
                let {id:id,role,superAdminId} = decoded;
                let signedObj = {
                    id,
                    role,
                    superAdminId
                }
                const accessToken = jwt.sign(
                    signedObj,
                    process.env.JWT,
                    { expiresIn: '1d' }
                );
                res.json({ accessToken })
            }
        );
    }catch(err){
        next(err);
    }
}

export const handleLogout = async (req, res,next) => {
    try{
        // On client, also delete the accessToken
        const cookies = req.cookies;
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
    }catch(err){
        next(err);
    }
}

