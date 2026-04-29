const Profile = require('../models/Profile');

// @route   GET /api/profile/me
// @desc    Get current user profile
exports.getMyProfile = async (req, res) => {
  try {
    const Trip = require('../models/Trip');
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name']);
    if (!profile) {
      profile = await Profile.create({ user: req.user.id, handle: '@' + req.user.name.toLowerCase().replace(/\s+/g, '_') });
      profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name']);
    }

    // Dynamic Badge & Stats Calculation based on actual User Activity
    const Post = require('../models/Post');
    const trips = await Trip.find({ user: req.user.id });
    const posts = await Post.find({ user: req.user.id });
    
    let soloCount = 0, coupleCount = 0, groupCount = 0;
    let cultureCount = 0, natureCount = 0, beachCount = 0, foodCount = 0, partyCount = 0;
    
    let totalExpenses = 0;
    let generatedItineraries = 0;
    let activeTripsCount = 0;
    const uniqueDestinations = new Set();
    
    trips.forEach(t => {
      // Check if user actively engaged with this trip
      let isActiveTrip = false;
      
      if (t.expenses && t.expenses.length > 0) {
        totalExpenses += t.expenses.length;
        isActiveTrip = true;
      }
      if (t.itinerary && t.itinerary.length > 0) {
        generatedItineraries++;
        isActiveTrip = true;
      }
      
      if (isActiveTrip) {
        activeTripsCount++;
      }

      // Travelers
      if (t.travelers && t.travelers.includes("Solo")) soloCount++;
      else if (t.travelers && t.travelers.includes("Couple")) coupleCount++;
      else if (t.travelers && t.travelers.includes("Group")) groupCount++;
      
      // Travel Style
      if (t.travelStyle) {
        if (t.travelStyle.includes("Culture")) cultureCount++;
        else if (t.travelStyle.includes("Nature")) natureCount++;
        else if (t.travelStyle.includes("Beaches")) beachCount++;
        else if (t.travelStyle.includes("Food")) foodCount++;
        else if (t.travelStyle.includes("Nightlife")) partyCount++;
      }
    });

    let autoBadges = [];
    if (soloCount >= 30) autoBadges.push("Nomad Elite 🥇");
    else if (soloCount >= 15) autoBadges.push("Solo Explorer 🥈");
    else if (soloCount >= 5) autoBadges.push("Lone Wolf 🥉");

    if (coupleCount >= 30) autoBadges.push("Globetrotting Partners 🥇");
    else if (coupleCount >= 15) autoBadges.push("Romantic Wanderers 🥈");
    else if (coupleCount >= 5) autoBadges.push("Dynamic Duo 🥉");

    if (groupCount >= 30) autoBadges.push("Party Plane 🥇");
    else if (groupCount >= 15) autoBadges.push("Squad Goals 🥈");
    else if (groupCount >= 5) autoBadges.push("Pack Leader 🥉");

    // Travel Style Badges
    if (cultureCount >= 15) autoBadges.push("Cultural Connoisseur 🏺");
    else if (cultureCount >= 5) autoBadges.push("History Buff 🏛️");
    
    if (natureCount >= 15) autoBadges.push("Mountain Explorer ⛰️");
    else if (natureCount >= 5) autoBadges.push("Nature Lover 🌲");
    
    if (beachCount >= 15) autoBadges.push("Island Hopper 🏝️");
    else if (beachCount >= 5) autoBadges.push("Beach Bum 🏖️");
    
    if (foodCount >= 15) autoBadges.push("Culinary Master 👨‍🍳");
    else if (foodCount >= 5) autoBadges.push("Foodie Explorer 🌮");
    
    if (partyCount >= 15) autoBadges.push("Party Animal 🥳");
    else if (partyCount >= 5) autoBadges.push("Night Owl 🦉");

    // Activity Badges
    if (totalExpenses >= 25) autoBadges.push("Budget Planner 💰");
    if (generatedItineraries >= 10) autoBadges.push("Master Organizer 📅");
    if (posts.length >= 15) autoBadges.push("Community Voice 🗣️");

    // Get posts count and add Geotagged countries to uniqueDestinations
    posts.forEach(p => {
       if (p.location && p.location.country) {
          uniqueDestinations.add(p.location.country.trim().toLowerCase());
       }
    });

    profile.countriesVisited = uniqueDestinations.size;
    profile.soloScore = Math.min(10, soloCount);
    // kmTraveled is no longer overridden by random formula. It accumulates independently via pingLocation.

    // Persist calculated badges and stats
    profile.badges = autoBadges.length > 0 ? autoBadges : ["New Traveler"];
    
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/profile/me
// @desc    Update profile & avatar
exports.updateProfile = async (req, res) => {
  try {
    const { handle, bio, location, safetyPin, emergencyContacts, openToBuddy, interests, isPrivate } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (handle !== undefined) profileFields.handle = handle;
    if (bio !== undefined) profileFields.bio = bio;
    if (location !== undefined) profileFields.location = location;
    if (safetyPin !== undefined) profileFields.safetyPin = safetyPin;
    if (openToBuddy !== undefined) profileFields.openToBuddy = openToBuddy === 'true' || openToBuddy === true;
    if (isPrivate !== undefined) profileFields.isPrivate = isPrivate === 'true' || isPrivate === true;
    if (interests !== undefined) {
      try {
        profileFields.interests = typeof interests === 'string' ? JSON.parse(interests) : interests;
      } catch(e) {
        profileFields.interests = interests.split(',').map(i => i.trim()).filter(i => i);
      }
    }
    if (emergencyContacts !== undefined) {
      try {
        profileFields.emergencyContacts = typeof emergencyContacts === 'string' ? JSON.parse(emergencyContacts) : emergencyContacts;
      } catch (e) {
        console.log('Error parsing emergency contacts', e);
      }
    }
    
    // If multer uploaded a file, update avatar path
    if (req.file) {
      profileFields.avatar = `/uploads/${req.file.filename}`;
    }

    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profileFields.user = req.user.id;
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/profile/sos
// @desc    Trigger Watch My Back Emergency SOS
exports.triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude, reason, pin } = req.body;
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name']);
    
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    // Validate PIN if they are trying to cancel the escort
    if (pin && pin !== profile.safetyPin) {
      return res.status(400).json({ msg: "Invalid Safety PIN" });
    }

    if (reason === 'cancel') {
      return res.json({ msg: "Virtual Escort disarmed successfully." });
    }

    // Start tracking session
    profile.liveLocation = {
      lat: latitude,
      lng: longitude,
      timestamp: new Date()
    };
    await profile.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const trackingLink = `${frontendUrl}/track/${profile.user._id}`;
    
    console.log(`\n\n🚨🚨 [SOS ALERT DISPATCHED] 🚨🚨`);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    let client;
    if (accountSid && authToken) {
      client = require('twilio')(accountSid, authToken);
    }

    if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
      for (let idx = 0; idx < profile.emergencyContacts.length; idx++) {
        const contact = profile.emergencyContacts[idx];
        const messageBody = `EMERGENCY! ${profile.user.name} has triggered a "Watch My Back" SOS alert (${reason}). LIVE TRACKING: ${trackingLink}`;
        
        console.log(`--- CONTACT ${idx+1} ---`);
        console.log(`TO: ${contact.name} (${contact.phone})`);
        console.log(`MESSAGE: ${messageBody}`);

        if (client && twilioPhoneNumber) {
          try {
            await client.messages.create({
              body: messageBody,
              from: twilioPhoneNumber,
              to: contact.phone
            });
            console.log(`✅ SMS successfully sent to ${contact.phone}`);
          } catch (smsError) {
            console.error(`❌ Failed to send SMS to ${contact.phone}:`, smsError.message);
          }
        } else {
          console.log(`⚠️ Twilio credentials missing in .env. Mock SMS only.`);
        }
      }
    } else {
      console.log(`WARNING: No emergency contacts configured!`);
      console.log(`LIVE TRACKING AVAILABLE AT: ${trackingLink}`);
    }
    console.log(`==================================\n\n`);

    res.json({ msg: "SOS Alert Dispatched Successfully." });
  } catch (err) {
    console.error("SOS Trigger Error:", err);
    res.status(500).send("Server Error");
  }
};

