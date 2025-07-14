const express = require('express');
const router = express.Router();

const upload = require('../middleware/multer'); // For thumbnails
const authenticate = require('../middleware/authenticate');

const {
  uploadVideoController,
  deleteVideo,
  toggledislikeVideo,
  togglelikeVideo,
  getOwnVideos,
  watchVideo,
  getLikedVideos,
  getWatchedVideos,
  searchVideos
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


// Get videos uploaded by the authenticated user
router.get('/user/:id', authenticate, getOwnVideos);

// Get a single video by ID
router.get('/watchVideo/:id', authenticate, watchVideo);

// Search videos by title or tags
router.post('/search', searchVideos);

// Like a video
router.post('/togglelike/:id', authenticate, togglelikeVideo);

// Dislike a video
router.post('/toggledislike/:id', authenticate, toggledislikeVideo);

// Get liked videos of the authenticated user
router.get('/likedVideos', authenticate, getLikedVideos);

// Get watched videos of the authenticated user
router.get('/watchedVideos', authenticate, getWatchedVideos);

module.exports = router;


