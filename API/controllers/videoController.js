const Video = require('../models/Video');


const uploadVideoController = async (req, res) => {
  console.log(JSON.stringify(req.files), JSON.stringify(req.body));
  try {
    const { title, category, tags } = req.body;

    // Get files from req.files
    const videoFile = req.files && req.files.video ? req.files.video[0] : null;
    const thumbnailFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (!title || !videoFile || !thumbnailFile) {
      return res.status(400).json({ message: 'Title, video, or thumbnail missing' });
    }

    const newVideo = new Video({
      user_id: req.userId, // or req.user.id if you use req.user
      title,
      video_url: videoFile.path,
      thumbnail_url: thumbnailFile.path,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (err) {
    console.error('Error uploading video:', err.message);
    res.status(500).json({ message: 'Server error while uploading video' });
  }
};

// View a video
const viewVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Avoid double counting views by same user
    if (!video.viewedBy.includes(req.user.id)) {
      video.views += 1;
      video.viewedBy.push(req.user.id);
      await video.save();
    }

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Failed to view video', error: error.message });
  }
};

// Like a video
const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const userId = req.user.id;

    if (video.likedBy.includes(userId)) {
      // Unlike
      video.likes -= 1;
      video.likedBy.pull(userId);
    } else {
      // Like
      video.likes += 1;
      video.likedBy.push(userId);
      // Remove dislike if it exists
      if (video.dislikedBy.includes(userId)) {
        video.dislikes -= 1;
        video.dislikedBy.pull(userId);
      }
    }

    await video.save();
    res.status(200).json({ message: 'Like updated', likes: video.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like video', error: error.message });
  }
};

// Dislike a video
const dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const userId = req.user.id;

    if (video.dislikedBy.includes(userId)) {
      // Remove dislike
      video.dislikes -= 1;
      video.dislikedBy.pull(userId);
    } else {
      // Add dislike
      video.dislikes += 1;
      video.dislikedBy.push(userId);
      // Remove like if exists
      if (video.likedBy.includes(userId)) {
        video.likes -= 1;
        video.likedBy.pull(userId);
      }
    }

    await video.save();
    res.status(200).json({ message: 'Dislike updated', dislikes: video.dislikes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to dislike video', error: error.message });
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
  console.log("Hello World ");
  try {
    const video = await Video.findById(req.params.id).populate('user_id', 'username');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.status(200).json(video);
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


module.exports = {
  uploadVideoController,
  viewVideo,
  likeVideo,
  dislikeVideo,
  deleteVideo,
  getOwnVideos,
  searchVideos,
  getVideoById,
};

