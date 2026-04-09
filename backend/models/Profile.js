const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  handle: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  avatar: { type: String, default: '' }, // Path to the uploaded file or URL
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // References to users following this profile
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  countriesVisited: { type: Number, default: 0 },
  kmTraveled: { type: Number, default: 0 },
  soloScore: { type: Number, default: 0 },
  badges: [{ type: String }],
  achievements: [{ type: String }],
  emergencyContacts: [{
    name: { type: String },
    phone: { type: String }
  }],
  liveLocation: {
    lat: { type: Number },
    lng: { type: Number },
    timestamp: { type: Date }
  },
  safetyPin: { type: String, default: '1234' },
  openToBuddy: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
