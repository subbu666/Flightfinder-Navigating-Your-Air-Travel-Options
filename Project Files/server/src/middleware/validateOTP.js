// src/middleware/validateOTP.js
import { checkOTPExpiry } from '../utils/otpHelper.js';

/**
 * Middleware to validate OTP expiry and correctness
 */
export const validateOTP = (user, otp) => {
  // Check if user has OTP
  if (!user.otp) {
    return {
      valid: false,
      message: 'No OTP found. Please request a new one.'
    };
  }

  // Check OTP expiry FIRST
  const expiryCheck = checkOTPExpiry(user.otpExpiry);
  if (expiryCheck.expired) {
    return {
      valid: false,
      message: expiryCheck.message
    };
  }

  // Normalize both OTPs for comparison
  const userOTP = String(user.otp).trim();
  const inputOTP = String(otp).trim();

  // Validate OTP format (should be 6 digits)
  if (!/^\d{6}$/.test(inputOTP)) {
    return {
      valid: false,
      message: 'Invalid OTP format. Please enter 6 digits.'
    };
  }

  // Check OTP match
  if (userOTP !== inputOTP) {
    console.error('❌ OTP Mismatch:', { 
      stored: userOTP, 
      received: inputOTP,
      storedType: typeof user.otp,
      receivedType: typeof otp,
      email: user.email
    });
    return {
      valid: false,
      message: 'Invalid OTP. Please check and try again.'
    };
  }

  console.log('✅ OTP Verified Successfully for:', user.email);
  return { valid: true };
};