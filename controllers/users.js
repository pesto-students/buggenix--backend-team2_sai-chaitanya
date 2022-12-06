import { User } from "../models/index.js";
import nodemailer from "nodemailer";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

export const inviteNewUser = async (req, res, next) => {
  try {
    const { userInfo } = req;
    if (userInfo.userRole == "superAdmin") {
      let { userName } = userInfo;
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
        html: `<div style=" background: #f6f7f9; padding:32px;width:576px;" >
              <h1 style="color:blue;text-align:center; height:40px;">Buggenix</h1> 
              <p style="margin-top: 15px;margin-bottom: 25px;font-family: Inter;font-style: normal;font-weight: 400;font-size: 20px;line-height: 24px;text-align: center;color: #000000;">Invitation from ${userName}: Please join my team at Buggenix</p>
              <div style="background: white;padding:32px;">
                <p style="margin-top: 7px;margin-bottom: 10px;font-family: Inter;font-style: normal;font-weight: 400;font-size: 20px;line-height: 24px;text-align: center;color: #000000;">Hi!</p>
                <p style="margin-top:10px;margin-bottom: 20px;font-family: Inter;font-style: normal;font-weight: 400;font-size: 20px;line-height: 24px;text-align: center;color: #000000;">I’m inviting you to join my team at Buggenix.</p>
                <a style="padding: 8px 16px;border-radius: 4px;background: #023be3;text-decoration: none;font-family: Inter;font-style: normal;font-weight: 500;font-size: 14px;line-height: 146%;text-align: center;display:block;margin:auto;width:125px;color: #f6f7f9;" href="${redirectedUrl}"> Join team</a>
                <p style=" font-family: Inter;font-style: normal;font-size: 16px;line-height: 24px;text-align: center;color: #515b67;">
                <span style="font-weight: bold;">What is Buggenix?</span><br>
                  Buggenix is a one-stop software tool that scrapes any issues/bugs/feature requests reported by your fellow customers 
                  from any social media/communication channel that you could have your presence in Twitter to your everyday
                </p>
                <p style=" font-family: Inter;font-style: normal;font-weight: normal;font-size: 16px;text-align: center;color: #515b67;">
                  Best regards,<br>
                  ${userName}
                </p>
              </div>
            </div>`,
      };
      const sentMail = await transporter.sendMail(mailOptions);
      let responseUser;
      if (sentMail) {
        let user = {
          username: null,
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
      res.status(200).json({ message: "sent successfully" });
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
          },
        ],
      },
      { password: 0, refreshToken: 0, socialNetworkHandle: 0 }
    );
    console.log(user);
    let newResponse = user;
    newResponse = newResponse.map((response) => {
      return {
        ...response._doc,
        id: response._id,
        name: response.username,
      };
    });
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
