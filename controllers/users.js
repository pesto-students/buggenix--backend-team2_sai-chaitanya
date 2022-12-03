import { User } from "../models/index.js";
import nodemailer from "nodemailer";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

export const inviteNewUser = async (req, res, next) => {
  try {
    const { userInfo } = req;
    if (userInfo.userRole == "superAdmin") {
      const from = "buggenixhelpdesk@gmail.com";
      const to = req.body.to;
      const role = req.body.role;
      const subject = "Email invitation";
      const authUser = process.env.AUTH_USER;
      const authPass = process.env.AUTH_PASS;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: authUser,
          pass: authPass,
        },
      });
      let sId = userInfo.userId;
      let redirectedUrl = `https://rad-cannoli-15e97a.netlify.app/team-invite?email=${to}`;

      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: `<p>html code</p> <a href="${redirectedUrl}"><button>create</button></a>`,
      };
      const sentMail = await transporter.sendMail(mailOptions);
      let responseUser;
      if (sentMail) {
        let user = {
          username: "null",
          email: to,
          password: "pending",
          status: "pending",
          superAdminId: userInfo.userId,
          role: role,
        };
        const newUser = new User(user);
        responseUser = await newUser.save();
        responseUser = responseUser._doc;
      }
      const { password: pass, ...otherDetails } = responseUser;
      res.status(200).json({ message: "sent successfully", ...otherDetails });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { userInfo } = req;
    let superAdminId = userInfo.userSuperAdminId;
    let userId = userInfo.userId;
    if (userInfo.userRole == "superAdmin") {
      superAdminId = userInfo.userId;
    }
    let user = await User.find(
      {
        $or: [
          {
            superAdminId: superAdminId,
          },
          {
            _id: userId,
          }
        ],
      },
      { password: 0, refreshToken: 0, socialNetworkHandle: 0 }
    );
    console.log(user)
    let newResponse =user;
    newResponse = newResponse.map((response)=>{
      return {
        ...response._doc,
        id:response._id,
        name:response.username
      }
    })
    res.status(200).json({ team: newResponse });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { id } = req.params;
    console.log(id);
    const objId = mongoose.Types.ObjectId(id);
    if (userInfo.userRole == "superAdmin") {
      const user = await User.findByIdAndDelete(objId);
      user && res.status(200).json({ message: "Deleted successfully!" });
      !user && res.status(400).json({ message: "User not found!" });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    next(err);
  }
};

export const changeRoleOfUser = async (req, res, next) => {
  try {
    const { userInfo } = req;
    const { changedId, changedRole } = req.body;
    if (userInfo.userRole == "superAdmin") {
      const user = await User.findByIdAndUpdate(changedId, {
        role: changedRole,
      });
      user && res.status(200).json({ message: "Changed successfully!" });
      !user && res.status(400).json({ message: "User not found!" });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    next(err);
  }
};

export const usersController = {
  inviteNewUser,
  getAllUsers,
  deleteUser,
  changeRoleOfUser,
};
