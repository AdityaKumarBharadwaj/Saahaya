const Razorpay = require('razorpay');

// Lazy initialization — only create the instance when keys are present.
// This prevents server crash on startup if env vars are not yet configured.
let razorpayInstance = null;

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('REPLACE')) {
    throw new Error('Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  return razorpayInstance;
};

module.exports = getRazorpay;