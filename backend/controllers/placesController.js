const axios = require('axios');

exports.getPlaceImage = async (req, res) => {
  try {
    const { query } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // Fallback if the user hasn't added a key or if query is missing
    if (!apiKey || apiKey === 'YOUR_GOOGLE_PLACES_API_KEY_HERE' || !query) {
      return res.redirect('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80');
    }

// Phase 1: Search for the place using Places API (New)
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const searchConfig = {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.photos'
      }
    };
    
    const searchResponse = await axios.post(searchUrl, { textQuery: query }, searchConfig);
    
    if (searchResponse.data && searchResponse.data.places && searchResponse.data.places.length > 0) {
      const photos = searchResponse.data.places[0].photos;
      
      if (photos && photos.length > 0) {
        // photo.name looks like "places/PLACE_ID/photos/PHOTO_REFERENCE"
        const photoName = photos[0].name;
        
        // Phase 2: Fetch the public stateless Image URI securely without exposing API keys to the browser
        const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true&key=${apiKey}`;
        
        const photoStream = await axios.get(photoUrl);
        
        if (photoStream.data && photoStream.data.photoUri) {
          // Immediately redirect to the stateless public Google CDN URI!
          return res.redirect(photoStream.data.photoUri);
        }
      }
    }

    // If Google couldn't find a photo, fallback to an Unsplash generic landscape
    return res.redirect('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80');

  } catch (error) {
    console.error('Google Places API Error:', error.response?.data || error.message);
    return res.redirect('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80');
  }
};
