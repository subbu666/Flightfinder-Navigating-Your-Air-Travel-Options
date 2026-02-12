// src/controllers/flightController.js
import Flight from '../models/Flight.js';

/**
 * Add a new flight
 */
export const addFlight = async (req, res) => {
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
      journeyDate: new Date(journeyDate),
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
};

/**
 * Update an existing flight
 */
export const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.body._id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.json({ message: 'Flight updated successfully' });
  } catch (err) {
    console.error('Update Flight Error:', err.message);
    res.status(500).json({ message: 'Error updating flight' });
  }
};

/**
 * Fetch all flights (with optional date filter)
 */
export const getAllFlights = async (req, res) => {
  try {
    let flights;
    
    if (req.query.date) {
      const start = new Date(req.query.date + 'T00:00:00.000Z');
      const end = new Date(req.query.date + 'T23:59:59.999Z');
      flights = await Flight.find({ 
        journeyDate: { $gte: start, $lte: end } 
      });
    } else {
      flights = await Flight.find();
    }
    
    res.json(flights);
  } catch (err) {
    console.error('Fetch Flights Error:', err.message);
    res.status(500).json({ message: 'Error fetching flights' });
  }
};

/**
 * Fetch single flight by ID
 */
export const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.json(flight);
  } catch (err) {
    console.error('Fetch Flight Error:', err.message);
    res.status(500).json({ message: 'Error fetching flight' });
  }
};