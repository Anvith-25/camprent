const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: [true, 'Customer name is required'], trim: true, maxlength: 100 },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Valid email required'] },
  tentType: { type: String, required: true, enum: ['explorer', 'adventure', 'family'] },
  numberOfTents: { type: Number, required: true, min: 1, max: 10 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  deliveryOption: { type: String, enum: ['delivery', 'pickup'], required: true },
  address: { type: String, trim: true, maxlength: 300 },
  notes: { type: String, trim: true, maxlength: 500 },

  // Payment
  paymentMethod: { type: String, enum: ['cash', 'upi'], default: 'cash' },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  paymentAmount: { type: Number, default: 0 },
  upiTransactionId: { type: String, trim: true },

  // Booking status
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  cancelledBy: { type: String, enum: ['customer', 'admin', null], default: null },
  cancellationReason: { type: String, trim: true, maxlength: 300 },
  cancelledAt: { type: Date },

  adminNotes: { type: String, trim: true, maxlength: 500 },
  totalPrice: { type: Number },
  bookingId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate price with updated rates
bookingSchema.pre('save', function(next) {
  const pricePerDay = { explorer: 299, adventure: 499, family: 699 };
  const days = Math.max(1, Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)));
  this.totalPrice = pricePerDay[this.tentType] * this.numberOfTents * days;
  if (!this.bookingId) {
    this.bookingId = 'HCR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
