const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { getFeed, getMyPosts, createPost, deletePost, likePost, commentPost, sharePost, savePost, getSavedPosts } = require('../controllers/postController');

// Public or Semi-Public feed
router.get('/feed', getFeed);

// Private User Routes
router.route('/')
  .post(protect, upload.single('image'), createPost);

router.route('/me')
  .get(protect, getMyPosts);

router.route('/saved')
  .get(protect, getSavedPosts);

router.route('/:id')
  .delete(protect, deletePost);

router.route('/:id/like')
  .put(protect, likePost);

router.route('/:id/comment')
  .post(protect, commentPost);

router.route('/:id/share')
  .put(protect, sharePost);

router.route('/:id/save')
  .put(protect, savePost);

module.exports = router;
