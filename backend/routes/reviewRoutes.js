const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

// Get all reviews for a destination (Public)
router.get('/:destination', reviewController.getReviews);

// Add a review for a destination (Protected)
router.post('/:destination', authMiddleware.protect, reviewController.addReview);

// Delete a review (Protected)
router.delete('/:reviewId', authMiddleware.protect, reviewController.deleteReview);

module.exports = router;
