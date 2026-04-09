const DestinationReview = require('../models/DestinationReview');
const Trip = require('../models/Trip');

// @route   GET /api/reviews/:destination
// @desc    Get all reviews for a destination
exports.getReviews = async (req, res) => {
  try {
    const destinationName = req.params.destination;
    const reviews = await DestinationReview.find({ destinationName })
      .populate('user', 'name avatar') // Assuming user has name and avatar
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error('getReviews error:', err);
    res.status(500).json({ msg: 'Server error fetching reviews' });
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
    // We look for a past trip matching this destination string (case insensitive)
    // The Trip endDate must be in the past
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    // Convert destination to regex for loose matching (e.g. "Paris" matches "Paris, France")
    const destRegex = new RegExp(destinationName.split(',')[0].trim(), 'i');

    const pastTrips = await Trip.find({
      user: userId,
      destination: { $regex: destRegex },
      endDate: { $lt: today }
    });

    if (pastTrips.length === 0) {
      return res.status(403).json({ 
        msg: 'Verification Failed: You must complete a recorded trip to this destination before leaving a review.' 
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
    const populatedReview = await DestinationReview.findById(newReview._id).populate('user', 'name avatar');
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
