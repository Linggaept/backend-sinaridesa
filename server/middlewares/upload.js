const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (req.baseUrl.includes('event')) {
        cb(null, './uploads/event/thumbnails');
      } else {
        cb(null, './uploads/course/thumbnails');
      }
    } else if (file.fieldname === 'coursePdf') {
      cb(null, './uploads/course/pdf');
    } else if (file.fieldname === 'picture') {
      cb(null, './uploads/team');
    } else if (file.fieldname === 'image') {
      cb(null, './uploads/event/images');
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type for images
const checkImageType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};

// Check file type for PDFs
const checkPdfType = (file, cb) => {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: PDFs Only!');
  }
};

const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    checkImageType(file, cb);
  }
});

const uploadPdf = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    checkPdfType(file, cb);
  }
});

const uploadCourseFiles = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      checkImageType(file, cb);
    } else if (file.fieldname === 'coursePdf') {
      checkPdfType(file, cb);
    } else {
      cb('Error: Invalid file field!');
    }
  }
});

const uploadEventFiles = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    checkImageType(file, cb); // Allow all image types for both fields
  }
});

module.exports = { uploadImage, uploadPdf, uploadCourseFiles, uploadEventFiles };
