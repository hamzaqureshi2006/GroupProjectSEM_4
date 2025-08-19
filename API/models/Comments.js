// const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//   user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   commentText: { type: String, required: true },
//   replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
//   likes: { type: Number, default: 0 },
//   dislikes: { type: Number, default: 0 },
//   isEdited: { type: Boolean, default: false },
//   timestamp: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Comment', commentSchema);


const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // For post comments
  commentText: { type: String, required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
  is_spam: { type: Boolean, default: false },  // <-- Add this field
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
