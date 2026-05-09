const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true
    },

    amount: {
      type: Number,
      required: [true, 'Please provide donation amount'],
      min: [10, 'Minimum donation amount is ₹10']
    },

    currency: {
      type: String,
      default: 'INR'
    },

  
    paymentDetails: {
      orderId: String,           // Razorpay order ID
      paymentId: String,         // Razorpay payment ID
      signature: String,         // Razorpay signature (for verification)
      method: String,            // UPI, Card, NetBanking, etc.
      status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
      }
    },

    taxReceipt: {
      receiptNumber: String,    
      receiptUrl: String,        
      section80G: {
        type: Boolean,
        default: true
      },
      generatedAt: Date
    },

    isAnonymous: {
      type: Boolean,
      default: false
    },

    // Optional Message
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

donationSchema.pre('save', async function(next) {
  
  if (this.paymentDetails.status === 'success' && !this.taxReceipt.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    
    this.taxReceipt.receiptNumber = `REC-${year}${month}${day}-${String(count + 1).padStart(5, '0')}`;
    this.taxReceipt.generatedAt = Date.now();
  }
  
  next();
});

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;