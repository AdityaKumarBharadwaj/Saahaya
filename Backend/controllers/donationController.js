const Donation = require('../models/Donation');
const NGO = require('../models/NGO');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// @desc    Create Razorpay order
// @route   POST /api/donations/create-order
// @access  Private (logged in users)
const createOrder = async (req, res) => {
  try {
    const { ngoId, amount, message, isAnonymous } = req.body;
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount is ₹10'
      });
    }
    const ngo = await NGO.findById(ngoId);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    if (ngo.verificationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This NGO is not verified yet. Cannot accept donations.'
      });
    }

    if (!ngo.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This NGO is not accepting donations currently'
      });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        ngoId: ngoId,
        donorId: req.user.id,
        isAnonymous: isAnonymous || false
      }
    };

    const order = await razorpay.orders.create(options);

    const donation = await Donation.create({
      donor: req.user.id,
      ngo: ngoId,
      amount: amount,
      message: message,
      isAnonymous: isAnonymous || false,
      paymentDetails: {
        orderId: order.id,
        status: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      donationId: donation._id
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/donations/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId
    } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
      
    if (expectedSignature === razorpay_signature) {
      const donation = await Donation.findById(donationId);

      if (!donation) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }
      donation.paymentDetails.paymentId = razorpay_payment_id;
      donation.paymentDetails.signature = razorpay_signature;
      donation.paymentDetails.status = 'success';

      await donation.save(); 
      await NGO.findByIdAndUpdate(donation.ngo, {
        $inc: {
          totalReceived: donation.amount,
          balance: donation.amount,
          donorCount: 1
        }
      });

      await donation.populate('donor', 'name email');
      await donation.populate('ngo', 'name cause');

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        donation: donation
      });

    } else {

      await Donation.findByIdAndUpdate(donationId, {
        'paymentDetails.status': 'failed',
        'paymentDetails.paymentId': razorpay_payment_id
      });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// @desc    Get my donation history
// @route   GET /api/donations/my-donations
// @access  Private
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      donor: req.user.id,
      'paymentDetails.status': 'success'
    })
      .populate('ngo', 'name logo cause')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Get donations received by my NGO
// @route   GET /api/donations/ngo-donations
// @access  Private (NGO role)
const getNGODonations = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ user: req.user.id });

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'You have not created an NGO profile'
      });
    }

    const donations = await Donation.find({
      ngo: ngo._id,
      'paymentDetails.status': 'success'
    })
      .populate('donor', 'name email')
      .sort({ createdAt: -1 });

    const total = donations.reduce((sum, donation) => sum + donation.amount, 0);

    res.status(200).json({
      success: true,
      count: donations.length,
      totalAmount: total,
      data: donations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single donation details
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('ngo', 'name cause logo');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const ngo = await NGO.findById(donation.ngo);

    if (
      donation.donor.toString() !== req.user.id &&
      ngo.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this donation'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyDonations,
  getNGODonations,
  getDonationById
};