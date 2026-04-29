const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const Trip = require('./models/Trip');
const Post = require('./models/Post');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/packngopro').then(async () => {
    const user = await User.findOne({ name: "Ashutosh Kumar Yadav" });
    if (!user) {
        console.log("User not found");
        process.exit();
    }
    
    const trips = await Trip.find({ user: user._id });
    const posts = await Post.find({ user: user._id });
    
    console.log("--- TRIPS ---");
    trips.forEach(t => {
        let isActiveTrip = false;
        if (t.expenses && t.expenses.length > 0) isActiveTrip = true;
        if (t.itinerary && t.itinerary.length > 0) isActiveTrip = true;
        
        console.log(`Trip: ${t.name}, Destination: ${t.destination}, IsActive: ${isActiveTrip}`);
        if (isActiveTrip && t.destination) {
            console.log(` -> extracted destination: "${t.destination.split(',').pop().trim().toLowerCase()}"`);
        }
    });
    
    console.log("\n--- POSTS ---");
    posts.forEach(p => {
        console.log(`Post: ${p.title}, Country: ${p.location && p.location.country}`);
        if (p.location && p.location.country) {
            console.log(` -> extracted destination: "${p.location.country.trim().toLowerCase()}"`);
        }
    });

    process.exit();
});
