# ⛺ Hyderabad Camping Tent Rentals

A full-stack camping tent rental platform for Hyderabad, India.

## Tech Stack

| Layer    | Technology           |
|----------|----------------------|
| Frontend | HTML5, CSS3, Vanilla JS (3 pages) |
| Backend  | Node.js + Express.js |
| Database | MongoDB + Mongoose   |
| API      | REST API             |

---

## Project Structure

```
hyderabad-camping-tent-rentals/
├── frontend/
│   ├── index.html        ← Home page (hero, features, services, tents preview, testimonials, contact)
│   ├── tents.html        ← Full tent catalog with comparison table
│   ├── booking.html      ← Booking form with live price summary
│   ├── styles.css        ← Shared stylesheet (all 3 pages)
│   └── script.js         ← Shared JS (form logic, API calls, animations)
│
├── backend/
│   ├── server.js         ← Express app entry point
│   ├── config/
│   │   └── db.js         ← MongoDB connection
│   ├── models/
│   │   ├── Booking.js    ← Mongoose booking schema
│   │   └── tents.js      ← Tent catalog data
│   └── routes/
│       ├── bookings.js   ← POST/GET /api/bookings
│       └── tents.js      ← GET /api/tents
│
├── .env.example          ← Environment variable template
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** Community Server → https://www.mongodb.com/try/download/community
  - OR use **MongoDB Atlas** (free cloud) → https://www.mongodb.com/atlas

---

### 2. Install Dependencies

```bash
# Clone / download the project
cd hyderabad-camping-tent-rentals

# Install Node packages
npm install
```

---

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/camprent
NODE_ENV=development
```

**If using MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/camprent?retryWrites=true&w=majority
```

---

### 4. Start MongoDB (Local)

```bash
# macOS / Linux
mongod --dbpath /usr/local/var/mongodb

# Windows (run as Administrator)
mongod --dbpath "C:\data\db"
```

Or start the MongoDB service:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB
```

---

### 5. Run the Server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🏕️  Hyderabad Camping Tent Rentals
🚀 Server running at http://localhost:5000
📡 API ready at http://localhost:5000/api
```

---

### 6. Open the Website

Open your browser and visit:

| Page          | URL                          |
|---------------|------------------------------|
| Home          | http://localhost:5000/       |
| Tent Catalog  | http://localhost:5000/tents  |
| Book a Tent   | http://localhost:5000/booking|

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

---

### GET `/api/tents`
Returns all available tents.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "tents": [
    {
      "id": "explorer",
      "name": "Explorer Tent",
      "capacity": 2,
      "pricePerDay": 399,
      "pricePerWeek": 1999,
      "features": ["Waterproof", "UV Protection", "Easy Setup", "Carry Bag Included"],
      "description": "...",
      "badge": "Most Popular"
    }
  ]
}
```

---

### POST `/api/bookings`
Create a new booking.

**Request Body:**
```json
{
  "name": "Ravi Kumar",
  "phone": "+91 9876543210",
  "email": "ravi@example.com",
  "tentType": "adventure",
  "numberOfTents": 2,
  "startDate": "2025-04-10",
  "endDate": "2025-04-13",
  "deliveryOption": "delivery",
  "address": "123 Hitech City, Hyderabad, Telangana",
  "notes": "Please deliver before 9 AM"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking confirmed! We will contact you shortly.",
  "booking": {
    "bookingId": "HCRA1B2C3D4",
    "name": "Ravi Kumar",
    "tentType": "adventure",
    "numberOfTents": 2,
    "startDate": "2025-04-10T00:00:00.000Z",
    "endDate": "2025-04-13T00:00:00.000Z",
    "deliveryOption": "delivery",
    "totalPrice": 4194,
    "status": "pending"
  }
}
```

---

### GET `/api/bookings`
Get all bookings (admin).

