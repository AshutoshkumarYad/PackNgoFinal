const mongoose = require('mongoose');

const destinationDetailSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // The Destination name
  heroDescription: String,
  rating: String,
  locationText: String,
  season: String,
  aboutText: String,
  safety: {
    overall: String,
    soloFemale: String,
    transport: String,
    health: String,
    hazards: String,
    political: String,
    emergency: String
  },
  budget: {
    hotelHigh: String,
    hotelMid: String,
    hostel: String,
    meals: String
  },
  attractions: [{ name: String, img: String }],
  itineraries: [{ title: String, desc: String, expanded: Boolean }],
  reviews: [{ name: String, rating: Number, text: String }],
  nearby: [{ name: String, img: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DestinationDetail', destinationDetailSchema);
