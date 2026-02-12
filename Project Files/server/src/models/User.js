// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  usertype: { type: String, required: true },
  password: { type: String, required: true },
  approval: { type: String, default: 'approved' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);