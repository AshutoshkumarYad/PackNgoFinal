const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const Profile = require('../models/Profile');

// Get generic users for chat (excluding self)
router.get('/users', protect, async (req, res) => {
  try {
    const currentProfile = await Profile.findOne({ user: req.user.id });
    const followingIds = currentProfile ? currentProfile.following : [];
    const followerIds = currentProfile ? currentProfile.followers : [];

    // Combine both arrays to ensure chat is visible if at least one follows the other
    const combinedIds = [...new Set([
      ...followingIds.map(id => id.toString()),
      ...followerIds.map(id => id.toString())
    ])];

    // Fetch users that match
    const users = await User.find({ _id: { $in: combinedIds } }).select('name _id image');
    
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
    const groups = await Group.find({ members: req.user.id }).populate('members', 'name avatar');
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

// Delete 1-on-1 chat history
router.delete('/:userId', protect, async (req, res) => {
  try {
    await Message.deleteMany({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    });
    res.json({ msg: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin deletes entire group OR member leaves group
router.delete('/group/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });
    
    if (group.admin.toString() !== req.user.id) {
       // If not admin, just leave the group
       group.members = group.members.filter(m => m.toString() !== req.user.id);
       await group.save();
       return res.json({ msg: "Left group" });
    }
    
    // Admin delete
    await Message.deleteMany({ group: req.params.groupId });
    await group.deleteOne();
    res.json({ msg: "Group deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin removes a specific member from group
router.delete('/group/:groupId/members/:memberId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });
    if (group.admin.toString() !== req.user.id) {
       return res.status(401).json({ msg: "Only admin can remove members" });
    }
    if (req.params.memberId === req.user.id) {
       return res.status(400).json({ msg: "Admin cannot remove themselves" });
    }
    group.members = group.members.filter(m => m.toString() !== req.params.memberId);
    await group.save();
    
    // Repopulate members to return the updated group roster (optional but helpful for frontend)
    res.json({ msg: "Member removed", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload media for chat
router.post('/upload', protect, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const mediaUrl = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    res.json({ mediaUrl, mediaType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
