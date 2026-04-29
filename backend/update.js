const mongoose = require('mongoose');
const Post = require('./models/Post');
mongoose.connect('mongodb://127.0.0.1:27017/packngopro').then(async () => {
  await Post.updateOne({ title: 'Banaras and its beauty ' }, { $set: { "location.country": 'India' } });
  console.log('Updated post');
  process.exit();
});
