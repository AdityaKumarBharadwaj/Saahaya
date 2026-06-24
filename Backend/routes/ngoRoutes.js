const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/ngoController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadLogo: uploadLogoMiddleware, uploadDocuments: uploadDocumentsMiddleware } = require('../middlewares/cloudinaryUpload');

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────────

// GET /api/ngos?cause=education&city=Mumbai&search=akanksha&sort=rating
router.get('/', getAllNGOs);

// ── PRIVATE ROUTES (order matters — specific before :id) ──────────────────────

// GET /api/ngos/me/profile  ← must be BEFORE /:id
router.get('/me/profile', protect, authorize('ngo'), getMyNGO);

// GET /api/ngos/admin/pending  ← must be BEFORE /:id
router.get('/admin/pending', protect, authorize('admin'), getPendingNGOs);

// GET /api/ngos/:id
router.get('/:id', getNGOById);

// POST /api/ngos
router.post('/', protect, authorize('ngo'), createNGO);

// PUT /api/ngos/:id
router.put('/:id', protect, updateNGO);

// ── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// PUT /api/ngos/:id/approve
router.put('/:id/approve', protect, authorize('admin'), approveNGO);

// PUT /api/ngos/:id/reject
router.put('/:id/reject', protect, authorize('admin'), rejectNGO);

// ── FILE UPLOAD ROUTES ────────────────────────────────────────────────────────

// PUT /api/ngos/:id/upload-documents (multiple PDFs → Cloudinary)
router.put(
  '/:id/upload-documents',
  protect,
  authorize('ngo', 'admin'),
  uploadDocumentsMiddleware.fields([
    { name: 'trustDeed', maxCount: 1 },
    { name: 'certificate80G', maxCount: 1 },
    { name: 'panCard', maxCount: 1 }
  ]),
  uploadDocuments
);

// PUT /api/ngos/:id/upload-logo (single image → Cloudinary)
router.put(
  '/:id/upload-logo',
  protect,
  authorize('ngo', 'admin'),
  uploadLogoMiddleware.single('logo'),
  uploadLogo
);

module.exports = router;