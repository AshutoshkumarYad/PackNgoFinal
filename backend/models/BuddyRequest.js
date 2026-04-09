const mongoose = require('mongoose');

const buddyRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('BuddyRequest', buddyRequestSchema);
