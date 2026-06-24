const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createOrder,
  verifyPayment,
  downloadReceipt,
  getMyDonations,
  getNGODonations,
  getDonationById
} = require('../controllers/donationController');

// POST /api/donations/create-order
router.post('/create-order', protect, createOrder);

// POST /api/donations/verify
router.post('/verify', protect, verifyPayment);

// GET /api/donations/my-donations  ← must be BEFORE /:id
router.get('/my-donations', protect, getMyDonations);

// GET /api/donations/ngo-donations  ← must be BEFORE /:id
router.get('/ngo-donations', protect, authorize('ngo'), getNGODonations);

// GET /api/donations/:id/download-receipt
router.get('/:id/download-receipt', protect, downloadReceipt);

// GET /api/donations/:id
router.get('/:id', protect, getDonationById);

module.exports = router;