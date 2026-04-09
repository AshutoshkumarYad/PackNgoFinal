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
        if (t.destination) {
          uniqueDestinations.add(t.destination.split(',').pop().trim());
        }
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
    if (soloCount >= 10) autoBadges.push("Nomad Elite 🥇");
    else if (soloCount >= 5) autoBadges.push("Solo Explorer 🥈");
    else if (soloCount >= 1) autoBadges.push("Lone Wolf 🥉");

    if (coupleCount >= 10) autoBadges.push("Globetrotting Partners 🥇");
    else if (coupleCount >= 5) autoBadges.push("Romantic Wanderers 🥈");
    else if (coupleCount >= 1) autoBadges.push("Dynamic Duo 🥉");

    if (groupCount >= 10) autoBadges.push("Party Plane 🥇");
    else if (groupCount >= 5) autoBadges.push("Squad Goals 🥈");
    else if (groupCount >= 1) autoBadges.push("Pack Leader 🥉");

    // Travel Style Badges
    if (cultureCount >= 5) autoBadges.push("Cultural Connoisseur 🏺");
    else if (cultureCount >= 1) autoBadges.push("History Buff 🏛️");
    
    if (natureCount >= 5) autoBadges.push("Mountain Explorer ⛰️");
    else if (natureCount >= 1) autoBadges.push("Nature Lover 🌲");
    
    if (beachCount >= 5) autoBadges.push("Island Hopper 🏝️");
    else if (beachCount >= 1) autoBadges.push("Beach Bum 🏖️");
    
    if (foodCount >= 5) autoBadges.push("Culinary Master 👨‍🍳");
    else if (foodCount >= 1) autoBadges.push("Foodie Explorer 🌮");
    
    if (partyCount >= 5) autoBadges.push("Party Animal 🥳");
    else if (partyCount >= 1) autoBadges.push("Night Owl 🦉");

    // Activity Badges
    if (totalExpenses >= 5) autoBadges.push("Budget Planner 💰");
    if (generatedItineraries >= 2) autoBadges.push("Master Organizer 📅");
    if (posts.length >= 3) autoBadges.push("Community Voice 🗣️");

    // Countries computed from engaged trips only
    profile.countriesVisited = uniqueDestinations.size;
    
    // kmTraveled calculated via dynamic usage formula
    profile.kmTraveled = (activeTripsCount * 1500) + (totalExpenses * 100) + (posts.length * 50);

    if (profile.kmTraveled > 10000) autoBadges.push("Elite Traveler 🌍");
    if (profile.countriesVisited > 3) autoBadges.push("Global Citizen 🛫");

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
    const { handle, bio, location, safetyPin, emergencyContacts, openToBuddy } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (handle !== undefined) profileFields.handle = handle;
    if (bio !== undefined) profileFields.bio = bio;
    if (location !== undefined) profileFields.location = location;
    if (safetyPin !== undefined) profileFields.safetyPin = safetyPin;
    if (openToBuddy !== undefined) profileFields.openToBuddy = openToBuddy === 'true' || openToBuddy === true;
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

    const trackingLink = `http://localhost:5173/track/${profile.user._id}`;
    
    console.log(`\n\n🚨🚨 [MOCK SMS DISPATCHED] 🚨🚨`);
    if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
      profile.emergencyContacts.forEach((contact, idx) => {
        console.log(`--- CONTACT ${idx+1} ---`);
        console.log(`TO: ${contact.name} (${contact.phone})`);
        console.log(`MESSAGE: EMERGENCY! ${profile.user.name} has triggered a "Watch My Back" SOS alert (${reason}).`);
        console.log(`LIVE TRACKING: ${trackingLink}`);
      });
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
    
    // Find users by location matching if the user has a location set
    let topProfiles = [];
    if (currentProfile && currentProfile.location) {
      topProfiles = await Profile.find({
        user: { $ne: req.user.id },
        location: currentProfile.location
      })
      .populate('user', ['name'])
      .limit(6);
    }
    
    // Fallback: pad with top users by followers count if not enough exact matches
    if (topProfiles.length < 6) {
      const moreProfiles = await Profile.find({
        user: { $ne: req.user.id, $nin: topProfiles.map(p => p.user._id) }
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

    // Fetch all other profiles
    const otherProfiles = await Profile.find({ user: { $ne: req.user.id } }).populate('user', ['name']);
    
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
