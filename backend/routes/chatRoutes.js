const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');

// Get generic users for chat (excluding self)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('name _id image');
    const Profile = require('../models/Profile');
    const usersWithAvatar = await Promise.all(users.map(async (u) => {
      const profile = await Profile.findOne({ user: u._id }).select('avatar');
      return {
        _id: u._id,
        name: u.name,
        avatar: profile && profile.avatar ? profile.avatar : (u.image || null)
      };
    }));
    res.json(usersWithAvatar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new group
router.post('/groups', protect, async (req, res) => {
  try {
    const { name, members } = req.body;
    // ensure current user is in members array
    const memberSet = new Set(members);
    memberSet.add(req.user.id);
    const newGroup = await Group.create({
      name,
      admin: req.user.id,
      members: Array.from(memberSet)
    });
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's groups
router.get('/groups/me', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group chat history
router.get('/group/:groupId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId }).populate('sender', 'name').sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
