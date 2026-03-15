const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      name, phone, email, tentType, numberOfTents,
      startDate, endDate, deliveryOption, address, notes
    } = req.body;

    // Validation
    if (!name || !phone || !email || !tentType || !numberOfTents || !startDate || !endDate || !deliveryOption) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date.' });
    }
    if (deliveryOption === 'delivery' && !address) {
      return res.status(400).json({ success: false, message: 'Delivery address is required.' });
    }

    const booking = await Booking.create({
      name, phone, email, tentType,
      numberOfTents: parseInt(numberOfTents),
      startDate: start, endDate: end,
      deliveryOption, address, notes
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed! We will contact you shortly.',
      booking: {
        bookingId: booking.bookingId,
        name: booking.name,
        tentType: booking.tentType,
        numberOfTents: booking.numberOfTents,
        startDate: booking.startDate,
        endDate: booking.endDate,
        deliveryOption: booking.deliveryOption,
        totalPrice: booking.totalPrice,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/bookings - Get all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(filter);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.id },
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
