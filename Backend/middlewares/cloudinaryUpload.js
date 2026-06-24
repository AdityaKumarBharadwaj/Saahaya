const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ── LOGO STORAGE (images only) ──────────────────────────────────────────────
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'saahaya/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
    public_id: `logo-${req.params.id || req.user.id}-${Date.now()}`
  })
});

// ── DOCUMENT STORAGE (PDFs) ──────────────────────────────────────────────────
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'saahaya/documents',
    resource_type: 'raw',           // Required for PDFs
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    public_id: `doc-${file.fieldname}-${req.params.id || req.user.id}-${Date.now()}`
  })
});

// ── FILE FILTERS ─────────────────────────────────────────────────────────────
const logoFileFilter = (req, file, cb) => {
  const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Logo must be an image file (JPEG, PNG, GIF, WEBP)'), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedMimetypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Documents must be PDF or image files'), false);
  }
};

// ── MULTER INSTANCES ─────────────────────────────────────────────────────────
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB
  fileFilter: logoFileFilter
});

const uploadDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10 MB per document
  fileFilter: documentFileFilter
});

module.exports = { uploadLogo, uploadDocuments };
