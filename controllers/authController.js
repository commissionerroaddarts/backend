import User from '../models/User.js';
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from '../utils/helper.js';
import { cookieOptions } from '../constants/cookieOptions.js';
import _ from 'lodash';
import sendMail from '../config/mail.js';
import { OTP, WELCOME } from '../constants/emailTemplets.js';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const signup = async (req, res) => {
    try {
        const { firstname, lastname, email, password, username, profileImg } = req.body;

        // Check if email exists
        // const existingUser = await User.findOne({ email });
        // if (existingUser) return res.status(400).json({ message: "Email already exists" });
        if (!password)
            return res.status(400).json({ message: "Password is required" });

        // Create User (password hashing handled in model pre-save)
        const user = new User({ firstname, lastname, email: email.trim(), password, username, profileImg });
        // await user.save();



        // Generate JWT tokens
        const token = generateAccessToken(user);
        const tokenForOtp = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refreshToken in the user document
        user.refreshToken = refreshToken;
        await user.save();

        res
            .cookie('token', token, cookieOptions)
            .cookie('refreshToken', refreshToken, cookieOptions)
            .status(201).json({ message: "User registered successfully" });

        sendMail(OTP(user.email, user.firstname, tokenForOtp))
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: {
                message: error.message,
            }
        });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const user = req.user; // Comes from Passport `done()`
        const { token, refreshToken, isNewUser } = req.authInfo; // Comes from Passport `done()`

        // const sanitizedUser = _.omit(user.toObject(), ['password', 'refreshToken']);

        if (isNewUser)
            sendMail(WELCOME(user.email, user.firstname))

        res.cookie('token', token, cookieOptions)
            .cookie('refreshToken', refreshToken, cookieOptions)
        // .status(200)
        // .json({
        //     message: "Login Successful via Google",
        //     data: sanitizedUser,
        // });
        res.redirect(`${process.env.FRONTEND_URL}?login=success&googleSignup=${isNewUser}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: {
                message: "Server error",
                details: error.message
            }
        });
    }
}


export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let subscriptionData;
        if (user.stripeSubscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
            const productId = subscription.items.data[0].price.product;
            const product = await stripe.products.retrieve(productId);  // Fetch the product details
            const currentPeriodEnd = subscription.billing_cycle_anchor + 30 * 24 * 60 * 60;
            subscriptionData = {
                plan: product.name,
                currentPeriodEnd,
                isAutoRenew: !subscription.cancel_at_period_end,
                status: subscription.status,
            }
        }

        res.status(200).json({ data: { user, subscription: subscriptionData } });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: {
                message: "Server error",
                details: err.message
            }
        });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Please provide identifier and password." });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
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

        const sanitizedUser = _.omit(user.toObject(), ['password', 'refreshToken']);

        res
            .cookie('token', token, cookieOptions)
            .cookie('refreshToken', refreshToken, cookieOptions)
            .status(200)
            .json({
                message: "Login Successful",
                data: sanitizedUser,
            });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: {
                message: "Server error",
                details: err.message
            }
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.redirect(`${process.env.FRONTEND_URL}/?emailverification=failed&error=token`);

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
        const {  newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "Please provide new passwords." });
        }

        const user = await User.findById(req.user.id).select('+password');
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
                details: error.message
            }
        });
    }
};


export const logout = async (req, res) => {
    // For token-based auth, logout is handled on frontend (token removal)
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: "" } });
    // Clear cookies
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
};
