// src/models/Flight.js
import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  flightName: { type: String, required: true },
  flightId: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  journeyDate: { type: Date, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  basePrice: { type: Number, required: true },
  totalSeats: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Flight', flightSchema);