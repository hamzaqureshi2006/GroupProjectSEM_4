const express = require('express');
const router = express.Router();

const upload = require('../middleware/multer'); // For thumbnails
const authenticate = require('../middleware/authenticate');

const {
  uploadVideoController,
  deleteVideo,
  getAllVideos,
  getOwnVideos,
  getVideoById,
  getVideosByCategory,
  getVideosByTags
} = require('../controllers/videoController');

// upload video , delete video , get Liked videos , get viewed videos 

router.post(
  '/upload',
  authenticate,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  uploadVideoController
);

// Delete a video
router.delete('/:id', authenticate, deleteVideo);

// Get all videos
router.get('/', getAllVideos);

// Get videos uploaded by the authenticated user
router.get('/user/:id', authenticate, getOwnVideos);

// Get a single video by ID
router.get('/:id', getVideoById);

// Get videos by category
router.get('/category/:category', getVideosByCategory);

// Get videos by tags (passed in body)
router.post('/tags', getVideosByTags);

module.exports = router;


