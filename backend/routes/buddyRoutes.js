const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const BuddyRequest = require('../models/BuddyRequest');

const Profile = require('../models/Profile');
const Trip = require('../models/Trip');

// GET all active buddy requests
router.get('/', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    // Always include user's own requests
    const ownRequests = await BuddyRequest.find({ user: req.user.id })
      .populate('user', 'name image avatar')
      .sort({ createdAt: -1 });

    if (!profile || !profile.openToBuddy) {
      return res.json(ownRequests);
    }

    const followingList = profile ? profile.following.map(id => id.toString()) : [];
    
    const trips = await Trip.find({ user: req.user.id });
    const destinations = trips.map(t => t.destination.split(',')[0].trim());

    // Only skip fetching extra records if we aren't following anyone AND have no active trips
    if (destinations.length === 0 && followingList.length === 0) {
      return res.json(ownRequests);
    }

    const orConditions = [{ user: req.user.id }];
    
    // Add condition: Any request from people I follow
    if (followingList.length > 0) {
      orConditions.push({ user: { $in: profile.following } });
    }

    // Add condition: Any request matching my destinations
    destinations.forEach(dest => {
      orConditions.push({ destination: { $regex: new RegExp(dest, 'i') } });
    });

    let requests = await BuddyRequest.find({ $or: orConditions })
      .populate('user', 'name image avatar')
      .sort({ createdAt: -1 });

    const userIds = requests.map(r => r.user._id);
    const profiles = await Profile.find({ user: { $in: userIds } });
    const profileMap = {};
    profiles.forEach(p => profileMap[p.user.toString()] = p.openToBuddy);

    requests = requests.filter(r => {
      const requesterId = r.user._id.toString();
      // Always see my own
      if (requesterId === req.user.id) return true;
      // Always see people I am actively following
      if (followingList.includes(requesterId)) return true;
      // If it's a stranger from the destination regex match, they must be open to buddy matching
      return profileMap[requesterId] === true;
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new buddy request
router.post('/', protect, async (req, res) => {
  try {
    const { destination, date, description } = req.body;
    const newRequest = await BuddyRequest.create({
      user: req.user.id,
      destination,
      date,
      description
    });
    
    const populated = await BuddyRequest.findById(newRequest._id).populate('user', 'name image avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT connect to a buddy request
router.put('/:id/connect', protect, async (req, res) => {
  try {
    const request = await BuddyRequest.findById(req.params.id);
    if (!request.connections.includes(req.user.id)) {
      request.connections.push(req.user.id);
      await request.save();
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
