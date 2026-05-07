const express = require('express');
const router = express.Router();

const { getAllNGOs, getNGOById, createNGO, updateNGO, getMyNGO, approveNGO, rejectNGO, getPendingNGOs } = require('../controllers/ngoController');
const { protect, authorize } = require('../middlewares/authMiddleware');

//public routes
// GET /api/ngos?cause=education&city=Mumbai&search=akanksha
router.get('/', getAllNGOs);

// GET /api/ngos/:id
router.get('/:id', getNGOById);

// private route
// GET /api/ngos/me/profile
router.get('/me/profile', protect, getMyNGO);

// POST /api/ngos
router.post('/', protect, authorize('ngo'), createNGO);

//  PUT /api/ngos/:id
router.put('/:id', protect, updateNGO);

// admin routes

// Get pending NGOs for verification
// GET /api/ngo/admin/pending
router.get('/admin/pending', protect, authorize('admin'), getPendingNGOs);

// Approve NGO
// PUT /api/ngos/:id/approve
router.put('/:id/approve', protect, authorize('admin'), approveNGO);

// Reject NGO
// PUT /api/ngo/:id/reject
router.put('/:id/reject', protect, authorize('admin'), rejectNGO);

module.exports = router;