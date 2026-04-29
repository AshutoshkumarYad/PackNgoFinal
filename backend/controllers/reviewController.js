const DestinationReview = require('../models/DestinationReview');
const Trip = require('../models/Trip');

// @route   GET /api/reviews/:destination
// @desc    Get all reviews for a destination
exports.getReviews = async (req, res) => {
  try {
    const destinationName = req.params.destination;
    const reviews = await DestinationReview.find({ destinationName })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const Profile = require('../models/Profile');
    for (let review of reviews) {
      if (review.user && review.user._id) {
        const profile = await Profile.findOne({ user: review.user._id });
        if (profile) {
          review.user.avatar = profile.avatar;
        }
      }
    }

    res.json(reviews);
  } catch (err) {
    console.error('getReviews error:', err);
    res.status(500).json({ msg: 'Server error fetching reviews' });
  }
};

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews authored by a specific user
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId;
    // We can just use 'me' if it's the current user
    const targetUserId = userId === 'me' ? req.user.id : userId;
    
    const reviews = await DestinationReview.find({ user: targetUserId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const Profile = require('../models/Profile');
    for (let review of reviews) {
      if (review.user && review.user._id) {
        const profile = await Profile.findOne({ user: review.user._id });
        if (profile) {
          review.user.avatar = profile.avatar;
        }
      }
    }

    res.json(reviews);
  } catch (err) {
    console.error('getUserReviews error:', err);
    res.status(500).json({ msg: 'Server error fetching user reviews' });
  }
};

// @route   POST /api/reviews/:destination
// @desc    Add a review for a destination (Must have visited)
exports.addReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    const destinationName = req.params.destination;
    const userId = req.user.id;

    if (!rating || !text) {
      return res.status(400).json({ msg: 'Please provide rating and review text.' });
    }

    // 1. Verification Phase: Did they visit it?
    const Post = require('../models/Post');
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    const destBase = destinationName.split(',')[0].trim().toLowerCase();
    
    // Alias mapping for common cities that have multiple names
    const aliases = {
      'varanasi': ['varanasi', 'banaras', 'kashi'],
      'bengaluru': ['bengaluru', 'bangalore'],
      'mumbai': ['mumbai', 'bombay'],
      'chennai': ['chennai', 'madras'],
      'kolkata': ['kolkata', 'calcutta']
    };
    
    const possibleNames = aliases[destBase] || [destBase];
    // Create a regex that matches ANY of the possible names
    const destRegex = new RegExp(`(${possibleNames.join('|')})`, 'i');

    // Priority 1: Check if a post was created for this destination
    const posts = await Post.find({
      user: userId,
      $or: [
        { 'location.country': { $regex: destRegex } },
        { tags: { $regex: destRegex } },
        { title: { $regex: destRegex } },
        { description: { $regex: destRegex } }
      ]
    });

    let verificationPassed = false;

    if (posts.length > 0) {
      verificationPassed = true;
    } else {
      // Priority 2: Check for a past trip matching this destination string
      const pastTrips = await Trip.find({
        user: userId,
        destination: { $regex: destRegex },
        endDate: { $lt: today }
      });
      
      if (pastTrips.length > 0) {
        verificationPassed = true;
      }
    }

    if (!verificationPassed) {
      return res.status(403).json({ 
        msg: 'Verification Failed: You must complete a recorded trip or create a post for this destination before leaving a review.' 
      });
    }

    // 2. Create the review
    const newReview = new DestinationReview({
      user: userId,
      destinationName,
      rating: Number(rating),
      text
    });

    await newReview.save();
    
    // Return populated review
    let populatedReview = await DestinationReview.findById(newReview._id).populate('user', 'name').lean();
    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ user: userId });
    if (profile && populatedReview.user) {
      populatedReview.user.avatar = profile.avatar;
    }
    res.status(201).json(populatedReview);

  } catch (err) {
    console.error('addReview error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'You have already reviewed this destination.' });
    }
    res.status(500).json({ msg: 'Server error saving review' });
  }
};

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review authored by the user
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;

    const review = await DestinationReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ msg: 'Review not found.' });
    }

    // Verify user owns the review
    if (review.user.toString() !== userId) {
      return res.status(401).json({ msg: 'User not authorized to delete this review.' });
    }

    await DestinationReview.findByIdAndDelete(reviewId);
    res.json({ msg: 'Review successfully removed.' });

  } catch (err) {
    console.error('deleteReview error:', err);
    res.status(500).json({ msg: 'Server error deleting review' });
  }
};
