const multer = require('multer');
const path = require('path');

// STORAGE CONFIGURATION
const storage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    if (file.fieldname === 'logo') {
      cb(null, 'uploads/logos');
    } else {
      cb(null, 'uploads/documents');
    }
  },
  
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


// Validation check
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    logo: /jpeg|jpg|png|gif/,
    trustDeed: /pdf/,
    certificate80G: /pdf/,
    panCard: /pdf|jpeg|jpg|png/
  };

  // Get file extension
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Get allowed pattern for this field
  const allowedPattern = allowedTypes[file.fieldname];

  if (!allowedPattern) {
    return cb(new Error('Invalid field name'));
  }

  // Check if file type is allowed
  const isValidExt = allowedPattern.test(extname.replace('.', ''));
  const isValidMime = allowedPattern.test(mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);  // Accept file
  } else {
    cb(new Error(`Only ${allowedPattern} files are allowed for ${file.fieldname}`));
  }
};

// MULTER INSTANCE
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  },
  fileFilter: fileFilter
});


module.exports = upload;