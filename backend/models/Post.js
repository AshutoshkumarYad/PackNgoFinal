const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' }, // Server path to multer uploaded file
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  tags: [{ type: String }],
  visibility: {
    type: String,
    enum: ['public', 'followers'],
    default: 'public'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }],
  shares: { type: Number, default: 0 }
}, { timestamps: true });

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
