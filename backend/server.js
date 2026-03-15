require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/tents', require('./routes/tents'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hyderabad Camping Tent Rentals API is running 🏕️' });
});

// Serve frontend pages
app.get('/tents', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/tents.html'));
});
app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/booking.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🏕️  Hyderabad Camping Tent Rentals`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API ready at http://localhost:${PORT}/api\n`);
});
