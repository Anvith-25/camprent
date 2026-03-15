require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().then(() => seedAdmin());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/tents',    require('./routes/tents'));
app.use('/api/users',    require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/tents',    (req, res) => res.sendFile(path.join(__dirname, '../frontend/tents.html')));
app.get('/booking',  (req, res) => res.sendFile(path.join(__dirname, '../frontend/booking.html')));
app.get('/login',    (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/register.html')));
app.get('/dashboard',(req, res) => res.sendFile(path.join(__dirname, '../frontend/dashboard.html')));
app.get('/admin',    (req, res) => res.sendFile(path.join(__dirname, '../frontend/admin.html')));
app.get('/',         (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ success: false, message: 'Internal server error.' }); });

async function seedAdmin() {
  try {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@camprent.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2025';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({ name: 'Admin', email: adminEmail, phone: '+91 9381704244', password: adminPassword, role: 'admin' });
      console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
    }
  } catch (e) {}
}

app.listen(PORT, () => {
  console.log(`\n🏕️  Hyderabad Camping Tent Rentals`);
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📡 API:    http://localhost:${PORT}/api\n`);
});
