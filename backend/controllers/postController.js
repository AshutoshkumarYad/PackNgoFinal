const Post = require('../models/Post');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @route   GET /api/posts/feed
// @desc    Get all public posts for the global community timeline
exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = { visibility: 'public' };
    let currentUserId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key');
        currentUserId = decoded.id;
      } catch (err) {}
    }

    if (!currentUserId) {
      // Unauthenticated: return default chronological
      const posts = await Post.find(filter)
        .populate('user', ['name'])
        .populate('comments.user', ['name'])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return res.json(posts);
    }

    // Authenticated user: personalized feed
    const profile = await Profile.findOne({ user: currentUserId });
    const userObj = await User.findById(currentUserId);
    
    let explicitInterests = profile && profile.interests ? profile.interests.map(i => i.toLowerCase()) : [];
    let implicitInterests = [];
    
    // 1. Get implicit interests from liked posts
    const likedPosts = await Post.find({ likes: currentUserId }).select('tags').limit(20);
    likedPosts.forEach(p => {
      if (p.tags) p.tags.forEach(t => implicitInterests.push(t.toLowerCase()));
    });
    
    // 2. Get implicit interests from saved posts
    if (userObj && userObj.savedPosts && userObj.savedPosts.length > 0) {
      const savedPosts = await Post.find({ _id: { $in: userObj.savedPosts } }).select('tags').limit(20);
      savedPosts.forEach(p => {
        if (p.tags) p.tags.forEach(t => implicitInterests.push(t.toLowerCase()));
      });
    }

    // Combine explicit and implicit interests
    const allInterests = new Set([...explicitInterests, ...implicitInterests]);
    
    // Network lists
    const following = profile && profile.following ? profile.following.map(id => id.toString()) : [];
    const followers = profile && profile.followers ? profile.followers.map(id => id.toString()) : [];
    const networkSet = new Set([...following, ...followers]);

    // Fetch all public posts to sort them in memory
    // (For large DBs, this should be an aggregation pipeline)
    let allPosts = await Post.find(filter)
      .populate('user', ['name'])
      .populate('comments.user', ['name'])
      .lean();

    allPosts = allPosts.map(post => {
      let score = 0;
      
      // Time decay score (newer posts get slight edge)
      const timeScore = new Date(post.createdAt).getTime() / 1000000000000;
      score += timeScore;

      // Network Priority
      if (post.user && post.user._id && networkSet.has(post.user._id.toString())) {
        score += 1000;
      }

      // Interest Matching
      if (allInterests.size > 0) {
        if (post.tags && post.tags.length > 0) {
          post.tags.forEach(t => {
            if (allInterests.has(t.toLowerCase())) score += 50;
          });
        }
        
        const contentStr = `${post.title || ''} ${post.description || ''}`.toLowerCase();
        allInterests.forEach(interest => {
          if (contentStr.includes(interest)) score += 10;
        });
      }

      return { ...post, customScore: score };
    });

    // Sort by custom score descending
    allPosts.sort((a, b) => b.customScore - a.customScore);

    // Apply pagination
    const paginatedPosts = allPosts.slice(skip, skip + limit);

    res.json(paginatedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/posts/me
// @desc    Get all posts strictly for the current logged-in user
exports.getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: req.user.id })
      .populate('user', ['name'])
      .populate('comments.user', ['name'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/posts/user/:userId
// @desc    Get user posts with privacy check
exports.getUserPosts = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const profile = await Profile.findOne({ user: targetUserId });

    if (!profile) {
      return res.status(404).json({ msg: 'User profile not found' });
    }

    // Optional auth check
    let currentUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key');
        currentUserId = decoded.id;
      } catch (err) {}
    }

    const isOwner = currentUserId === targetUserId;
    const isFollower = currentUserId && profile.followers.some(f => f.toString() === currentUserId);

    if (profile.isPrivate && !isOwner && !isFollower) {
      return res.status(403).json({ msg: 'This account is private', isPrivateRestricted: true });
    }

    const posts = await Post.find({ user: targetUserId })
      .populate('user', ['name', 'avatar'])
      .populate('comments.user', ['name', 'avatar'])
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/posts
// @desc    Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, description, tags, visibility } = req.body;
    
    let mediaType = 'image';
    if (req.file && req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    }
    
    let parsedLocation = undefined;
    if (req.body.location) {
      try {
        parsedLocation = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
      } catch (e) {
        console.error("Location parsing error", e);
      }
    }
    
    const newPost = new Post({
      user: req.user.id,
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      visibility: visibility || 'public',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      mediaType,
      location: parsedLocation
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/posts/:id
// @desc    Delete a post by ID (only if owner)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this' });
    }

    await post.deleteOne();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if the post has already been liked by this user
    const isLiked = post.likes.filter(like => like.toString() === req.user.id).length > 0;

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like
      post.likes.unshift(req.user.id);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/posts/:id/comment
// @desc    Comment on a post
exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const newComment = {
      user: req.user.id,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();

    // Re-populate and return the comments
    const populatedPost = await Post.findById(req.params.id).populate('comments.user', ['name']);
    res.json(populatedPost.comments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/posts/:id/share
// @desc    Increment share counter
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.shares = (post.shares || 0) + 1;
    await post.save();
    res.json({ shares: post.shares });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/posts/:id/save
// @desc    Save or unsave a post (for current user)
exports.savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isSaved = user.savedPosts && user.savedPosts.filter(postId => postId.toString() === req.params.id).length > 0;

    if (isSaved) {
      // Unsave
      user.savedPosts = user.savedPosts.filter(postId => postId.toString() !== req.params.id);
    } else {
      // Save
      if(!user.savedPosts) user.savedPosts = [];
      user.savedPosts.unshift(req.params.id);
    }

    await user.save();
    res.json(user.savedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/posts/saved
// @desc    Get populated saved posts for current user
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedPosts',
      populate: [
        { path: 'user', select: 'name' },
        { path: 'comments.user', select: 'name' }
      ]
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Reverse to show newest saved first
    res.json(user.savedPosts.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
