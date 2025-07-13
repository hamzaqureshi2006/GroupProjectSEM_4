const Video = require('../models/Video');
const User = require('../models/User');
const ffmpeg = require('fluent-ffmpeg');

const uploadVideoController = async (req, res) => {
  console.log(JSON.stringify(req.files), JSON.stringify(req.body));
  try {
    const { title, category, tags, description } = req.body;

    // Get files from req.files
    const videoFile = req.files && req.files.video ? req.files.video[0] : null;
    const thumbnailFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (!title || !videoFile || !thumbnailFile) {
      return res.status(400).json({ message: 'Title, video, or thumbnail missing' });
    }

    // Get duration using ffmpeg
    ffmpeg.ffprobe(videoFile.path, async (err, metadata) => {
      if (err) {
        console.error("Error getting video metadata:", err);
        return res.status(500).json({ message: "Error processing video file" });
      }

      const duration = metadata.format.duration; // duration in seconds
      console.log("Video duration (sec):", duration);

      const newVideo = new Video({
        user_id: req.userId, // or req.user.id if you use req.user
        title,
        video_url: videoFile.path,
        thumbnail_url: thumbnailFile.path,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        description,
        duration
      });

      const savedVideo = await newVideo.save();
      res.status(201).json(savedVideo);
    });

  } catch (err) {
    console.error('Error uploading video:', err.message);
    res.status(500).json({ message: 'Server error while uploading video' });
  }
};


// Delete a video (only if owner)
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    await video.deleteOne();
    res.status(200).json({ message: 'Video deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to delete video', error: error.message });
  }
};

// Get videos uploaded by the logged-in user
const getOwnVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get your videos', error: error.message });
  }
};

// Get one video by ID
const getVideoById = async (req, res) => {
  console.log("Getting video by ID:", req.params.id);
  try {
    const video = await Video.findById(req.params.id).populate('user_id', 'channelName logo subscribers');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    // check has user liked or disliked this video
    const user = await User.findById(req.userId);
    let isLiked = false;
    let isDisliked = false
    let isSubscribed = false;
    if (user) {
      isLiked = user.likedVideos.some(v => v.toString() === video._id.toString());
      isDisliked = user.dislikedVideos.some(v => v.toString() === video._id.toString());
      isSubscribed = user.subscribedChannels.some(subscribedChannel_id => subscribedChannel_id.toString() === video.user_id._id.toString());
    }
    console.log("Video details:", video);
    console.log("User details:", user);
    console.log("isLiked:", isLiked, "isDisliked:", isDisliked, "isSubscribed:", isSubscribed);
    res.status(200).json({ ...video.toObject(), isLiked, isDisliked, isSubscribed });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get video', error: error.message });
  }
};


const searchVideos = async (req, res) => {
  const { query } = req.body;
  console.log("Search query:", query);
  if (!query) return res.status(400).json({ message: "Query missing" });

  const words = query.split(/[\s,]+/).map(word => word.trim()).filter(Boolean);
  if (words.length === 0) return res.status(400).json({ message: "No valid words in query" });

  try {
    // High priority: Videos where ALL words in tags AND title contains at least one word
    const highPriority = await Video.find({
      $and: [
        { tags: { $all: words } },
        { title: { $regex: words.join("|"), $options: "i" } }
      ]
    });

    const highPriorityIds = highPriority.map(v => v._id);

    // Low priority: Videos where ANY word in tags OR title, excluding high priority videos
    const lowPriority = await Video.find({
      _id: { $nin: highPriorityIds },
      $or: [
        { tags: { $in: words } },
        { title: { $regex: words.join("|"), $options: "i" } }
      ]
    });

    // Combine results
    const results = [...highPriority, ...lowPriority];

    res.json({ results });
  } catch (err) {
    console.error("Error in searchVideos:", err.message);
    res.status(500).json({ message: "Server error while searching videos" });
  }
};


const togglelikeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.userId;

    // Check if the video exists
    const video = await Video.findById(videoId);
    const user = await User.findById(userId)

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    // Check if the user has already liked the video
    if (user.likedVideos.some(v => v._id.toString() === videoId)) {
      // User has already liked the video, so we remove the like
      user.likedVideos = user.likedVideos.filter(v => v._id.toString() !== videoId);
      video.likes -= 1;
    } else {
      // User has not liked the video, so we add the like
      user.likedVideos.push(videoId);
      video.likes += 1;
    }
    await user.save();
    await video.save();
    res.status(200).json({ message: 'Video like status toggled successfully', video });
  } catch (error) {
    console.error('Error toggling video like:', error.message);
    res.status(500).json({ message: 'Server error while toggling video like' });
  }
};


const toggledislikeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.userId;

    // Check if the video exists
    const video = await Video.findById(videoId);
    const user = await User.findById(userId)

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    // Check if the user has already disliked the video
    if (user.dislikedVideos.some(v => v._id.toString() === videoId)) {
      // User has already disliked the video, so we remove the dislike
      user.dislikedVideos = user.dislikedVideos.filter(v => v._id.toString() !== videoId);
      video.dislikes -= 1;
    } else {
      // User has not disliked the video, so we add the dislike
      user.dislikedVideos.push(videoId);
      video.dislikes += 1;
    }
    await user.save();
    await video.save();
    res.status(200).json({ message: 'Video dislike status toggled successfully', video });
  } catch (error) {
    console.error('Error toggling video dislike:', error.message);
    res.status(500).json({ message: 'Server error while toggling video dislike' });
  }
};

module.exports = {
  uploadVideoController,
  togglelikeVideo,
  toggledislikeVideo,
  // watchVideo,
  deleteVideo,
  getOwnVideos,
  searchVideos,
  getVideoById,
};

