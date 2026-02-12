// src/routes/bookingRoutes.js
import express from 'express';
import {
  getAllBookings,
  bookTicket,
  cancelTicket
} from '../controllers/bookingController.js';

const router = express.Router();

// Booking routes
router.get('/fetch-bookings', getAllBookings);
router.post('/book-ticket', bookTicket);
router.put('/cancel-ticket/:id', cancelTicket);

export default router;