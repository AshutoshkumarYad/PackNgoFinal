const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { getMyProfile, updateProfile, triggerSOS, getTopUsers, followUser, getConnections, getRecommendations, updateLiveLocation, getTrackingLocation } = require('../controllers/profileController');

router.get('/top', protect, getTopUsers);
router.get('/connections', protect, getConnections);
router.get('/recommendations', protect, getRecommendations);
router.put('/follow/:id', protect, followUser);

router.route('/me')
  .get(protect, getMyProfile)
  .put(protect, upload.single('avatar'), updateProfile);

router.post('/sos', protect, triggerSOS);
router.post('/sos/location', protect, updateLiveLocation);
router.get('/track/:userId', getTrackingLocation);

module.exports = router;
