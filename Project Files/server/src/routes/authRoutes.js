// src/routes/authRoutes.js
import express from 'express';
import {
  sendSignupOTPHandler,
  verifyOTPAndRegister,
  createTempUser,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// Signup routes
router.post('/send-signup-otp', sendSignupOTPHandler);
router.post('/verify-otp-register', verifyOTPAndRegister);
router.post('/create-temp-user', createTempUser);
router.post('/resend-otp', resendOTP);

// Login route
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

export default router;