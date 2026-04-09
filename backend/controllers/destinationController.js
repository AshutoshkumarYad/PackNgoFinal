const DestinationDetail = require('../models/DestinationDetail');
const ExploreSearch = require('../models/ExploreSearch');

exports.getDestinationDetail = async (req, res) => {
  try {
    const { name } = req.params;
    const destination = await DestinationDetail.findOne({ title: new RegExp(`^${name}$`, 'i') });
    if (destination) {
      return res.status(200).json(destination);
    }
    return res.status(404).json({ msg: 'Destination not found in database' });
  } catch (error) {
    console.error('Error fetching destination detail:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createDestinationDetail = async (req, res) => {
  try {
    const data = req.body;
    const destination = await DestinationDetail.findOneAndUpdate(
      { title: new RegExp(`^${data.title}$`, 'i') },
      data,
      { new: true, upsert: true }
    );
    res.status(201).json(destination);
  } catch (error) {
    console.error('Error saving destination detail:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.searchExplore = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ msg: 'Query parameter is required' });
    }
    const search = await ExploreSearch.findOne({ query: q.toLowerCase() });
    if (search) {
      return res.status(200).json(search.destinations);
    }
    return res.status(404).json({ msg: 'Explore results not found for query' });
  } catch (error) {
    console.error('Error fetching explore searches:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createExploreCards = async (req, res) => {
  try {
    const { query, destinations } = req.body;
    
    if (!query || !destinations) {
       return res.status(400).json({ msg: 'Missing query or destinations' });
    }

    const savedSearch = await ExploreSearch.findOneAndUpdate(
      { query: query.toLowerCase() },
      { query: query.toLowerCase(), destinations },
      { new: true, upsert: true }
    );
    
    res.status(201).json(savedSearch.destinations);
  } catch (error) {
    console.error('Error saving explore search:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
