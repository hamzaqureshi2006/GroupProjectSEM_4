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
const watchVideo = async (req, res) => {
  console.log("Getting video by ID:", req.params.id);
  const userId = req.userId;
  try {
    const video = await Video.findById(req.params.id).populate('user_id', 'channelName logo subscribers');
    const user = await User.findById(userId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Increment views only if the user has not watched this video before
    if (user && !user.watchedVideos.includes(video._id)) {
      video.views += 1;
      user.watchedVideos.push(video._id);
      await user.save();
      await video.save();
    }

    // check has user liked or disliked this video
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

    const video = await Video.findById(videoId);
    const user = await User.findById(userId);

    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof video.likes !== 'number') video.likes = 0;

    let isLiked;
    if (user.likedVideos.some(v => v.toString() === videoId)) {
      user.likedVideos = user.likedVideos.filter(v => v.toString() !== videoId);
      video.likes = Math.max(0, video.likes - 1);
      isLiked = false;
    } else {
      user.likedVideos.push(videoId);
      video.likes += 1;
      // If liked, ensure dislike removed
      user.dislikedVideos = (user.dislikedVideos || []).filter(v => v.toString() !== videoId);
      if (typeof video.dislikes !== 'number') video.dislikes = 0;
      isLiked = true;
    }

    await user.save();
    await video.save();

    const isDisliked = user.dislikedVideos.some(v => v.toString() === videoId);

    res.status(200).json({
      message: 'Video like status toggled successfully',
      videoId,
      likes: video.likes,
      dislikes: video.dislikes,
      isLiked,
      isDisliked,
    });
  } catch (error) {
    console.error('Error toggling video like:', error.message);
    res.status(500).json({ message: 'Server error while toggling video like', error: error.message });
  }
};


const toggledislikeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.userId;

    const video = await Video.findById(videoId);
    const user = await User.findById(userId);

    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof video.dislikes !== 'number') video.dislikes = 0;

    let isDisliked;
    if (user.dislikedVideos.some(v => v.toString() === videoId)) {
      user.dislikedVideos = user.dislikedVideos.filter(v => v.toString() !== videoId);
      video.dislikes = Math.max(0, video.dislikes - 1);
      isDisliked = false;
    } else {
      user.dislikedVideos.push(videoId);
      video.dislikes += 1;
      // If disliked, ensure like removed
      user.likedVideos = (user.likedVideos || []).filter(v => v.toString() !== videoId);
      if (typeof video.likes !== 'number') video.likes = 0;
      isDisliked = true;
    }

    await user.save();
    await video.save();

    const isLiked = user.likedVideos.some(v => v.toString() === videoId);

    res.status(200).json({
      message: 'Video dislike status toggled successfully',
      videoId,
      likes: video.likes,
      dislikes: video.dislikes,
      isLiked,
      isDisliked,
    });
  } catch (error) {
    console.error('Error toggling video dislike:', error.message);
    res.status(500).json({ message: 'Server error while toggling video dislike', error: error.message });
  }
};

const getLikedVideos = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('likedVideos');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.likedVideos);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getWatchedVideos = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('watchedVideos');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.watchedVideos);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get videos by specific user id (channel)
const getVideosByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const videos = await Video.find({ user_id: id }).sort({ timestamp: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get channel videos', error: error.message });
  }
};

// Get recommended videos for a specific video
const getRecommendedVideos = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Get the current video
    const currentVideo = await Video.findById(videoId);
    if (!currentVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Get all videos (excluding the current one)
    const allVideos = await Video.find({ _id: { $ne: videoId } }).select('_id title description tags');
    
    if (allVideos.length === 0) {
      return res.status(200).json({ recommendedVideos: [] });
    }
    
    // Prepare data for Python AI service
    const requestData = {
      video: {
        _id: currentVideo._id.toString(),
        title: currentVideo.title,
        description: currentVideo.description || '',
        tags: currentVideo.tags || []
      },
      allVideos: allVideos.map(video => ({
        _id: video._id.toString(),
        title: video.title,
        description: video.description || '',
        tags: video.tags || []
      }))
    };
    
    // Call Python AI service
    const axios = require('axios');
    const pythonResponse = await axios.post('http://localhost:8000/api/recommendations/recommend/', requestData);
    
    if (pythonResponse.data.recommended_video_ids) {
      // Get full video details for recommended videos
      const recommendedVideos = await Video.find({
        _id: { $in: pythonResponse.data.recommended_video_ids }
      }).select('_id title thumbnail_url video_url user_id views timestamp');
      
      // Populate user information for each video
      const populatedVideos = await Video.populate(recommendedVideos, {
        path: 'user_id',
        select: 'channelName logo'
      });
      
      res.status(200).json({ 
        recommendedVideos: populatedVideos,
        similarities: pythonResponse.data.similarities
      });
    } else {
      res.status(200).json({ recommendedVideos: [] });
    }
    
  } catch (error) {
    console.error('Error getting recommended videos:', error.message);
    res.status(500).json({ 
      message: 'Failed to get recommended videos', 
      error: error.message 
    });
  }
};

