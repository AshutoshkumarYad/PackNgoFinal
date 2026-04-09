const express = require('express');
const router = express.Router();
const { getTrips, saveTrip, deleteTrip, getSettlements } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTrips)
  .post(protect, saveTrip);

router.route('/:id')
  .delete(protect, deleteTrip);

router.route('/:id/settlements')
  .get(protect, getSettlements);

module.exports = router;
