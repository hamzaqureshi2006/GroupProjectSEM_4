const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/multer');

const {
  uploadPostController,
  getOwnPosts,
  getPostsByUserId,
  toggleLikePost,
  toggleDislikePost,
  getLikedPosts,
  getAllPosts,
  getPostById,
  searchPosts,
  deletePost,
  getRecommendedPosts
} = require('../controllers/postController');
// Get recommended posts for the authenticated user
router.get('/recommended', authenticate, getRecommendedPosts);

// Upload a new post (with image upload)
router.post('/upload', authenticate, upload.single('image'), uploadPostController);

// Get posts uploaded by the authenticated user
router.get('/user/:id', authenticate, getOwnPosts);

// Get posts uploaded by the current authenticated user
router.get('/user/me', authenticate, getOwnPosts);

// Get posts uploaded by a specific user
router.get('/byUser/:id', getPostsByUserId);

// Get liked posts of the authenticated user
router.get('/liked-posts', authenticate, getLikedPosts);

// Get all posts
router.get('/', getAllPosts);

// Get a single post by ID
router.get('/:id', getPostById);

// Like/unlike a post
router.post('/togglelike/:id', authenticate, toggleLikePost);

// Dislike/undislike a post
router.post('/toggledislike/:id', authenticate, toggleDislikePost);

// Search posts by title, content, or tags
router.post('/search', searchPosts);

// Delete a post
router.delete('/:id', authenticate, deletePost);

module.exports = router;
