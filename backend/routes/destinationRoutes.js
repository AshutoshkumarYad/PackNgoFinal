const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');

// Destination Detail caching endpoints
router.get('/detail/:name', destinationController.getDestinationDetail);
router.post('/detail', destinationController.createDestinationDetail);

// Explore Cards caching endpoints
router.get('/explore', destinationController.searchExplore);
router.post('/explore', destinationController.createExploreCards);

module.exports = router;
