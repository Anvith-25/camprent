const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');
const { sendBookingConfirmation, sendCancellationEmail } = require('../services/emailService');
const { sendBookingSMS, sendCancellationSMS } = require('../services/smsService');

// POST /api/bookings — create booking
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, email, tentType, numberOfTents, startDate, endDate, deliveryOption, address, notes, paymentMethod, upiTransactionId } = req.body;

    if (!name || !phone || !email || !tentType || !numberOfTents || !startDate || !endDate || !deliveryOption) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }
    const start = new Date(startDate), end = new Date(endDate);
    const today = new Date(); today.setHours(0,0,0,0);
    if (start < today) return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
    if (end <= start) return res.status(400).json({ success: false, message: 'End date must be after start date.' });
    if (deliveryOption === 'delivery' && !address) return res.status(400).json({ success: false, message: 'Delivery address is required.' });

    const booking = await Booking.create({
      user: req.user._id, name, phone, email, tentType,
      numberOfTents: parseInt(numberOfTents),
      startDate: start, endDate: end, deliveryOption, address, notes,
      paymentMethod: paymentMethod || 'cash',
      upiTransactionId: upiTransactionId || undefined
    });

    // Send email receipt + SMS (non-blocking)
    sendBookingConfirmation(booking).catch(console.error);
    sendBookingSMS(booking).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed! Receipt sent to your email and phone.',
      booking: {
        bookingId: booking.bookingId, name: booking.name,
        tentType: booking.tentType, numberOfTents: booking.numberOfTents,
        startDate: booking.startDate, endDate: booking.endDate,
        deliveryOption: booking.deliveryOption, totalPrice: booking.totalPrice,
        status: booking.status, paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod
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

// GET /api/bookings/stats — admin stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'pending' });
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });
    const completed = await Booking.countDocuments({ status: 'completed' });
    const unpaid = await Booking.countDocuments({ paymentStatus: 'unpaid', status: { $ne: 'cancelled' } });
    const paid = await Booking.countDocuments({ paymentStatus: 'paid' });
    const revenueResult = await Booking.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const totalRevenue = revenueResult[0]?.total || 0;
    const recent = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
    res.json({ success: true, stats: { total, pending, confirmed, cancelled, completed, unpaid, paid, totalRevenue }, recent });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET /api/bookings
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') filter.user = req.user._id;
    const { status, payment, page = 1, limit = 50 } = req.query;
    if (status) filter.status = status;
    if (payment) filter.paymentStatus = payment;
    const bookings = await Booking.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await Booking.countDocuments(filter);
    res.json({ success: true, count, bookings });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id }).populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (req.user.role !== 'admin' && booking.user?._id?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });
    res.json({ success: true, booking });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// PATCH /api/bookings/:id — admin updates (Feature 7: payment confirm auto-updates status)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus, paymentAmount, adminNotes, upiTransactionId } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
      // Feature 7: auto-confirm booking when payment is marked paid
      if (paymentStatus === 'paid') updates.status = 'confirmed';
    }
    if (paymentAmount !== undefined) updates.paymentAmount = paymentAmount;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (upiTransactionId !== undefined) updates.upiTransactionId = upiTransactionId;

    const booking = await Booking.findOneAndUpdate({ bookingId: req.params.id }, updates, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, booking });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// PATCH /api/bookings/:id/cancel — customer cancels their own booking (Feature 8)
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Only booking owner or admin can cancel
    if (req.user.role !== 'admin' && booking.user?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });

    if (booking.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    if (booking.status === 'completed')
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking.' });

    booking.status = 'cancelled';
    booking.cancelledBy = req.user.role === 'admin' ? 'admin' : 'customer';
    booking.cancellationReason = reason || 'No reason provided';
    booking.cancelledAt = new Date();
    await booking.save();

    // Send cancellation notifications
    sendCancellationEmail(booking).catch(console.error);
    sendCancellationSMS(booking).catch(console.error);

    res.json({ success: true, message: 'Booking cancelled successfully.', booking });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

// DELETE /api/bookings/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, message: 'Booking deleted.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error.' }); }
});

module.exports = router;
