const express = require('express');
const router = express.Router();
const tents = require('../models/tents');

// GET /api/tents/config — return UPI config for frontend
router.get('/config', (req, res) => {
  res.json({
    success: true,
    upiId: process.env.UPI_ID || 'camprent@upi',
    upiName: process.env.UPI_NAME || 'Hyderabad Camping Tent Rentals'
  });
});

router.get('/', (req, res) => {
  res.json({ success: true, count: tents.length, tents });
});

router.get('/:id', (req, res) => {
  const tent = tents.find(t => t.id === req.params.id);
  if (!tent) return res.status(404).json({ success: false, message: 'Tent not found.' });
  res.json({ success: true, tent });
});

module.exports = router;
