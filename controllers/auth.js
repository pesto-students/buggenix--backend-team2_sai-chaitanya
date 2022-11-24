import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { createError } from "../utils/error.js";

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const user = {
      username,
      email,
      password: hash,
    };
    let userResponse;
    // remove member
    if (req.body.member) {
      let invitedUser = await User.findOne({ email: req.body.email });
      if (invitedUser && invitedUser.status == "pending") {
        userResponse = await User.findByIdAndUpdate(
          invitedUser._id,
          {
            status: "active",
            password: hash,
            username: username,
          },
          { new: true }
        );
      } else {
        next(createError(402, "User cannot get registered !"));
      }
    } else {
      const newUser = new User(user);
      userResponse = await newUser.save();
    }
    const { password: pass, ...otherDetails } = userResponse._doc;
    const { _id: id, role, superAdminId } = otherDetails;
    const signedObj = {
      id,
      role,
      superAdminId,
      email,
      username,
    };
    const token = jwt.sign(signedObj, process.env.JWT, { expiresIn: "1d" });
    const refreshToken = jwt.sign(signedObj, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    const updatedUser = await User.findByIdAndUpdate(otherDetails._id, {
      refreshToken,
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    // create const max age
    res.status(200).json({ ...otherDetails, accessToken: token });
  } catch (error) {
    next(error);
  }
};

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

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "User not found!"));
    if (user && user.status == "pending") {
      next(
        createError(
          401,
          "User is not registered yet , please use the signup link sent by the super admin in your mail !"
        )
      );
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return next(createError(401, "Wrong password or username!"));
    let { _id: id, role, superAdminId, username } = user;
    let signedObj = {
      id,
      role,
      superAdminId,
      email,
      username,
    };
    // change the expiry of access token
    const token = jwt.sign(signedObj, process.env.JWT, { expiresIn: "1d" });
    const refreshToken = jwt.sign(signedObj, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    // store the refresh token in uers collection for particular user
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      refreshToken,
    });
    const {
      password: pass,
      refreshToken: TokenResp,
      ...otherDetails
    } = user._doc;
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ ...otherDetails, accessToken: token });
  } catch (error) {
    next(error);
  }
};

export const handleRefreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refresh_token) return res.sendStatus(401);
    const refreshToken = cookies.refresh_token;

    const foundUser = await User.findOne({ refreshToken: refreshToken });
    if (!foundUser) return res.sendStatus(403); //Forbidden
    // evaluate jwt
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser._id !== decoded.id) return res.sendStatus(403);
        const { id: id, role, superAdminId, email, username } = decoded;
        const signedObj = {
          id,
          role,
          superAdminId,
          email,
          username,
        };
        const accessToken = jwt.sign(signedObj, process.env.JWT, {
          expiresIn: "1d",
        });
        res.json({ accessToken });
      }
    );
  } catch (err) {
    next(err);
  }
};

export const handleLogout = async (req, res, next) => {
  try {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    if (!cookies?.refresh_token) return res.sendStatus(204); //No content
    const refreshToken = cookies.refresh_token;
    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken: refreshToken });
    if (!foundUser) {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }
    // Delete refreshToken in db
    const updatedUser = await User.findByIdAndUpdate(foundUser._id, {
      refreshToken: "",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const authController = {
  registerUser,
  loginUser,
  handleRefreshToken,
  handleLogout,
};
