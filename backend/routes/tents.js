const express = require('express');
const router = express.Router();
const tents = require('../models/tents');

// GET /api/tents - Return all tents
router.get('/', (req, res) => {
  res.json({ success: true, count: tents.length, tents });
});

// GET /api/tents/:id - Return single tent
router.get('/:id', (req, res) => {
  const tent = tents.find(t => t.id === req.params.id);
  if (!tent) {
    return res.status(404).json({ success: false, message: 'Tent not found.' });
  }
  res.json({ success: true, tent });
});

module.exports = router;
