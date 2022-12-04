import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { createError } from "../utils/error.js";

export const handleSocials = async (req, res, next) => {
  try {
    const { userInfo } = req;
    if (userInfo.userRole == "superAdmin") {
      const { twitter, facebook } = req.body;
      const pushedObj = {
        twitter,
        facebook,
      };
      const user = await User.findByIdAndUpdate(userInfo.userId, {
        $push: { socialNetworkHandle: pushedObj },
      });
      user &&
        res.status(200).json({
          message: "Social network handle is registered successfully!",
        });
      !user && res.status(400).json({ message: "User not found!" });
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    next(err);
  }
};

export const socialController = {
  handleSocials,
};
