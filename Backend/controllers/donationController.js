const Donation = require('../models/Donation');
const NGO = require('../models/NGO');
const User = require('../models/User');
const getRazorpay = require('../config/razorpay');
const crypto = require('crypto');
const { generateReceiptPDF } = require('../services/pdfService');
const { sendDonationReceiptEmail } = require('../services/emailService');

// @desc    Create Razorpay order
// @route   POST /api/donations/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { ngoId, amount, message, isAnonymous } = req.body;

    if (!ngoId) {
      return res.status(400).json({ success: false, message: 'Please provide NGO ID' });
    }

    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount is ₹10'
      });
    }

    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
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
      amount: amount * 100,       // Razorpay expects paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        ngoId: ngoId,
        donorId: req.user.id,
        isAnonymous: isAnonymous || false
      }
    };

    const order = await getRazorpay().orders.create(options);

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

// @desc    Verify Razorpay payment, generate receipt PDF & send email
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

    // ── HMAC signature verification ──────────────────────────────────
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Donation.findByIdAndUpdate(donationId, {
        'paymentDetails.status': 'failed',
        'paymentDetails.paymentId': razorpay_payment_id
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature'
      });
    }

    // ── Mark payment successful ──────────────────────────────────────
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.paymentDetails.paymentId = razorpay_payment_id;
    donation.paymentDetails.signature = razorpay_signature;
    donation.paymentDetails.status = 'success';

    // Saving triggers the pre-save hook in Donation model which generates receipt number
    await donation.save();

    // ── Update NGO financials atomically ─────────────────────────────
    await NGO.findByIdAndUpdate(donation.ngo, {
      $inc: {
        totalReceived: donation.amount,
        balance: donation.amount,
        donorCount: 1
      }
    });

    // ── Populate for PDF + email ──────────────────────────────────────
    await donation.populate('donor', 'name email phone');
    await donation.populate('ngo', 'name cause');

    // ── Generate PDF receipt ──────────────────────────────────────────
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateReceiptPDF(donation, donation.donor, donation.ngo);

      // Store PDF URL placeholder (in a real prod deployment, upload PDF to Cloudinary)
      donation.taxReceipt.receiptUrl = `/api/donations/${donation._id}/download-receipt`;
      await donation.save();
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }

    // ── Send receipt email with PDF attachment ────────────────────────
    if (pdfBuffer) {
      sendDonationReceiptEmail(donation.donor, donation, donation.ngo, pdfBuffer).catch((err) =>
        console.error('Receipt email failed:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      donation: donation
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// @desc    Download 80G PDF receipt
// @route   GET /api/donations/:id/download-receipt
// @access  Private
const downloadReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone')
      .populate('ngo', 'name cause');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Authorization: only the donor, the NGO owner, or admin can download
    const ngo = await NGO.findById(donation.ngo._id);
    if (
      donation.donor._id.toString() !== req.user.id &&
      ngo.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this receipt' });
    }

    if (donation.paymentDetails.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Receipt not available — payment not completed' });
    }

    // Generate the PDF on-the-fly
    const pdfBuffer = await generateReceiptPDF(donation, donation.donor, donation.ngo);

    const filename = `${donation.taxReceipt.receiptNumber || 'receipt'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: error.message
    });
  }
};

// @desc    Get donor's own donation history
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

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const taxSaving = Math.round(totalDonated * 0.5);

    res.status(200).json({
      success: true,
      count: donations.length,
      totalDonated,
      taxSaving,
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

// @desc    Get donations received by logged-in NGO
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
      donation.donor._id.toString() !== req.user.id &&
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
  downloadReceipt,
  getMyDonations,
  getNGODonations,
  getDonationById
};