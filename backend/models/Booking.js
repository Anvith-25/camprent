const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+\d\s-]{7,15}$/, 'Please provide a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  tentType: {
    type: String,
    required: [true, 'Tent type is required'],
    enum: ['explorer', 'adventure', 'family'],
  },
  numberOfTents: {
    type: Number,
    required: [true, 'Number of tents is required'],
    min: [1, 'At least 1 tent required'],
    max: [10, 'Maximum 10 tents per booking']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  deliveryOption: {
    type: String,
    enum: ['delivery', 'pickup'],
    required: [true, 'Delivery option is required']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  totalPrice: {
    type: Number
  },
  bookingId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total price and generate booking ID before saving
bookingSchema.pre('save', function(next) {
  const pricePerDay = { explorer: 399, adventure: 699, family: 999 };
  const days = Math.max(1, Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)));
  this.totalPrice = pricePerDay[this.tentType] * this.numberOfTents * days;

  if (!this.bookingId) {
    this.bookingId = 'HCR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
