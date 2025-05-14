import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from "../utils/helper.js";
import User from "../models/User.js";
import { getStripeSubscriptionIdByEmail } from "../utils/stripe.js";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.BACKEND_URL + "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract first and last name from displayName
                const [firstname, ...lastNameParts] = profile.displayName.split(" ");
                const lastname = lastNameParts.join(" ") || null; // Handle cases with no last name

                let user = await User.findOne({ email: profile.emails[0].value });
                let isNewUser = false;
                if (!user) {
                    isNewUser = true;
                    user = await User.create({
                        firstname,
                        lastname,
                        email: profile.emails[0].value,
                        refreshToken: "",
                        status: "verified",
                    });
                    const stripeSubscriptionId = await getStripeSubscriptionIdByEmail(user.email);
                    if (stripeSubscriptionId) {
                        user.role = 'owner';
                        user.stripeSubscriptionId = stripeSubscriptionId;
                    }
                }



                // Generate JWT tokens
                const token = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);

                // Store refresh token in the database
                user.refreshToken = refreshToken;



                await user.save();

                done(null, user, { token, refreshToken, isNewUser });
            } catch (error) {
                console.error("Error in Google Strategy:", error);
                done(error, null);
            }
        }
    )
);
