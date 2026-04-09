const mongoose = require('mongoose');

const exploreSearchSchema = new mongoose.Schema({
  query: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true // Normalizes query to ensure cached queries are matched correctly
  },
  destinations: [{
    city: String,
    tag: String,
    reviews: Number,
    rating: Number,
    days: String,
    budget: String,
    region: String,
    img: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExploreSearch', exploreSearchSchema);
