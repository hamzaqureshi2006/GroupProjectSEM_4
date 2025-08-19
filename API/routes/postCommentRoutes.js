const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { addCommentToPost, getCommentsForPost } = require('../controllers/postCommentController');

// Add comment to a post
router.post('/add', authenticate, addCommentToPost);

// Get comments for a post
router.get('/:postId', getCommentsForPost);

module.exports = router;
