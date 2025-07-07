const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Single Cloudinary storage for both images and videos, same folder, no file type check
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social_media_app/uploads', // same folder for all uploads
    resource_type: 'auto' // auto-detects file type (image/video)
  }
});

// Multer instance for both thumbnail and video fields
const upload = multer({ storage });

module.exports = upload;
