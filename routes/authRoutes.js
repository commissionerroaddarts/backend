// routes/authRoutes.js
import express from 'express';
import { signup, logout, loginUser, googleAuth, getMe, updatePassword, verifyEmail, verifyEmailTemp, verifyCaptcha, forgotPassword, resetPassword, resendVerificationEmail } from '../controllers/authController.js';
import passport from "passport";
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', loginUser);
router.post('/resend', resendVerificationEmail);
router.post('/logout', authMiddleware, logout);
router.post('/change-password', authMiddleware, updatePassword);
router.get('/verify', verifyEmail);
router.get('/tempverify', authMiddleware, verifyEmailTemp);
router.get('/me', authMiddleware, getMe);
router.get('/verify-captcha', verifyCaptcha);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// -------------------- Google OAuth --------------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] })); // Login, Redirect to Google for OAuth
router.get("/google/callback", passport.authenticate("google", { session: false }), googleAuth); // Callback URL after Google authentication 

export default router;
