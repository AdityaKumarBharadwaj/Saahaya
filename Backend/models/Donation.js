const mongoose = require('mongoose');
const crypto = require('crypto');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

const Counter = mongoose.model('Counter', counterSchema);

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
      orderId: String,
      paymentId: String,
      signature: String,
      method: String,
      status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
      }
    },

    taxReceipt: {
      receiptNumber: {
        type: String,
        sparse: true 
      },
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

    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// INDEXES
donationSchema.index({ donor: 1, createdAt: -1 });  // For donor's donation history
donationSchema.index({ ngo: 1, createdAt: -1 });    // For NGO's received donations
donationSchema.index({ createdAt: 1 });              // For date range queries
donationSchema.index({ 'taxReceipt.receiptNumber': 1 }, { unique: true, sparse: true });  // Unique receipts

donationSchema.pre('save', async function(next) {
  if (this.paymentDetails.status === 'success' && !this.taxReceipt.receiptNumber) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        const counterName = `receipt-${dateStr}`;
        const counter = await Counter.findOneAndUpdate(
          { name: counterName },
          { $inc: { seq: 1 } },
          { 
            new: true, 
            upsert: true,
            setDefaultsOnInsert: true 
          }
        );
        
        this.taxReceipt.receiptNumber = `REC-${dateStr}-${String(counter.seq).padStart(5, '0')}`;
        this.taxReceipt.generatedAt = Date.now();
        
        break;  // Success
        
      } catch (error) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          const now = new Date();
          const year = now.getUTCFullYear();
          const month = String(now.getUTCMonth() + 1).padStart(2, '0');
          const day = String(now.getUTCDate()).padStart(2, '0');
          const dateStr = `${year}${month}${day}`;
          const uniqueId = crypto.randomBytes(4).toString('hex').toUpperCase();
          
          this.taxReceipt.receiptNumber = `REC-${dateStr}-${uniqueId}`;
          this.taxReceipt.generatedAt = Date.now();
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }
  }
  
  next();
});

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;