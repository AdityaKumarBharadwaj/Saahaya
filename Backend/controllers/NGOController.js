const NGO = require("../models/NGO");
const User = require("../models/User");

// public routes
const getAllNGOs = async (req, res) => {
  try {
    const { cause, city, search } = req.query;

    let query = {
      verificationStatus: 'approved',
      isActive: true
    }

    if (cause) {
      query.cause = cause;
    }

    if (city) {
      query['address.city'] = city;
    }


    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const ngos = await NGO.find(query).populate('user', 'name email phone').select('-documents -bankDetails').sort({ rating: -1, donorCount: -1 });
    if (!ngos) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

const getNGOById = async (req, res) => {
  try {

    const { id } = req.params;

    const ngo = await NGO.findById(id)
      .populate('user', 'name email phone')
      .select('-documents -bankDetails');


    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ngo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// protected routes

const createNGO = async (req, res) => {
  try {
    const existingNGO = await NGO.findOne({ user: req.user.id });

    if (existingNGO) {
      return res.status(400).json({
        success: false,
        message: 'You already have an NGO profile'
      });
    }

    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGO accounts can create NGO profiles'
      });
    }

    const {
      name,
      registrationNumber,
      about,
      cause,
      website,
      address,
      bankDetails
    } = req.body;

    const ngo = await NGO.create({
      user: req.user.id,
      name,
      registrationNumber,
      about,
      cause,
      website,
      address,
      bankDetails
    });

    await ngo.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'NGO profile created successfully. Awaiting verification.',
      data: ngo
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'NGO with this registration number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updateNGO = async (req, res) => {
  try {

    let ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }


    if (ngo.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this NGO'
      });
    }


    ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email phone');


    res.status(200).json({
      success: true,
      message: 'NGO updated successfully',
      data: ngo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const getMyNGO = async (req, res) => {
  try {

    const ngo = await NGO.findOne({ user: req.user.id })
      .populate('user', 'name email phone');

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'You have not created an NGO profile yet'
      });
    }

    res.status(200).json({
      success: true,
      data: ngo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};





// Admin routes
const approveNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    ngo.verificationStatus = 'approved';
    ngo.verifiedBy = req.user.id;
    ngo.verifiedAt = Date.now();
    ngo.rejectionReason = undefined;

    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'NGO approved successfully',
      data: ngo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const rejectNGO = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rejection reason'
      });
    }

    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    ngo.verificationStatus = 'rejected';
    ngo.verifiedBy = req.user.id;
    ngo.verifiedAt = Date.now();
    ngo.rejectionReason = reason;

    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'NGO rejected',
      data: ngo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getPendingNGOs = async (req, res) => {
  try {
    const pendingNGOs = await NGO.find({ verificationStatus: 'pending' })
      .populate('user', 'name email phone')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: pendingNGOs.length,
      data: pendingNGOs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const uploadDocuments = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    if (ngo.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents for this NGO'
      });
    }
    if (req.files) {
      if (req.files.trustDeed) {
        ngo.documents.trustDeed = req.files.trustDeed[0].path;
      }
      if (req.files.certificate80G) {
        ngo.documents.certificate80G = req.files.certificate80G[0].path;
      }
      if (req.files.panCard) {
        ngo.documents.panCard = req.files.panCard[0].path;
      }
    }
    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: ngo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload NGO logo
// @route   PUT /api/ngos/:id/upload-logo
// @access  Private (NGO owner)
const uploadLogo = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    if (ngo.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload logo for this NGO'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a logo'
      });
    }

    ngo.logo = req.file.path;

    await ngo.save();
    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: ngo
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
  getAllNGOs,
  getNGOById,
  createNGO,
  updateNGO,
  getMyNGO,
  approveNGO,
  rejectNGO,
  getPendingNGOs,
  uploadDocuments,
  uploadLogo 
};