// @route   PUT /api/profile/follow/:id
// @desc    Follow or unfollow a user
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    
    if (targetUserId === currentUserId) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    let targetProfile = await Profile.findOne({ user: targetUserId });
    let currentProfile = await Profile.findOne({ user: currentUserId });

    if (!targetProfile) {
      targetProfile = await Profile.create({ user: targetUserId });
    }
    if (!currentProfile) {
      currentProfile = await Profile.create({ user: currentUserId });
    }

    const isFollowing = currentProfile.following.some(id => id.toString() === targetUserId);

    if (isFollowing) {
      // Unfollow
      currentProfile.following = currentProfile.following.filter(id => id.toString() !== targetUserId);
      targetProfile.followers = targetProfile.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentProfile.following.unshift(targetUserId);
      targetProfile.followers.unshift(currentUserId);
    }

    await currentProfile.save();
    await targetProfile.save();

    res.json({ targetFollowers: targetProfile.followers.length, followingList: currentProfile.following });
  } catch (err) {
    console.error("Follow User Error:", err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/profile/top
// @desc    Get suggested users to follow based on travel preferences
exports.getTopUsers = async (req, res) => {
  try {
    const currentProfile = await Profile.findOne({ user: req.user.id });
    
    // Exclude self and already followed users
    let excludeUsers = [req.user.id];
    if (currentProfile && currentProfile.following) {
      excludeUsers = [...excludeUsers, ...currentProfile.following];
    }

    let query = { user: { $nin: excludeUsers } };
    if (currentProfile && currentProfile.interests && currentProfile.interests.length > 0) {
       query.interests = { $in: currentProfile.interests };
    }

    // Find users by location matching if the user has a location set
    let topProfiles = [];
    if (currentProfile && currentProfile.location) {
      topProfiles = await Profile.find({ ...query, location: currentProfile.location })
      .populate('user', ['name'])
      .limit(6);
    }
    
    // Fallback: pad with top users by followers count if not enough exact matches
    if (topProfiles.length < 6) {
      const moreProfiles = await Profile.find({
        ...query,
        user: { $nin: [...excludeUsers, ...topProfiles.map(p => p.user._id)] }
      })
      .sort({ countriesVisited: -1, followers: -1 })
      .populate('user', ['name'])
      .limit(6 - topProfiles.length);
      
      topProfiles = [...topProfiles, ...moreProfiles];
    }

    res.json(topProfiles);
  } catch (err) {
    console.error("Get Top Users Error:", err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/profile/connections
// @desc    Get detailed list of followers and following
exports.getConnections = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    const followerProfiles = await Profile.find({ user: { $in: profile.followers } }).populate('user', ['name']);
    const followingProfiles = await Profile.find({ user: { $in: profile.following } }).populate('user', ['name']);
    
    const formatProfile = (p) => ({
      _id: p.user._id,
      name: p.user.name,
      avatar: p.avatar,
      handle: p.handle,
      bio: p.bio
    });

    res.json({
      followers: followerProfiles.map(formatProfile),
      following: followingProfiles.map(formatProfile)
    });
  } catch (err) {
    console.error("Get Connections Error:", err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/profile/recommendations
// @desc    Get algorithmic user recommendations based on collaborative filtering of badges
exports.getRecommendations = async (req, res) => {
  try {
    const currentProfile = await Profile.findOne({ user: req.user.id });
    if (!currentProfile) return res.status(404).json({ msg: "Profile not found" });

    // Exclude self and already followed users
    let excludeUsers = [req.user.id];
    if (currentProfile && currentProfile.following) {
      excludeUsers = [...excludeUsers, ...currentProfile.following];
    }
    
    let query = { user: { $nin: excludeUsers } };
    if (currentProfile && currentProfile.interests && currentProfile.interests.length > 0) {
        query.interests = { $in: currentProfile.interests };
    }
    const otherProfiles = await Profile.find(query).populate('user', ['name']);
    
    // Collaborative filtering scoring
    const scoredProfiles = otherProfiles.map(p => {
      let score = 0;
      
      // Feature 1: Badge Overlap (Strongest indicator of travel style)
      if (currentProfile.badges && p.badges) {
        currentProfile.badges.forEach(badge => {
          if (p.badges.includes(badge)) score += 5;
        });
      }
      
      // Feature 2: Geographical proximity based on location
      if (currentProfile.location && p.location && currentProfile.location.trim().toLowerCase() === p.location.trim().toLowerCase()) {
        score += 3;
      }
      
      // Feature 3: Country experience similarity
      const visitedDiff = Math.abs((currentProfile.countriesVisited || 0) - (p.countriesVisited || 0));
      if (visitedDiff <= 2) score += 2; // Similar experience levels
      
      // Feature 4: Interest overlap scoring
      if (currentProfile.interests && p.interests) {
         currentProfile.interests.forEach(interest => {
           if (p.interests.some(pi => pi.toLowerCase() === interest.toLowerCase())) score += 10;
         });
      }
      
      return { profile: p, score };
    });
    
    // Sort descending by score, take top 5
    scoredProfiles.sort((a, b) => b.score - a.score);
    const recommendations = scoredProfiles.slice(0, 5).map(sp => ({
      _id: sp.profile._id,
      user: {
        _id: sp.profile.user._id,
        name: sp.profile.user.name
      },
      avatar: sp.profile.avatar,
      handle: sp.profile.handle,
      bio: sp.profile.bio,
      badges: sp.profile.badges,
      followers: sp.profile.followers || [],
      similarityScore: sp.score
    }));

    res.json(recommendations);
  } catch (err) {
    console.error("Get Recommendations Error:", err);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/profile/sos/location
// @desc    Continuously update live location during an active SOS
exports.updateLiveLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    profile.liveLocation = {
      lat,
      lng,
      timestamp: new Date()
    };
    await profile.save();
    
    res.json({ msg: "Location synced." });
  } catch (err) {
    console.error("Update Live Location Error:", err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/profile/track/:userId
// @desc    Public fetch for emergency contacts to see live tracking maps
exports.getTrackingLocation = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    let profile = await Profile.findOne({ user: targetUserId }).populate('user', ['name']);
    
    if (!profile) return res.status(404).json({ msg: "Tracking session not found." });

    res.json({
      name: profile.user.name,
      avatar: profile.avatar,
      liveLocation: profile.liveLocation
    });
  } catch (err) {
    console.error("Get Tracking Error:", err);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/profile/location-ping
// @desc    Calculate and add precise GPS distance
exports.pingLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({msg: "Lat/Lng required"});
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    let distanceTraveled = 0;
    if (profile.lastKnownLocation && profile.lastKnownLocation.lat && profile.lastKnownLocation.lng) {
      // Haversine formula
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat - profile.lastKnownLocation.lat) * Math.PI / 180;
      const dLng = (lng - profile.lastKnownLocation.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(profile.lastKnownLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceTraveled = R * c;
      
      // Prevent massive jumps (e.g. ignore > 15000km in one ping) and ignore tiny GPS jitter (< 0.1km)
      if (distanceTraveled > 0.1 && distanceTraveled < 15000) {
         profile.kmTraveled = Math.round((profile.kmTraveled || 0) + distanceTraveled);
      }
    }

    profile.lastKnownLocation = {
      lat,
      lng,
      timestamp: new Date()
    };
    
    await profile.save();
    res.json({ msg: "Location tracked", kmAdded: distanceTraveled, total: profile.kmTraveled });
  } catch (err) {
    console.error("Ping Location Error:", err);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/profile/user/:id
// @desc    Get user profile by user ID with privacy logic
exports.getProfileById = async (req, res) => {
  try {
    // Attempt to find by profile user ID
    const profile = await Profile.findOne({ user: req.params.id }).populate('user', ['name', 'email']);

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    // Check optional authentication
    let currentUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key');
        currentUserId = decoded.id;
      } catch (err) {}
    }

    // If profile is public or the requester is the owner, return full profile
    if (!profile.isPrivate || (currentUserId && currentUserId === req.params.id)) {
      return res.json(profile);
    }

    // If private, check if requester is a follower
    const isFollower = currentUserId && profile.followers.some(f => f.toString() === currentUserId);
    
    if (isFollower) {
      return res.json(profile);
    }

    // Restricted profile
    const restrictedProfile = {
      _id: profile._id,
      user: profile.user,
      name: profile.user?.name,
      handle: profile.handle,
      avatar: profile.avatar,
      bio: profile.bio,
      badges: profile.badges?.slice(0, 3) || [],
      isPrivateRestricted: true,
      followers: profile.followers,
      following: profile.following
    };

    res.json(restrictedProfile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
};
