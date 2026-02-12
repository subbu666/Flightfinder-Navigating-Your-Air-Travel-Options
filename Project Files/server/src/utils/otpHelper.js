// src/utils/otpHelper.js

/**
 * Generate 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if OTP has expired
 */
export const checkOTPExpiry = (otpExpiry) => {
  if (!otpExpiry) {
    return { 
      expired: true, 
      message: '⏰ OTP has expired. Please request a new one.' 
    };
  }
  
  const now = new Date();
  const expiryTime = new Date(otpExpiry);
  
  if (now > expiryTime) {
    return { 
      expired: true, 
      message: '⏰ Your OTP has expired! Please request a new code.' 
    };
  }
  
  return { expired: false };
};

/**
 * Get OTP expiry time (2 minutes from now)
 */
export const getOTPExpiry = () => {
  return new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
};