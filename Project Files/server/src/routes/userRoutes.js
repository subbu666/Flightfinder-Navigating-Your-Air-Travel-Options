// src/routes/userRoutes.js
import express from 'express';
import {
  getAllUsers,
  getUserById,
  approveOperator,
  rejectOperator
} from '../controllers/userController.js';

const router = express.Router();

// User routes
router.get('/fetch-users', getAllUsers);
router.get('/fetch-user/:id', getUserById);

// Operator management routes
router.post('/approve-operator', approveOperator);
router.post('/reject-operator', rejectOperator);

export default router;