const Trip = require('../models/Trip');

// @route   GET /api/trips
// @desc    Get logged in user's trips
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Get Trips Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   POST /api/trips
// @desc    Save or Update a trip
exports.saveTrip = async (req, res) => {
  try {
    const { id, name, destination, startDate, endDate, travelers, budget, travelStyle, itinerary, chatHistory, geminiHistory, hasGenerated, expenses } = req.body;

    let trip = await Trip.findOne({ _id: id, user: req.user.id }).catch(() => null);

    if (trip) {
      // Update
      trip.name = name;
      trip.destination = destination;
      trip.startDate = startDate;
      trip.endDate = endDate;
      trip.travelers = travelers;
      trip.budget = budget;
      trip.travelStyle = travelStyle;
      trip.itinerary = itinerary;
      trip.chatHistory = chatHistory;
      trip.geminiHistory = geminiHistory;
      trip.hasGenerated = hasGenerated;
      if (expenses !== undefined) trip.expenses = expenses;

      await trip.save();
      return res.json(trip);
    } else {
      // Create
      trip = await Trip.create({
        user: req.user.id,
        name, destination, startDate, endDate, travelers, budget, travelStyle, itinerary, chatHistory, geminiHistory, hasGenerated, expenses: expenses || []
      });
      return res.status(201).json(trip);
    }
  } catch (error) {
    console.error('Save Trip Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   DELETE /api/trips/:id
// @desc    Delete a user's trip
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    
    await Trip.deleteOne({ _id: req.params.id });
    res.json({ message: 'Trip removed' });
  } catch (error) {
    console.error('Delete Trip Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   GET /api/trips/:id/settlements
// @desc    Calculate settlement transactions for trip expenses
exports.getSettlements = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    
    const { calculateSettlements } = require('../utils/expenseSplitter');
    const result = calculateSettlements(trip.expenses);
    res.json(result);
  } catch (err) {
    console.error('Get Settlements Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
