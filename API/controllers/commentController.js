const Comment = require('../models/Comments');
const Video = require('../models/Video');

const addComment = async (req, res) => {
    const { videoId, commentText } = req.body;

    if (!commentText) {
        return res.status(400).json({ message: 'Comment text required' });
    }

    try {
        const newComment = new Comment({
            user_id: req.userId,
            commentText
        });

        const savedComment = await newComment.save();

        // Push comment to video
        await Video.findByIdAndUpdate(videoId, {
            $push: { comments: savedComment._id }
        });

        res.status(201).json(savedComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while adding comment' });
    }
};

const getCommentsForVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);
        const comments = await Comment.find({ _id: { $in: video.comments } })
            .populate('user_id', 'channelName logo');

        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

module.exports = { addComment, getCommentsForVideo };
