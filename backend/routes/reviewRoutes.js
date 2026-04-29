const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

// Get all reviews authored by a specific user (Public or Protected depending on privacy, here we make it public for simplicity and handle privacy at the client/profile level or within the controller if needed)
router.get('/user/:userId', authMiddleware.protect, reviewController.getUserReviews);

// Get all reviews for a destination (Public)
router.get('/:destination', reviewController.getReviews);

// Add a review for a destination (Protected)
router.post('/:destination', authMiddleware.protect, reviewController.addReview);

// Delete a review (Protected)
router.delete('/:reviewId', authMiddleware.protect, reviewController.deleteReview);

module.exports = router;
