const nodemailer = require('nodemailer');

const TENT_NAMES = { explorer: 'Explorer Tent (2 Person)', adventure: 'Adventure Tent (4 Person)', family: 'Family Dome Tent (6 Person)' };
const PRICES = { explorer: 299, adventure: 499, family: 699 };

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getDays(start, end) {
  return Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
}

// Send booking confirmation email to customer
async function sendBookingConfirmation(booking) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('⚠️  Email not configured — skipping email send');
    return false;
  }

  const days = getDays(booking.startDate, booking.endDate);
  const upiId = process.env.UPI_ID || 'camprent@upi';
  const upiName = process.env.UPI_NAME || 'Hyderabad Camping Tent Rentals';

  const isUPI = booking.paymentMethod === 'upi';
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${booking.totalPrice}&cu=INR&tn=Booking ${booking.bookingId}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#f5f6f8;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1A2332,#243447);padding:36px 32px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:8px;">⛺</div>
        <h1 style="color:#ffffff;margin:0;font-size:1.5rem;font-weight:800;">Booking Confirmed!</h1>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:0.95rem;">Hyderabad Camping Tent Rentals</p>
      </div>

      <!-- Booking ID Banner -->
      <div style="background:#EBF2FA;padding:16px 32px;text-align:center;border-bottom:1px solid #E2E6EC;">
        <p style="margin:0;color:#6B7280;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Booking ID</p>
        <p style="margin:6px 0 0;font-size:1.4rem;font-weight:800;color:#3A6EA5;font-family:monospace;">${booking.bookingId}</p>
      </div>

      <!-- Greeting -->
      <div style="padding:28px 32px 0;">
        <p style="color:#1A2332;font-size:1rem;">Hi <strong>${booking.name}</strong>,</p>
        <p style="color:#6B7280;line-height:1.6;">Your tent rental booking has been received! We will confirm the booking and contact you shortly. Save this email for your records.</p>
      </div>

      <!-- Booking Details -->
      <div style="padding:20px 32px;">
        <h3 style="color:#1A2332;font-size:1rem;font-weight:800;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.06em;">📋 Booking Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:10px 0;color:#6B7280;font-size:0.88rem;width:40%;">Tent Type</td>
            <td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${TENT_NAMES[booking.tentType] || booking.tentType}</td>
          </tr>
          <tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:10px 0;color:#6B7280;font-size:0.88rem;">Number of Tents</td>
            <td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${booking.numberOfTents}</td>
          </tr>
          <tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:10px 0;color:#6B7280;font-size:0.88rem;">Start Date</td>
            <td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${formatDate(booking.startDate)}</td>
          </tr>
          <tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:10px 0;color:#6B7280;font-size:0.88rem;">End Date</td>
            <td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${formatDate(booking.endDate)}</td>
          </tr>
          <tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:10px 0;color:#6B7280;font-size:0.88rem;">Duration</td>
            <td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${days} day${days > 1 ? 's' : ''}</td>
          </tr>
          <tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:10px 0;color:#6B7280;font-size:0.88rem;">Delivery</td>
            <td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${booking.deliveryOption === 'delivery' ? '🚚 Home Delivery' : '🏪 Self Pickup'}</td>
          </tr>
          ${booking.address ? `<tr style="border-bottom:1px solid #F0F2F5;"><td style="padding:10px 0;color:#6B7280;font-size:0.88rem;">Address</td><td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${booking.address}</td></tr>` : ''}
          <tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:10px 0;color:#6B7280;font-size:0.88rem;">Payment Method</td>
            <td style="padding:10px 0;color:#1A2332;font-weight:600;font-size:0.88rem;">${booking.paymentMethod === 'upi' ? '📱 UPI / Online' : '💵 Cash on Delivery'}</td>
          </tr>
        </table>
      </div>

      <!-- Total Price -->
      <div style="margin:0 32px 24px;background:#F8F9FB;border-radius:12px;padding:18px 22px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#6B7280;font-weight:600;">Total Amount</span>
        <span style="font-size:1.6rem;font-weight:800;color:#3A6EA5;">₹${booking.totalPrice.toLocaleString('en-IN')}</span>
      </div>

      <!-- UPI Payment Section -->
      ${isUPI ? `
      <div style="margin:0 32px 24px;background:#EBF2FA;border-radius:12px;padding:20px 22px;text-align:center;border:2px dashed #3A6EA5;">
        <p style="margin:0 0 8px;font-weight:800;color:#1A2332;font-size:1rem;">💳 Pay via UPI</p>
        <p style="margin:0 0 12px;color:#6B7280;font-size:0.88rem;">Scan QR or click the link to pay</p>
        <p style="margin:0 0 12px;font-size:1.1rem;font-weight:700;color:#3A6EA5;font-family:monospace;">${upiId}</p>
        <a href="${upiLink}" style="display:inline-block;background:#3A6EA5;color:white;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.9rem;">Open UPI App to Pay ₹${booking.totalPrice}</a>
        <p style="margin:12px 0 0;color:#9BA3AF;font-size:0.78rem;">After payment, share transaction ID with us on WhatsApp: +91 9381704244</p>
      </div>` : `
      <div style="margin:0 32px 24px;background:#F0FDF4;border-radius:12px;padding:16px 22px;border:1px solid #BBF7D0;">
        <p style="margin:0;color:#059669;font-size:0.9rem;"><strong>💵 Cash Payment:</strong> Pay the amount at the time of delivery or pickup. No advance required.</p>
      </div>`}

      <!-- Contact -->
      <div style="padding:0 32px 28px;">
        <p style="color:#6B7280;font-size:0.88rem;line-height:1.6;">Questions? Contact us:</p>
        <p style="margin:0;"><a href="tel:+919381704244" style="color:#3A6EA5;font-weight:700;text-decoration:none;">📞 +91 93817 04244</a> &nbsp;|&nbsp; <a href="https://wa.me/919381704244" style="color:#25D366;font-weight:700;text-decoration:none;">💬 WhatsApp</a></p>
      </div>

      <!-- Footer -->
      <div style="background:#F8F9FB;padding:20px 32px;text-align:center;border-top:1px solid #E2E6EC;">
        <p style="margin:0;color:#9BA3AF;font-size:0.8rem;">Hyderabad Camping Tent Rentals • Hyderabad, Telangana</p>
        <p style="margin:6px 0 0;color:#9BA3AF;font-size:0.78rem;">This is an automated receipt. Please save it for your records.</p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Hyderabad Camping Tent Rentals'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: booking.email,
      subject: `✅ Booking Confirmed – ${booking.bookingId} | Hyderabad Camping Tent Rentals`,
      html
    });
    console.log(`📧 Receipt email sent to ${booking.email}`);
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

// Send cancellation email
async function sendCancellationEmail(booking) {
  const transporter = createTransporter();
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Hyderabad Camping Tent Rentals'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: booking.email,
      subject: `❌ Booking Cancelled – ${booking.bookingId}`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#DC2626;">Booking Cancelled</h2>
        <p>Hi <strong>${booking.name}</strong>,</p>
        <p>Your booking <strong>${booking.bookingId}</strong> has been cancelled.</p>
        ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
        <p>If you have any questions, call us at <a href="tel:+919381704244">+91 93817 04244</a>.</p>
        <p>We hope to see you soon! 🏕️</p>
      </div>`
    });
    return true;
  } catch (err) {
    console.error('Cancellation email error:', err.message);
    return false;
  }
}

module.exports = { sendBookingConfirmation, sendCancellationEmail };