**Query Params (optional):**
- `status` — filter by `pending`, `confirmed`, or `cancelled`
- `page` — page number (default: 1)
- `limit` — results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 12,
  "totalPages": 1,
  "currentPage": 1,
  "bookings": [...]
}
```

---

### GET `/api/bookings/:bookingId`
Get a single booking by its booking ID.

**Response:**
```json
{
  "success": true,
  "booking": { ... }
}
```

---

### PATCH `/api/bookings/:bookingId/status`
Update booking status.

**Request Body:**
```json
{ "status": "confirmed" }
```

---

## MongoDB Schema

### Booking Model

| Field          | Type    | Required | Notes                         |
|----------------|---------|----------|-------------------------------|
| name           | String  | ✅       | Customer full name            |
| phone          | String  | ✅       | Phone / WhatsApp number       |
| email          | String  | ✅       | Customer email                |
| tentType       | String  | ✅       | explorer / adventure / family |
| numberOfTents  | Number  | ✅       | 1 – 10                        |
| startDate      | Date    | ✅       | Rental start date             |
| endDate        | Date    | ✅       | Rental end date               |
| deliveryOption | String  | ✅       | delivery / pickup             |
| address        | String  | —        | Required if delivery          |
| notes          | String  | —        | Optional additional notes     |
| status         | String  | —        | pending / confirmed / cancelled |
| totalPrice     | Number  | —        | Auto-calculated               |
| bookingId      | String  | —        | Auto-generated (e.g. HCRA1B2)|
| createdAt      | Date    | —        | Auto-set to now               |

---

## Pricing

| Tent              | Capacity | Per Day | Per Week |
|-------------------|----------|---------|----------|
| Explorer Tent     | 2 Person | ₹399    | ₹1,999   |
| Adventure Tent    | 4 Person | ₹699    | ₹3,499   |
| Family Dome Tent  | 6 Person | ₹999    | ₹4,999   |

---

## Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Sticky navbar with smooth scrolling
- ✅ Animated hero with SVG camping illustration
- ✅ Live booking price calculator
- ✅ Form validation with inline error messages
- ✅ REST API with Express.js
- ✅ MongoDB with Mongoose schema validation
- ✅ Booking ID auto-generation
- ✅ Success modal with booking details
- ✅ WhatsApp + Call Now buttons

---

## Contact

📞 Phone: +91 93817 04244  
📍 Location: Hyderabad, Telangana  
💬 WhatsApp: https://wa.me/919381704244

---

© 2025 Hyderabad Camping Tent Rentals

---

## 🔐 Authentication System (v2)

The platform now has full JWT-based authentication with two roles.

### User Roles

| Role     | Access |
|----------|--------|
| customer | Register, Login, Book tents, View **own** bookings only |
| admin    | Everything above + View ALL bookings, Update status, Payment tracking, Delete bookings, Manage users |

---

### New Pages

| Page        | URL          | Who Can Access |
|-------------|--------------|----------------|
| Login       | /login       | Everyone       |
| Register    | /register    | Everyone       |
| Dashboard   | /dashboard   | Customers only |
| Admin Panel | /admin       | Admins only    |

---

### New API Endpoints

#### Auth
```
POST /api/auth/register   — Create new customer account
POST /api/auth/login      — Login, returns JWT token
GET  /api/auth/me         — Get current logged-in user (requires token)
POST /api/auth/logout     — Logout
```

#### Users (Admin only)
```
GET    /api/users          — Get all users
PATCH  /api/users/:id/role — Change user role
DELETE /api/users/:id      — Delete user
```

#### Bookings (Updated)
```
POST   /api/bookings       — Create booking (login required)
GET    /api/bookings       — Admin: all bookings | Customer: own bookings only
GET    /api/bookings/stats — Admin dashboard stats
GET    /api/bookings/:id   — Get single booking
PATCH  /api/bookings/:id   — Update booking (admin only)
DELETE /api/bookings/:id   — Delete booking (admin only)
```

---

### New Railway Environment Variables

Add these to Railway Variables tab:

```
JWT_SECRET      = any_long_random_string_here_eg_camprent2025xyz
JWT_EXPIRE      = 7d
ADMIN_EMAIL     = admin@camprent.com
ADMIN_PASSWORD  = Admin@2025
```

> ⚠️ Change ADMIN_EMAIL and ADMIN_PASSWORD to your own values before deploying!

---

### Default Admin Login

On first server start, an admin account is auto-created:

```
Email:    admin@camprent.com   (or your ADMIN_EMAIL)
Password: Admin@2025           (or your ADMIN_PASSWORD)
```

Go to `/login` and sign in with these credentials to access `/admin`.

