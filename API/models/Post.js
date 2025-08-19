const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  image_url: { type: String, default: '' },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Tech', 'Lifestyle', 'Education', 'Entertainment', 'Sports', 'Politics', 'Health', 'Travel', 'Food', 'Other'], 
    required: true 
  },
  tags: [String],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
