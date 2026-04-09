const mongoose = require('mongoose');

const destinationReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destinationName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// A user can theoretically only leave one review per destination
destinationReviewSchema.index({ user: 1, destinationName: 1 }, { unique: true });

module.exports = mongoose.model('DestinationReview', destinationReviewSchema);
