import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import {OktaAuth}  from '@okta/okta-auth-js';
import axios from 'axios';

export const registerUser = async (req,res,next) =>{
    try{
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const newUser =  new User({
            username:req.body.username,
            email:req.body.email,
            password:hash
        });
        await newUser.save();
        res.status(200).send("user has been created!");
    }catch(error){
        next(error)
    }
}
// export const registerUser = async (req,res,next) =>{
//     try{
//         // const salt = bcrypt.genSaltSync(10);
//         // const hash = bcrypt.hashSync(req.body.password, salt);
//         let username = req.body.name;
//         let email = req.body.email;
//         let password = req.body.password;
//         let data = JSON.stringify({
//             "profile": {
//                 "firstName": username,
//                 "lastName":"brook",
//                 "email": email,
//                 "login": email,
//             },
//             "credentials": {
//                 "password": {
//                 "value": password
//                 }
//             }
//         });
        
//         let  config = {
//             method: 'post',
//             url: 'https://dev-02087076-admin.okta.com/api/v1/users?activate=true',
//             headers: { 
//                 'Accept': 'application/json', 
//                 'Content-Type': 'application/json', 
//                 'Authorization': 'SSWS 00CmsNSFMdflfeUWVbfkX9JWq97JF3IN9qhYwFfRRA'
//             },
//             data : data
//         };
        
//         axios(config)
//         .then(function (response) {
//             console.log(JSON.stringify(response.data));
//         })
//         .catch(function (error) {
//             console.log(error);
//         });
//         // const newUser =  new User({
//         //     username:req.body.username,
//         //     email:req.body.email,
//         // });
//         // await newUser.save();
//         res.status(200).send("user has been created!");
//     }catch(error){
//         next(error)
//     }
// }

export const loginUser = async (req,res,next) =>{
    try{
        // console.log(req.cookies)
        const user = await User.findOne({email:req.body.email});
        if(!user) return next(createError(404,"User not found!"));

        const isPasswordCorrect = await bcrypt.compare(req.body.password,user.password);
        if(!isPasswordCorrect) return next(createError(401,"Wrong password or username!"));
        // console.log("user-login",user);
        // change the expiry of access token
        const token = jwt.sign({id:user._id},process.env.JWT,{ expiresIn: '1d' });
        const refresh_token = jwt.sign(
            { "id": user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // store the refresh token in uers collection for particular user
        const updatedUser = await User.findByIdAndUpdate(user._id ,{refreshToken:refresh_token});
        // console.log("91",updatedUser)
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
            if (err || foundUser._id !== decoded._id) return res.sendStatus(403);
            const accessToken = jwt.sign(
                { "id": decoded.id },
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