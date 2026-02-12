// src/controllers/bookingController.js
import Booking from '../models/Booking.js';

/**
 * Fetch all bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email')
      .populate('flight', 'flightName flightId');
    res.json(bookings);
  } catch (err) {
    console.error('Fetch Bookings Error:', err.message);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

/**
 * Book a ticket
 */
export const bookTicket = async (req, res) => {
  try {
    const { flight, journeyDate, seatClass, passengers } = req.body;

    // Find existing bookings for this flight, date, and class
    const bookings = await Booking.find({ flight, journeyDate, seatClass });
    const count = bookings.reduce((a, b) => a + b.passengers.length, 0);

    // Generate seat numbers
    const seatMap = {
      economy: 'E',
      'premium-economy': 'P',
      business: 'B',
      'first-class': 'A'
    };

    const seats = passengers
      .map((_, i) => `${seatMap[seatClass]}-${count + i + 1}`)
      .join(', ');

    // Create booking
    await Booking.create({ ...req.body, seats });
    
    res.json({ message: 'Booking successful' });
  } catch (err) {
    console.error('Booking Error:', err.message);
    res.status(500).json({ message: 'Booking failed' });
  }
};

/**
 * Cancel a ticket
 */
export const cancelTicket = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: 'cancelled' },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Cancel Error:', err.message);
    res.status(500).json({ message: 'Cancel failed' });
  }
};