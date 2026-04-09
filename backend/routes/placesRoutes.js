const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');

// GET /api/places/image?query=[city]
router.get('/image', placesController.getPlaceImage);

module.exports = router;
