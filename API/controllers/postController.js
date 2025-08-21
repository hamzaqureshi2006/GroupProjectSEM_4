// Get recommended posts for a user using Python AI service, fallback to random posts if AI fails
const axios = require('axios');
const getRecommendedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    // Get all posts (including user's own)
    const allPosts = await Post.find()
      .populate('user_id', 'username')
      .sort({ timestamp: -1 });
    // Pick a seed post (e.g., most recent)
    const seedPost = allPosts.length > 0 ? allPosts[0] : null;
    // Prepare data for Python AI service
    const requestData = {
      post: seedPost ? {
        _id: seedPost._id.toString(),
        title: seedPost.title,
        content: seedPost.content || '',
        tags: seedPost.tags || []
      } : {},
      allPosts: allPosts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        content: post.content || '',
        tags: post.tags || []
      }))
    };
    let recommendedPosts = [];
    try {
      const pythonRes = await axios.post('http://localhost:8000/api/recommendations/recommend_posts/', requestData);
      if (pythonRes.data.recommended_post_ids && pythonRes.data.recommended_post_ids.length > 0) {
        // Get full post details for recommended posts
        recommendedPosts = await Post.find({
          _id: { $in: pythonRes.data.recommended_post_ids }
        }).populate('user_id', 'username');
      }
    } catch (aiError) {
      console.error('Python AI post recommendation failed, falling back to random:', aiError.message);
    }
    // Fallback: if AI fails or returns nothing, use random posts
    if (!recommendedPosts || recommendedPosts.length === 0) {
      recommendedPosts = await Post.aggregate([
        { $sample: { size: 10 } }
      ]);
      recommendedPosts = await Post.populate(recommendedPosts, { path: 'user_id', select: 'username' });
    }
    res.status(200).json({ success: true, posts: recommendedPosts });
  } catch (error) {
    console.error('Error fetching recommended posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recommended posts', error: error.message });
  }
};
const Post = require('../models/Post');
const User = require('../models/User');

// Upload a new post (with image upload, similar to video upload)
const uploadPostController = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.userId;

    // Get image file from req.file
    const imageFile = req.file;

    if (!title || !content || !category || !imageFile) {
      return res.status(400).json({ message: 'Title, content, category, or image missing' });
    }

    // Parse tags if they come as a string
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const newPost = new Post({
      user_id: userId,
      title,
      content,
      category,
      tags: parsedTags,
      image_url: imageFile.path
    });

    const savedPost = await newPost.save();
    // Populate user info for response
    await savedPost.populate('user_id', 'username');

    res.status(201).json({
      success: true,
      message: 'Post uploaded successfully',
      post: savedPost
    });
  } catch (error) {
    console.error('Error uploading post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload post',
      error: error.message
    });
  }
};

// Get posts uploaded by the authenticated user
const getOwnPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const posts = await Post.find({ user_id: userId })
      .populate('user_id', 'username')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Error fetching own posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Get posts uploaded by a specific user
const getPostsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ user_id: id })
      .populate('user_id', 'username')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Error fetching posts by user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Like/unlike a post
const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has already liked the post
    const user = await User.findById(userId);
    const hasLiked = user.likedPosts && user.likedPosts.some(postId => postId.toString() === id);
    const hasDisliked = user.dislikedPosts && user.dislikedPosts.some(postId => postId.toString() === id);

    if (hasLiked) {
      // Unlike the post
      post.likes = Math.max(0, post.likes - 1);
      user.likedPosts = user.likedPosts.filter(postId => postId.toString() !== id);
    } else {
      // Like the post
      post.likes += 1;
      if (!user.likedPosts) user.likedPosts = [];
      user.likedPosts.push(id);
      // If post was disliked, remove from dislikes
      if (hasDisliked) {
        post.dislikes = Math.max(0, post.dislikes - 1);
        user.dislikedPosts = user.dislikedPosts.filter(postId => postId.toString() !== id);
      }
    }

    await post.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes,
      dislikes: post.dislikes,
      isLiked: !hasLiked,
      isDisliked: false
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

// Dislike/undislike a post
const toggleDislikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const user = await User.findById(userId);
    const hasDisliked = user.dislikedPosts && user.dislikedPosts.some(postId => postId.toString() === id);
    const hasLiked = user.likedPosts && user.likedPosts.some(postId => postId.toString() === id);

    if (hasDisliked) {
      // Undislike the post
      post.dislikes = Math.max(0, post.dislikes - 1);
      user.dislikedPosts = user.dislikedPosts.filter(postId => postId.toString() !== id);
    } else {
      // Dislike the post
      post.dislikes += 1;
      if (!user.dislikedPosts) user.dislikedPosts = [];
      user.dislikedPosts.push(id);
      // If post was liked, remove from likes
      if (hasLiked) {
        post.likes = Math.max(0, post.likes - 1);
        user.likedPosts = user.likedPosts.filter(postId => postId.toString() !== id);
      }
    }

    await post.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: hasDisliked ? 'Post undisliked' : 'Post disliked',
      likes: post.likes,
      dislikes: post.dislikes,
      isLiked: false,
      isDisliked: !hasDisliked
    });
  } catch (error) {
    console.error('Error toggling post dislike:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle dislike',
      error: error.message
    });
  }
};

// Get liked posts of the authenticated user
const getLikedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching liked posts for user:", userId);
    
    // First get the user to see their likedPosts array
    const user = await User.findById(userId);
    
    if (!user) {
      console.log("User not found for liked posts.");
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User likedPosts array:", user.likedPosts);
    console.log("Number of liked posts:", user.likedPosts ? user.likedPosts.length : 0);

    if (!user.likedPosts || user.likedPosts.length === 0) {
      console.log("No liked posts found for user.");
      return res.status(200).json([]);
    }

    // Get the actual post documents
    const posts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate('user_id', 'channelName username')
      .sort({ timestamp: -1 });

    console.log("Found liked posts:", posts.length, "posts");

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch liked posts',
      error: error.message
    });
  }
};

// Get all posts (for homepage or browsing)
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user_id', 'username')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate('user_id', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

// Search posts by title, content, or tags
const searchPosts = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
      .populate('user_id', 'username')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search posts',
      error: error.message
    });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await Post.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

module.exports = {
  uploadPostController,
  getOwnPosts,
  getPostsByUserId,
  toggleLikePost,
  toggleDislikePost, // Add this line
  getLikedPosts,
  getAllPosts,
  getPostById,
  searchPosts,
  deletePost,
  getRecommendedPosts
};
