// SMS via Fast2SMS — free Indian SMS API
// Sign up at: https://www.fast2sms.com
// Get API key from Dashboard → Dev API

async function sendSMS(phone, message) {
  const apiKey = process.env.FAST2SMS_KEY;
  if (!apiKey) {
    console.log('⚠️  SMS not configured — skipping SMS send');
    return false;
  }

  // Clean phone number — remove +91, spaces, dashes
  const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^91/, '').slice(-10);
  if (cleanPhone.length !== 10) {
    console.log('⚠️  Invalid phone number for SMS:', phone);
    return false;
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: message.substring(0, 160),
        language: 'english',
        flash: 0,
        numbers: cleanPhone
      })
    });
    const data = await response.json();
    if (data.return) {
      console.log(`📱 SMS sent to ${cleanPhone}`);
      return true;
    } else {
      console.error('SMS error:', data.message);
      return false;
    }
  } catch (err) {
    console.error('SMS send error:', err.message);
    return false;
  }
}

async function sendBookingSMS(booking) {
  const TENT_NAMES = { explorer: 'Explorer (2P)', adventure: 'Adventure (4P)', family: 'Family Dome (6P)' };
  const msg = `HydCamp: Booking confirmed! ID: ${booking.bookingId}. Tent: ${TENT_NAMES[booking.tentType]}. Amount: Rs.${booking.totalPrice}. Call: 9381704244`;
  return sendSMS(booking.phone, msg);
}

async function sendCancellationSMS(booking) {
  const msg = `HydCamp: Your booking ${booking.bookingId} has been cancelled. Questions? Call 9381704244`;
  return sendSMS(booking.phone, msg);
}

module.exports = { sendBookingSMS, sendCancellationSMS };
