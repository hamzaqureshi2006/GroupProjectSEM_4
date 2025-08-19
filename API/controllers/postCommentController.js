const Comment = require('../models/Comments');
const Post = require('../models/Post');

// Add a comment to a post
const addCommentToPost = async (req, res) => {
    const { postId, commentText } = req.body;

    if (!commentText) {
        return res.status(400).json({ message: 'Comment text required' });
    }

    try {
        const newComment = new Comment({
            user_id: req.userId,
            commentText,
            postId
        });

        const savedComment = await newComment.save();

        // Push comment to post
        await Post.findByIdAndUpdate(postId, {
            $push: { comments: savedComment._id }
        });

        res.status(201).json(savedComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while adding comment to post' });
    }
};

// Get comments for a post
const getCommentsForPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const comments = await Comment.find({ _id: { $in: post.comments } })
            .populate('user_id', 'username');
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching comments for post' });
    }
};

module.exports = { addCommentToPost, getCommentsForPost };
