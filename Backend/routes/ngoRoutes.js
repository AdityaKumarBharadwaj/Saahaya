const express = require('express');
const router = express.Router();

const { getAllNGOs, getNGOById, createNGO, updateNGO, getMyNGO, approveNGO, rejectNGO, getPendingNGOs, uploadDocuments, uploadLogo } = require('../controllers/ngoController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

//public routes
// GET /api/ngos?cause=education&city=Mumbai&search=akanksha
router.get('/', getAllNGOs);

// private route — must be above /:id to avoid "me" matching as an id
// GET /api/ngos/me/profile
router.get('/me/profile', protect, getMyNGO);

// admin routes — must be above /:id to avoid "admin" matching as an id
// GET /api/ngos/admin/pending
router.get('/admin/pending', protect, authorize('admin'), getPendingNGOs);

// GET /api/ngos/:id
router.get('/:id', getNGOById);

// POST /api/ngos
router.post('/', protect, authorize('ngo'), createNGO);

//  PUT /api/ngos/:id
router.put('/:id', protect, updateNGO);

// Approve NGO
// PUT /api/ngos/:id/approve
router.put('/:id/approve', protect, authorize('admin'), approveNGO);

// Reject NGO
// PUT /api/ngo/:id/reject
router.put('/:id/reject', protect, authorize('admin'), rejectNGO);

// Upload documents (multiple files)
router.put(
  '/:id/upload-documents',
  protect,
  upload.fields([
    { name: 'trustDeed', maxCount: 1 },
    { name: 'certificate80G', maxCount: 1 },
    { name: 'panCard', maxCount: 1 }
  ]),
  uploadDocuments
);

// NEW: Upload logo (single file)
router.put(
  '/:id/upload-logo',
  protect,
  upload.single('logo'),
  uploadLogo
);


module.exports = router;