// Get homepage recommended videos (based on user preferences or trending)
const getHomepageRecommendations = async (req, res) => {
  try {
    const userId = req.userId; // Get current user ID from auth middleware
    
  // Get all videos for recommendation (including user's own)
  const allVideos = await Video.find().select('_id title description tags views timestamp category');
    
    if (allVideos.length === 0) {
      return res.status(200).json({ recommendedVideos: [] });
    }
    
    let seedVideo;
    
    if (userId) {
      // Try to get user-specific recommendations based on their behavior
      try {
        const user = await User.findById(userId).populate('likedVideos watchedVideos');
        
        if (user && user.likedVideos && user.likedVideos.length > 0) {
          // Use user's liked videos as seed for recommendations
          const likedVideoIds = user.likedVideos.map(v => v._id.toString());
          const likedVideos = allVideos.filter(v => likedVideoIds.includes(v._id.toString()));
          
          if (likedVideos.length > 0) {
            // Pick a random liked video as seed
            seedVideo = likedVideos[Math.floor(Math.random() * likedVideos.length)];
          }
        } else if (user && user.watchedVideos && user.watchedVideos.length > 0) {
          // Use user's watch history as seed
          const watchedVideoIds = user.watchedVideos.map(v => v._id.toString());
          const watchedVideos = allVideos.filter(v => watchedVideoIds.includes(v._id.toString()));
          
          if (watchedVideos.length > 0) {
            // Pick a random watched video as seed
            seedVideo = watchedVideos[Math.floor(Math.random() * watchedVideos.length)];
          }
        }
      } catch (userError) {
        console.log('User not found or error fetching user data, using trending approach');
      }
    }
    
    // If no user-specific seed found, use trending approach
    if (!seedVideo) {
      const trendingVideos = allVideos
        .sort((a, b) => {
          // Sort by views (60%), recency (30%), and category diversity (10%)
          const viewScore = (a.views || 0) / Math.max(...allVideos.map(v => v.views || 0));
          const recencyScore = (new Date(a.timestamp) - new Date(0)) / (new Date() - new Date(0));
          const categoryScore = Math.random() * 0.1; // Add some randomness for diversity
          return (viewScore * 0.6 + recencyScore * 0.3 + categoryScore) - 
                 (b.views || 0) / Math.max(...allVideos.map(v => v.views || 0)) * 0.6 - 
                 (new Date(b.timestamp) - new Date(0)) / (new Date() - new Date(0)) * 0.3 - 
                 Math.random() * 0.1;
        })
        .slice(0, Math.min(10, allVideos.length));
      
      seedVideo = trendingVideos[0];
    }
    
    // Prepare data for Python AI service
    const requestData = {
      video: {
        _id: seedVideo._id.toString(),
        title: seedVideo.title,
        description: seedVideo.description || '',
        tags: seedVideo.tags || []
      },
      allVideos: allVideos.map(video => ({
        _id: video._id.toString(),
        title: video.title,
        description: video.description || '',
        tags: video.tags || []
      }))
    };
    
    // Call Python AI service
    const axios = require('axios');
    let recommendedVideos = [];
    try {
      const pythonResponse = await axios.post('http://localhost:8000/api/recommendations/recommend/', requestData);
      if (pythonResponse.data.recommended_video_ids) {
        let aiVideos = await Video.find({
          _id: { $in: pythonResponse.data.recommended_video_ids }
        }).select('_id title thumbnail_url video_url user_id views timestamp duration category');
        aiVideos = await Video.populate(aiVideos, {
          path: 'user_id',
          select: 'channelName logo'
        });
        // Separate videos from other users and from self
        const otherVideos = aiVideos.filter(v => v.user_id && v.user_id._id.toString() !== userId);
        const myVideos = aiVideos.filter(v => v.user_id && v.user_id._id.toString() === userId);
        // If not enough from others, fill with random others
        let needed = 5 - otherVideos.length;
        let extraOthers = [];
        if (needed > 0) {
          extraOthers = await Video.find({ user_id: { $ne: userId, $nin: otherVideos.map(v=>v.user_id._id) } })
            .select('_id title thumbnail_url video_url user_id views timestamp duration category')
            .populate('user_id', 'channelName logo')
            .limit(needed);
        }
        // Compose: mostly others, some self
        recommendedVideos = [...otherVideos, ...extraOthers, ...myVideos].slice(0, 10);
        return res.status(200).json({ 
          recommendedVideos,
          similarities: pythonResponse.data.similarities,
          seedVideo: {
            title: seedVideo.title,
            category: seedVideo.category
          }
        });
      }
    } catch (aiError) {
      console.error('Python AI video recommendation failed, falling back to trending/random:', aiError.message);
    }
    // Fallback: trending/random, mix others and self
    const others = await Video.find({ user_id: { $ne: userId } })
      .select('_id title thumbnail_url video_url user_id views timestamp duration category')
      .populate('user_id', 'channelName logo')
      .limit(7);
    const mine = await Video.find({ user_id: userId })
      .select('_id title thumbnail_url video_url user_id views timestamp duration category')
      .populate('user_id', 'channelName logo')
      .limit(3);
    const populatedFallbackVideos = [...others, ...mine];
    res.status(200).json({ 
      recommendedVideos: populatedFallbackVideos,
      similarities: [1.0, 0.9, 0.8, 0.7, 0.6], // Default similarity scores
      seedVideo: {
        title: seedVideo.title,
        category: seedVideo.category
      }
    });
    
  } catch (error) {
    console.error('Error getting homepage recommendations:', error.message);
    res.status(500).json({ 
      message: 'Failed to get homepage recommendations', 
      error: error.message 
    });
  }
};

module.exports = {
  uploadVideoController,
  togglelikeVideo,
  toggledislikeVideo,
  watchVideo,
  deleteVideo,
  getOwnVideos,
  searchVideos,
  getLikedVideos,
  getWatchedVideos,
  getVideosByUserId,
  getRecommendedVideos,
  getHomepageRecommendations
};

