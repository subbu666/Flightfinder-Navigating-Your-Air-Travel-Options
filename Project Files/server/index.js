import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User, Booking, Flight } from './schemas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

/* =======================
   Middleware
======================= */
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   MongoDB Connection
======================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed');
    console.error(error.message);
    process.exit(1);
  }
};

connectDB();

/* =======================
   Routes
======================= */

// Register
app.post('/register', async (req, res) => {
  const { username, email, usertype, password } = req.body;
  let approval = usertype === 'flight-operator' ? 'not-approved' : 'approved';

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      usertype,
      password: hashedPassword,
      approval
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json(user);
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve operator
app.post('/approve-operator', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.id, { approval: 'approved' });
    res.json({ message: 'Approved!' });
  } catch (err) {
    console.error('Approve Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject operator
app.post('/reject-operator', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.id, { approval: 'rejected' });
    res.json({ message: 'Rejected!' });
  } catch (err) {
    console.error('Reject Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch users
app.get('/fetch-users', async (_, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Fetch Users Error:', err.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Fetch user
app.get('/fetch-user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    console.error('Fetch User Error:', err.message);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Add flight
app.post('/add-flight', async (req, res) => {
  try {
    const {
      flightName,
      flightId,
      origin,
      destination,
      journeyDate,
      departureTime,
      arrivalTime,
      basePrice,
      totalSeats
    } = req.body;

    if (
      !flightName ||
      !flightId ||
      !origin ||
      !destination ||
      !journeyDate ||
      !departureTime ||
      !arrivalTime ||
      !basePrice ||
      !totalSeats
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await Flight.create({
      flightName,
      flightId,
      origin,
      destination,
      journeyDate: new Date(journeyDate), // ✅ important
      departureTime,
      arrivalTime,
      basePrice,
      totalSeats
    });

    res.json({ message: 'Flight added successfully' });
  } catch (err) {
    console.error('Add Flight Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Update flight
app.put('/update-flight', async (req, res) => {
  try {
    await Flight.findByIdAndUpdate(req.body._id, req.body);
    res.json({ message: 'Flight updated successfully' });
  } catch (err) {
    console.error('Update Flight Error:', err.message);
    res.status(500).json({ message: 'Error updating flight' });
  }
});

// ✅ FIX: Fetch flights — now properly filters by journeyDate when ?date= is provided.
// Previously this ignored the query param entirely and dumped all flights.
// Now it builds a UTC date range for the requested day so MongoDB matches correctly.
app.get('/fetch-flights', async (req, res) => {
  try {
    let flights;
    if (req.query.date) {
      // req.query.date arrives as "YYYY-MM-DD" from the frontend date picker.
      // We build a full-day UTC range so the $gte/$lte query matches the
      // journeyDate field (which is stored as a Date at midnight UTC).
      const start = new Date(req.query.date + 'T00:00:00.000Z');
      const end   = new Date(req.query.date + 'T23:59:59.999Z');
      flights = await Flight.find({ journeyDate: { $gte: start, $lte: end } });
    } else {
      // No date param provided — return everything (used by admin panels etc.)
      flights = await Flight.find();
    }
    res.json(flights);
  } catch (err) {
    console.error('Fetch Flights Error:', err.message);
    res.status(500).json({ message: 'Error fetching flights' });
  }
});

// Fetch flight
app.get('/fetch-flight/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    res.json(flight);
  } catch (err) {
    console.error('Fetch Flight Error:', err.message);
    res.status(500).json({ message: 'Error fetching flight' });
  }
});

// Fetch bookings
app.get('/fetch-bookings', async (_, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error('Fetch Bookings Error:', err.message);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Book ticket
app.post('/book-ticket', async (req, res) => {
  try {
    const { flight, journeyDate, seatClass, passengers } = req.body;

    const bookings = await Booking.find({ flight, journeyDate, seatClass });
    const count = bookings.reduce((a, b) => a + b.passengers.length, 0);

    const seatMap = {
      economy: 'E',
      'premium-economy': 'P',
      business: 'B',
      'first-class': 'A'
    };

    const seats = passengers
      .map((_, i) => `${seatMap[seatClass]}-${count + i + 1}`)
      .join(', ');

    await Booking.create({ ...req.body, seats });
    res.json({ message: 'Booking successful' });
  } catch (err) {
    console.error('Booking Error:', err.message);
    res.status(500).json({ message: 'Booking failed' });
  }
});

// Cancel ticket
app.put('/cancel-ticket/:id', async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, {
      bookingStatus: 'cancelled'
    });
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Cancel Error:', err.message);
    res.status(500).json({ message: 'Cancel failed' });
  }
});

/* =======================
   Server
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});