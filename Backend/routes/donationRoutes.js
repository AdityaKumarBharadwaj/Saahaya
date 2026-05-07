// Step 1: Import Express Router
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getMyDonations,
  getNGODonations,
  getDonationById
} = require('../controllers/donationController');

router.post('/create-order', protect, createOrder);

// POST /api/donations/verify
router.post('/verify', protect, verifyPayment);

// GET /api/donations/my-donations
router.get('/my-donations', protect, getMyDonations);

// GET /api/donations/ngo-donations
router.get('/ngo-donations', protect, authorize('ngo'), getNGODonations);

// GET /api/donations/:id
router.get('/:id', protect, getDonationById);


module.exports = router;