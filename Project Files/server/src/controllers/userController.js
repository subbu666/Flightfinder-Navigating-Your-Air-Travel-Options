// src/controllers/userController.js
import User from '../models/User.js';
import { sendOperatorApprovalEmail } from '../services/emailService.js';

/**
 * Fetch all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Fetch Users Error:', err.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Fetch single user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Fetch User Error:', err.message);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

/**
 * Approve operator (sends email notification)
 */
export const approveOperator = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.id, 
      { approval: 'approved' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Send approval email
    await sendOperatorApprovalEmail(user.email, user.username);
    
    res.json({ message: 'Approved!' });
  } catch (err) {
    console.error('Approve Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reject operator
 */
export const rejectOperator = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.id, 
      { approval: 'rejected' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Rejected!' });
  } catch (err) {
    console.error('Reject Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};