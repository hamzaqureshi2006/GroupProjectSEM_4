const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const { addComment, getCommentsForVideo }
    = require('../controllers/commentController');


router.post('/add', authenticate, addComment);

router.get('/:videoId', getCommentsForVideo);

module.exports = router;