const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  channelName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  logo: { type: String }, // URL to profile image
  banner: { type: String }, // URL to banner image
  subscribers: { type: Number, default: 0 },
  subscribedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  watchedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  dislikedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

