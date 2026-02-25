import React, { useState, useEffect } from "react";
import "./User.css";

export default function User() {
  // State for user profile data
  const [userData, setUserData] = useState({
    name: "Loading...",
    handle: "@loading",
    bio: "",
    location: "",
    avatar: "man.jpg!d",
    followers: 0,
    following: 0,
    countriesVisited: 0,
    kmTraveled: 0,
    soloScore: 0,
    badges: [],
    achievements: []
  });

  // State for posts
  const [posts, setPosts] = useState([]);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchUserData();
      fetchUserPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Simulate API call to fetch user data
  const fetchUserData = async () => {
    try {
      // In a real app, replace this with your actual API call:
      // const response = await fetch('YOUR_API_URL/api/user/profile', {
      //   headers: { 'Authorization': `Bearer ${yourToken}` }
      // });
      // const data = await response.json();
      
      // Simulated API response with dynamic data
      const data = {
        name: "Alex Johnson",
        handle: "@traveler_alex",
        bio: "Passionate solo traveler, photographer, and storyteller. Exploring hidden gems and sharing my adventures. Always seeking the next horizon!",
        location: "London, UK",
        avatar: "man.jpg!d",
        followers: Math.floor(12890 + Math.random() * 100), // Simulates real-time changes
        following: Math.floor(456 + Math.random() * 10),
        countriesVisited: 65,
        kmTraveled: 250000 + Math.floor(Math.random() * 1000),
        soloScore: (9.2 + Math.random() * 0.3).toFixed(1),
        badges: ["Solo Traveler", "Backpacker Elite", "Photo Master", "50+ Countries"],
        achievements: ["Mountain Explorer", "Urban Wanderer", "Coastal Cruiser", "Desert Discoverer"]
      };
      
      setUserData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      // In a real app, replace this with your actual API call:
      // const response = await fetch('YOUR_API_URL/api/user/posts');
      // const data = await response.json();
      
      const postsData = [
        {
          id: 1,
          type: "image",
          image: "marrakech.jpg",
          title: "Wandering Through Marrakech Souks",
          description: "Lost in the labyrinthine alleys of Marrakech, a feast for the senses.",
          tags: ["Morocco", "Marrakech", "Souk", "Culture"],
          likes: Math.floor(245 + Math.random() * 50),
          comments: Math.floor(32 + Math.random() * 10)
        },
        {
          id: 2,
          type: "image",
          image: "waterfall.webp",
          title: "Chasing Waterfalls in Bali",
          description: "Found paradise at this hidden gem. The sound of water is so calming.",
          tags: ["Bali", "Indonesia", "Waterfall", "Nature"],
          likes: Math.floor(389 + Math.random() * 50),
          comments: Math.floor(45 + Math.random() * 10)
        },
        {
          id: 3,
          type: "text",
          title: "Packing Light for Long Trips",
          description: "My top 3 tips for minimalist packing: roll clothes, use packing cubes, and always bring a compact laundry kit.",
          tags: ["TravelTips", "Packing", "Budget"]
        },
        {
          id: 4,
          type: "image",
          image: "kyoto.jpg",
          title: "Serenity in Kyoto Temples",
          description: "The ancient beauty of Kyoto never ceases to amaze.",
          tags: ["Japan", "Kyoto", "Temples", "History"],
          likes: Math.floor(512 + Math.random() * 50),
          comments: Math.floor(67 + Math.random() * 10)
        },
        {
          id: 5,
          type: "image",
          image: "patagonia.jpg",
          title: "Patagonia Adventures",
          description: "Unforgettable trek through the rugged landscapes of Patagonia. Every view is a postcard.",
          tags: ["Patagonia", "Trekking", "Adventure"],
          likes: Math.floor(678 + Math.random() * 50),
          comments: Math.floor(89 + Math.random() * 10)
        },
        {
          id: 6,
          type: "text",
          title: "Best Apps for Solo Travelers",
          description: "Citymapper for navigation, Hostelworld for accommodation, and Splitwise for shared expenses.",
          tags: ["Apps", "SoloTravel", "Tools"]
        }
      ];
      
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle profile edit
  const handleEditProfile = () => {
    alert("Edit Profile - This would open a modal or navigate to edit page");
  };

  // Handle SOS button
  const handleSOS = () => {
    alert("🚨 SOS Alert sent! Emergency contacts have been notified.");
  };

  if (isLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="logo-container">
            <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L8 12V22C8 28.5 13 34.5 20 36C27 34.5 32 28.5 32 22V12L20 5Z" fill="#4A90E2" stroke="#2D5F8E" strokeWidth="2"/>
              <path d="M20 14L15 17V23L20 26L25 23V17L20 14Z" fill="white"/>
            </svg>
            <h1 className="logo-text">
              Pac<span className="logo-highlight">KN</span>Go
            </h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your travel journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Logo Header */}
      <header className="app-header">
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 5L8 12V22C8 28.5 13 34.5 20 36C27 34.5 32 28.5 32 22V12L20 5Z" fill="#4A90E2" stroke="#2D5F8E" strokeWidth="2"/>
            <path d="M20 14L15 17V23L20 26L25 23V17L20 14Z" fill="white"/>
          </svg>
          <h1 className="logo-text">
            Pac<span className="logo-highlight">KN</span>Go
          </h1>
        </div>
      </header>
      
      <div className="profile-layout">
        {/* LEFT + CENTER MAIN AREA */}
        <div className="main">
          {/* Top profile card */}
          <div className="profile-card">
            <div className="profile-header">
              <img
                className="avatar"
                src={userData.avatar}
                alt="avatar"
              />
              <div className="profile-info">
                <h1>{userData.name}</h1>
                <p className="handle">{userData.handle}</p>
                <p className="bio">{userData.bio}</p>
                <p className="location">📍 {userData.location}</p>
                <div className="stats-row">
                  <div className="stat">
                    <div className="stat-number">{userData.followers.toLocaleString()}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">{userData.following}</div>
                    <div className="stat-label">Following</div>
                  </div>
                  <button className="edit-btn" onClick={handleEditProfile}>
                    Edit Profile
                  </button>
                </div>
                <div className="badges-inline">
                  {userData.badges.map((badge, index) => (
                    <span key={index} className="chip">{badge}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => handleTabChange('posts')}
            >
              Posts
            </button>
            <button 
              className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => handleTabChange('videos')}
            >
              Videos
            </button>
            <button 
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              Reviews
            </button>
            <button 
              className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              Saved
            </button>
          </div>

          {/* Grid content */}
          {activeTab === 'posts' && (
            <div className="content-grid">
              {posts.map((post, index) => {
                if (post.type === "image") {
                  return (
                    <div key={post.id} className="post-card large">
                      <img className="post-image" src={post.image} alt={post.title} />
                      <div className="post-body">
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        <div className="tags">
                          {post.tags.map((tag, i) => (
                            <span key={i}>{tag}</span>
                          ))}
                        </div>
                        {post.likes && (
                          <div className="post-stats">
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={post.id} className={`side-card ${index === 2 ? 'tall' : ''}`}>
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                      <div className="tags">
                        {post.tags.map((tag, i) => (
                          <span key={i}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="empty-state">
              <div className="empty-icon">🎥</div>
              <h3>No videos yet</h3>
              <p>Start sharing your travel moments!</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>No reviews yet</h3>
              <p>Share your experiences about places you've visited!</p>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <h3>No saved posts</h3>
              <p>Save posts to view them here later</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="sidebar">
          <div className="panel">
            <h3>Travel Stats</h3>
            <div className="panel-row">
              <span>Countries Visited</span>
              <strong>{userData.countriesVisited}</strong>
            </div>
            <div className="panel-row">
              <span>Kilometers Traveled</span>
              <strong>{userData.kmTraveled.toLocaleString()} km</strong>
            </div>
            <div className="panel-row">
              <span>Solo Score</span>
              <strong>{userData.soloScore} / 10</strong>
            </div>
          </div>

          <div className="panel">
            <h3>Badges Earned</h3>
            {userData.achievements.map((achievement, index) => (
              <div key={index} className="badge-card">🏆 {achievement}</div>
            ))}
          </div>

          <div className="panel">
            <button className="sos-btn" onClick={handleSOS}>🚨 SOS</button>
            <button className="link-btn">Sign out</button>
          </div>
        </aside>
      </div>
    </div>
  );
}