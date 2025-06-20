import User from "../models/User.js";
import Business from "../models/Business.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  getSpecialUserPermissions,
  getSubscriptionDetails,
} from "../utils/helper.js";
import { cookieOptions } from "../constants/cookieOptions.js";
import _ from "lodash";
import sendMail from "../config/mail.js";
import {
  ForgotPasswordEmail,
  NEW_USER_SIGNUP,
  OTP,
  WELCOME,
} from "../constants/emailTemplets.js";
import jwt from "jsonwebtoken";
import { getStripeSubscriptionIdByEmail } from "../utils/stripe.js";
import axios from "axios";

export const signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      username,
      profileImg,
      phone,
    } = req.body;

    // Check if email exists
    // const existingUser = await User.findOne({ email });
    // if (existingUser) return res.status(400).json({ message: "Email already exists" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    // Create User (password hashing handled in model pre-save)
    const user = new User({
      firstname,
      lastname,
      email: email.trim(),
      password,
      username,
      profileImg,
      phone,
    });
    // await user.save();

    // Generate JWT tokens
    const token = generateAccessToken(user);
    const tokenForOtp = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refreshToken in the user document
    user.refreshToken = refreshToken;
    const stripeSubscriptionId = await getStripeSubscriptionIdByEmail(
      user.email
    );
    console.log(stripeSubscriptionId, user.email);
    if (stripeSubscriptionId) {
      user.status = "verified";
      user.role = "owner";
      user.stripeSubscriptionId = stripeSubscriptionId;
    }
    await user.save();

    const sanitizedUser = _.omit(user.toObject(), ["password", "refreshToken"]);

    res.cookie("token", token, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    sendMail(OTP(user.email, user.firstname, tokenForOtp));
    sendMail(NEW_USER_SIGNUP(user.email, user.firstname));

    res.status(201).json({
      message: "User registered successfully",
      data: sanitizedUser,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: {
        message: error.message,
      },
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tokenForOtp = generateAccessToken(user);

    sendMail(OTP(user.email, user.firstname, tokenForOtp));

    res.status(200).json({
      message: "Verification Email Sent successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: {
        message: error.message,
      },
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const user = req.user; // Comes from Passport `done()`
    const { token, refreshToken, isNewUser } = req.authInfo; // Comes from Passport `done()`

    // const sanitizedUser = _.omit(user.toObject(), ['password', 'refreshToken']);

    if (isNewUser) sendMail(WELCOME(user.email, user.firstname));

    res
      .cookie("token", token, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions);
    // .status(200)
    // .json({
    //     message: "Login Successful via Google",
    //     data: sanitizedUser,
    // });
    res.redirect(
      `${process.env.FRONTEND_URL}?login=success&googleSignup=${isNewUser}`
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: {
        message: "Server error",
        details: error.message,
      },
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let subscriptionData, permissions;

    if (user.stripeSubscriptionId) {
      const result = await getSubscriptionDetails(user.stripeSubscriptionId);
      subscriptionData = result.subscriptionData;
      permissions = result.permissions;
    }

    const specialPermissions = getSpecialUserPermissions(user.email);
    if (specialPermissions) {
      permissions = specialPermissions;
    }

    const maxListings = permissions?.maxListings || 0;
    const businessCount = await Business.countDocuments({
      userId: req.user.id,
    });
    const canAdd = businessCount < maxListings;

    return res.status(200).json({
      data: {
        user,
        subscription: subscriptionData,
        permissions,
        canAdd,
        businessCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        message: "Server error",
        details: err.message,
      },
    });
  }
};

export const verifyRefreshToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.cookies.token;

  console.log("Verifying refresh token:", req.cookies);

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let subscriptionData, permissions;

    if (user.stripeSubscriptionId) {
      const result = await getSubscriptionDetails(user.stripeSubscriptionId);
      subscriptionData = result.subscriptionData;
      permissions = result.permissions;
    }

    const specialPermissions = getSpecialUserPermissions(user.email);
    if (specialPermissions) {
      permissions = specialPermissions;
    }

    return res.status(200).json({
      message: "Token is valid",
      user,
      subscription: subscriptionData,
      permissions,
    });
  } catch (err) {
    console.error("Refresh token verification error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Please provide identifier and password." });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Login with Google or Sign up!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong Password!" });
    }

    // Generate JWT tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refreshToken in the user document
    user.refreshToken = refreshToken;
    await user.save();

    const sanitizedUser = _.omit(user.toObject(), ["password", "refreshToken"]);
    res.cookie("token", token, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      message: "Login Successful",
      data: sanitizedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        message: "Server error",
        details: err.message,
      },
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.redirect(
        `${process.env.FRONTEND_URL}/?emailverification=failed&error=token`
      );

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    await User.findByIdAndUpdate(decoded.id, { status: "verified" });

    res.redirect(`${process.env.FRONTEND_URL}/?emailverification=success`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.FRONTEND_URL}/?emailverification=failed`);
  }
};

export const verifyEmailTemp = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { status: "verified" });

    res.redirect(`${process.env.FRONTEND_URL}/?emailverification=success`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.FRONTEND_URL}/?emailverification=failed`);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "Please provide new passwords." });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // if (user.password) {
    //     console.log("User");
    //     const isMatch = await bcrypt.compare(currentPassword, user.password);
    //     if (!isMatch) {
    //         return res.status(401).json({ message: "Current password is incorrect." });
    //     }
    // }

    user.password = newPassword; // Password hashing handled in model pre-save
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        message: "Server error",
        details: error.message,
      },
    });
  }
};

export const logout = async (req, res) => {
  // For token-based auth, logout is handled on frontend (token removal)
  await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: "" } });
  // Clear cookies
  res.clearCookie("token", {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  res.clearCookie("refreshToken", {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  // res.clearCookie('token', cookieOptions);
  // res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
};

export const verifyCaptcha = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token missing" });
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY, // Store in .env
          response: token,
        },
      }
    );

    const isSuccess = response.data.success;
    res.status(200).json({ success: isSuccess });
  } catch (error) {
    console.error("Captcha verification error:", error.message);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email." });
    }

    const token = generateAccessToken(user, "1h");

    // Send reset password email
    sendMail(ForgotPasswordEmail(user.email, token));

    res
      .status(200)
      .json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: {
        message: "Server error",
        details: error.message,
      },
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is missing." });
    }

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword; // Will be hashed in pre-save middleware
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: {
        message: "Server error",
        details: error.message,
      },
    });
  }
};
