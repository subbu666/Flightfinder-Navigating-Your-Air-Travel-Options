// src/middleware/validateOTP.js
import { checkOTPExpiry } from '../utils/otpHelper.js';

/**
 * Middleware to validate OTP expiry and correctness
 */
export const validateOTP = (user, otp) => {
  // Check OTP expiry FIRST
  const expiryCheck = checkOTPExpiry(user.otpExpiry);
  if (expiryCheck.expired) {
    return {
      valid: false,
      message: expiryCheck.message
    };
  }

  // Check OTP match
  if (user.otp !== otp) {
    return {
      valid: false,
      message: 'Invalid OTP. Please check and try again.'
    };
  }

  return { valid: true };
};