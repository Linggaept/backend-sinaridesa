const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const compressImage = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  try {
    if (req.file) {
      // Handle single file upload
      const file = req.file;
      if (file.mimetype.startsWith('image')) {
        const tempPath = file.path;
        const newFilename = `${Date.now()}-${file.originalname}`;
        const newPath = path.join(file.destination, newFilename);

        await sharp(tempPath)
          .resize({ width: 1280, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(newPath);

        fs.unlinkSync(tempPath);

        req.file.path = newPath;
        req.file.filename = newFilename;
      }
    }

    if (req.files) {
      // Handle multiple files upload
      for (const field in req.files) {
        await Promise.all(
          req.files[field].map(async (file) => {
            if (file.mimetype.startsWith('image')) {
              const tempPath = file.path;
              const newFilename = `${Date.now()}-${file.originalname}`;
              const newPath = path.join(file.destination, newFilename);

              await sharp(tempPath)
                .resize({ width: 1280, withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(newPath);

              fs.unlinkSync(tempPath);

              file.path = newPath;
              file.filename = newFilename;
            }
          })
        );
      }
    }

    next();
  } catch (error) {
    console.error('Image compression error:', error);
    next(error);
  }
};

module.exports = compressImage;