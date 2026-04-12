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

    // Optionally we could filter out follower-only posts. 
    // Right now, simply getting all 'public' posts is easy globally.
    // If user is logged in, perhaps they get public + followers.
    let filter = { visibility: 'public' };
    
    const posts = await Post.find(filter)
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

// @route   POST /api/posts
// @desc    Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, description, tags, visibility } = req.body;
    
    let mediaType = 'image';
    if (req.file && req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    }
    
    const newPost = new Post({
      user: req.user.id,
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      visibility: visibility || 'public',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      mediaType
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
