// src/controllers/authController.js
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateOTP, getOTPExpiry } from '../utils/otpHelper.js';
import { validateOTP } from '../middleware/validateOTP.js';
import { 
  sendSignupOTP, 
  sendWelcomeEmail, 
  sendForgotPasswordOTP 
} from '../services/emailService.js';

/**
 * Send OTP for signup
 */
export const sendSignupOTPHandler = async (req, res) => {
  const { email, username, usertype } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // If user exists but not verified, update OTP
    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    }

    // Send OTP email
    await sendSignupOTP(email, username, usertype, otp);

    res.json({ 
      message: 'OTP sent successfully',
      email,
      tempData: { username, usertype }
    });
  } catch (err) {
    console.error('Send OTP Error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

/**
 * Verify OTP and Register
 */
export const verifyOTPAndRegister = async (req, res) => {
  const { email, otp, username, usertype, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Please request OTP first' });
    }

    // Validate OTP
    const otpValidation = validateOTP(user, otp);
    if (!otpValidation.valid) {
      return res.status(400).json({ message: otpValidation.message });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Determine approval status
    const approval = usertype === 'flight-operator' ? 'not-approved' : 'approved';

    // Update user
    user.username = username;
    user.usertype = usertype;
    user.password = hashedPassword;
    user.approval = approval;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, username, usertype);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      usertype: user.usertype,
      approval: user.approval,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

/**
 * Create temporary user entry for OTP
 */
export const createTempUser = async (req, res) => {
  const { email, username, usertype } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (!existingUser) {
      await User.create({
        username,
        email,
        usertype,
        password: 'temp',
        approval: usertype === 'flight-operator' ? 'not-approved' : 'approved',
        isVerified: false
      });
    }

    res.json({ message: 'Temporary user created' });
  } catch (err) {
    console.error('Create Temp User Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Resend OTP for signup
 */
export const resendOTP = async (req, res) => {
  const { email, username, usertype } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendSignupOTP(email, username, usertype, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP Error:', err.message);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

/**
 * Login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // ✅ 404 for non-existing user (distinct from wrong password)
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Please register to continue.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email first',
        needsVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // ✅ 401 only for wrong password now
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      usertype: user.usertype,
      approval: user.approval
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Forgot Password - Send OTP
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your account first' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send forgot password OTP email
    await sendForgotPasswordOTP(email, user.username, otp);

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Failed to send reset code' });
  }
};

/**
 * Verify Forgot Password OTP
 */
export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate OTP
    const otpValidation = validateOTP(user, otp);
    if (!otpValidation.valid) {
      return res.status(400).json({ message: otpValidation.message });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify Reset OTP Error:', err.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate OTP
    const otpValidation = validateOTP(user, otp);
    if (!otpValidation.valid) {
      return res.status(400).json({ message: otpValidation.message });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};