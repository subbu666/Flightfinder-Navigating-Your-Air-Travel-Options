// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler, notFound, ignoreFavicon} from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Ignore favicon requests
app.use(ignoreFavicon);

/* =======================
   Middleware
======================= */
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   Database Connection
======================= */
connectDB();

/* =======================
   API Routes
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// Backward compatibility - mount routes at root level too
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', flightRoutes);
app.use('/', bookingRoutes);

/* =======================
   Health Check / Root Route
======================= */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Flight Booking API is running',
    status: 'active',
    endpoints: {
      auth: ['/api/auth/login', '/api/auth/send-signup-otp', '/api/auth/forgot-password'],
      flights: ['/api/flights/fetch-flights', '/api/flights/add-flight'],
      bookings: ['/api/bookings/fetch-bookings', '/api/bookings/book-ticket'],
      users: ['/api/users/fetch-users', '/api/users/approve-operator']
    }
  });
});


/* =======================
   Health Check for UptimeRobot
======================= */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/* =======================
   Error Handling Middleware
======================= */
app.use(notFound);
app.use(errorHandler);

/* =======================
   Server
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

export default app;