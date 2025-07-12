const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  video_url: { type: String, required: true },
  thumbnail_url: { type: String, default: 'https://dummyimage.com/300x180/eee/aaa' },
  category: { type: String, enum: ['Music', 'Education', 'Gaming', 'Vlog', 'Other'], default: 'Other' },
  tags: [String],
  description: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // Duration in seconds
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);

