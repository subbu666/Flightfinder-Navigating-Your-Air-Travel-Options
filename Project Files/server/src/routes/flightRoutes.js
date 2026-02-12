// src/routes/flightRoutes.js
import express from 'express';
import {
  addFlight,
  updateFlight,
  getAllFlights,
  getFlightById
} from '../controllers/flightController.js';

const router = express.Router();

// Flight routes
router.post('/add-flight', addFlight);
router.put('/update-flight', updateFlight);
router.get('/fetch-flights', getAllFlights);
router.get('/fetch-flight/:id', getFlightById);

export default router;