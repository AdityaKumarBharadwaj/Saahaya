const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: [true, 'please provide NGO name'],
            trim: true,
            maxLength: [100, 'Name cannot exceed 100 characters'],
        },

        registrationNumber: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        about: {
            type: String,
            maxLength: [2000, 'About section cannot exceed 2000 characters'],
            trim: true
        },

        cause: {
          type: String,
          required: [true, 'Please select a cause'],
          enum: {
            values: ['education', 'health', 'environment', 'animals', 'poverty', 'women'],
            message: 'Please select valid cause'
          }
        },

        logo: {
          type: String,
          default: 'default-ngo-logo.png'
        },

        website: {
          type: String,
          match: [
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            'Please provide valid URL'
          ]
        },

        address: {
          street: String,
          city: {
            type: String,
            required: [true, 'Please provide city']
          },
          state: {
            type: String,
            required: [true, 'Please provide state']
          },
          pincode: {
            type: String,
            required: [true, 'Please provide pincode'],
            match: [/^[0-9]{6}$/, 'Please provide valid 6-digit pincode']
          }
        },

        documents: {
          trustDeed: String,
          certificate80G: String,
          panCard: String
        },

        bankDetails: {
          accountNumber: {
            type: String,
            required: [true, 'Please provide account number']
          },
          ifscCode: {
            type: String,
            required: [true, 'Please provide IFSC code'],
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please provide valid IFSC code']
          },
          accountHolderName: {
            type: String,
            required: [true, 'Please provide account holder name']
          },
          bankName: String,
          branch: String
        },

        verificationStatus: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },

        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },

        verifiedAt: Date,

        rejectionReason: String,

        // Financial information
        totalReceived: {
          type: Number,
          default: 0
        },

        totalWithdrawn: {
          type: Number,
          default: 0
        },

        balance: {
          type: Number,
          default: 0
        },

        // Impact Metrics
        impactMetrics: {
          beneficiariesHelped: {
            type: Number,
            default: 0
          },
          projectsCompleted: {
            type: Number,
            default: 0
          }
        },

        // Ratings and Reviews
        rating: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },

        donorCount: {
          type: Number,
          default: 0
        },

        // Active Status
        isActive: {
          type: Boolean,
          default: true
        }
      },
      {
        timestamps: true
      }
    );

const NGO = mongoose.model('NGO', ngoSchema);

module.exports = NGO;