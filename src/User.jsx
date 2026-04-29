import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./User.css";
import Navbar from "./Navbar";
import Globe from 'react-globe.gl';

// Default Profile Data Fallback
const DEFAULT_PROFILE = {
  name: "Alex Johnson",
  handle: "@traveler_alex",
  bio: "Passionate solo traveler, photographer, and storyteller. Exploring hidden gems and sharing my adventures. Always seeking the next horizon!",
  location: "London, UK",
  avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662&auto=format&fit=crop",
  followers: 12890,
  following: 456,
  countriesVisited: 65,
  kmTraveled: 250000,
  soloScore: 9.2,
  badges: ["Solo Traveler", "Backpacker Elite", "Photo Master", "50+ Countries"],
  achievements: ["Mountain Explorer", "Urban Wanderer", "Coastal Cruiser", "Desert Discoverer"]
};

// Default Posts Data Fallback
const DEFAULT_POSTS = [
  {
    id: 1,
    type: "image",
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1470&auto=format&fit=crop",
    title: "Wandering Through Marrakech Souks",
    description: "Lost in the labyrinthine alleys of Marrakech, a feast for the senses.",
    tags: ["Morocco", "Marrakech", "Culture"],
    likes: 245,
    comments: 32
  },
  {
    id: 2,
    type: "image",
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cb1?q=80&w=1469&auto=format&fit=crop",
    title: "Chasing Waterfalls in Bali",
    description: "Found paradise at this hidden gem. The sound of water is so calming.",
    tags: ["Bali", "Indonesia", "Nature"],
    likes: 389,
    comments: 45
  },
  {
    id: 3,
    type: "text",
    title: "Packing Light for Long Trips",
    description: "My top 3 tips for minimalist packing: roll clothes, use packing cubes, and always bring a compact kit.",
    tags: ["TravelTips", "Packing"],
    likes: 88,
    comments: 14
  }
];

export default function User() {
  const navigate = useNavigate();

  // Primary State
  const [userData, setUserData] = useState(DEFAULT_PROFILE);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  
  // Interaction states
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [connections, setConnections] = useState({ followers: [], following: [] });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [activeActivityId, setActiveActivityId] = useState(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  const globeEl = useRef();
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 2.5;
      globeEl.current.controls().enableZoom = false;
    }
  }, []);

  const globeArcsData = [
    { startLat: 28.6139, startLng: 77.2090, endLat: 48.8566, endLng: 2.3522, color: ['#ec4899', '#2e7bff'] },
    { startLat: 28.6139, startLng: 77.2090, endLat: 35.6895, endLng: 139.6917, color: ['#ec4899', '#10b981'] },
    { startLat: 48.8566, startLng: 2.3522, endLat: 40.7128, endLng: -74.0060, color: ['#2e7bff', '#f59e0b'] }
  ];


  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", handle: "", bio: "", location: "", emergencyContacts: [{name:'', phone:''}, {name:'', phone:''}, {name:'', phone:''}], safetyPin: "", openToBuddy: false, avatar: null });

  // Watch My Back State
  const [escortActive, setEscortActive] = useState(false);
  const [escortTimeLeft, setEscortTimeLeft] = useState(0); // seconds
  const [escortDurationInput, setEscortDurationInput] = useState("30"); // minutes
  const [cancelPinInput, setCancelPinInput] = useState("");
  const escortIntervalRef = useRef(null);
  const sosWatchIdRef = useRef(null);

  // Create Post Modal State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", description: "", image: null, tags: "", visibility: "public" });

  const getUserToken = () => {
    const userStr = localStorage.getItem("packngo_user");
    return userStr ? JSON.parse(userStr).token : null;
  };

  // Load persistence on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      const token = getUserToken();
      if (!token) {
        setIsLoading(false);
        return navigate("/Login");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [profileRes, postsRes, savedRes, connRes, reviewsRes] = await Promise.all([
          axios.get("/api/profile/me", config),
          axios.get("/api/posts/me", config),
          axios.get("/api/posts/saved", config),
          axios.get("/api/profile/connections", config).catch(() => ({ data: { followers: [], following: [] } })),
          axios.get("/api/reviews/user/me", config).catch(() => ({ data: [] }))
        ]);
        
        const fetchedProfile = profileRes.data;
        if (fetchedProfile && fetchedProfile.user) {
          fetchedProfile.name = fetchedProfile.user.name;
        }
        
        setUserData({ ...DEFAULT_PROFILE, ...fetchedProfile });
        setPosts(postsRes.data || []);
        setSavedPosts(savedRes.data || []);
        setUserReviews(reviewsRes.data || []);
        if (connRes && connRes.data) {
          setConnections(connRes.data);
        }
      } catch (err) {
        console.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
      
      // Auto-ping GPS location for distance updates
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            await axios.post("/api/profile/location-ping", {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            }, config);
            
            // Re-fetch profile to sync updated kmTraveled
            const updatedProfileRes = await axios.get("/api/profile/me", config);
            if (updatedProfileRes.data) {
               setUserData(prev => ({ ...prev, kmTraveled: updatedProfileRes.data.kmTraveled }));
            }
          } catch (e) {
            console.error("Background GPS Ping failed", e);
          }
        }, () => {}, { enableHighAccuracy: false, timeout: 5000 });
      }
    };
    
    fetchData();
  }, [navigate]);

  // --- Profile Editing Logics ---
  const openEditProfile = () => {
    const contacts = userData.emergencyContacts && userData.emergencyContacts.length > 0 
      ? userData.emergencyContacts.map(c => ({name: c.name || "", phone: c.phone || ""}))
      : [];
    while (contacts.length < 3) contacts.push({name: '', phone: ''});

    setEditForm({
      name: userData.name || "",
      handle: userData.handle || "",
      bio: userData.bio || "",
      location: userData.location || "",
      interests: userData.interests ? userData.interests.join(', ') : "",
      emergencyContacts: contacts.slice(0, 3),
      safetyPin: userData.safetyPin || "",
      openToBuddy: userData.openToBuddy || false,
      isPrivate: userData.isPrivate || false,
      avatar: null
    });
    setIsEditingProfile(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const token = getUserToken();
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append("handle", editForm.handle);
      formData.append("bio", editForm.bio);
      formData.append("location", editForm.location);
      if (editForm.interests) formData.append("interests", editForm.interests);
      if (editForm.emergencyContacts) formData.append("emergencyContacts", JSON.stringify(editForm.emergencyContacts));
      if (editForm.safetyPin) formData.append("safetyPin", editForm.safetyPin);
      formData.append("isPrivate", editForm.isPrivate);
      if (editForm.avatar) {
        formData.append("avatar", editForm.avatar);
      }

      const config = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
      const { data } = await axios.put("/api/profile/me", formData, config);
      
      const updatedProfile = { ...userData, ...data };
      setUserData(updatedProfile);
      setIsEditingProfile(false);
    } catch(err) {
      console.error("Save profile error", err);
    }
  };

  const handleFollowToggle = async (targetId) => {
    const token = getUserToken();
    if (!token) return;
    try {
      const { data } = await axios.put(`/api/profile/follow/${targetId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update local state connections relying on the server response
      // Following modal shows 'connections.following'. We update the list by keeping those still in data.followingList
      // But data returns the whole nested object? Actually `followUser` in backend just returns `currentProfile.following` array, but we need full objects.
      // So we can blindly refetch connections via an inline api call for guaranteed safety
      const connRes = await axios.get("/api/profile/connections", { headers: { Authorization: `Bearer ${token}` } });
      if (connRes && connRes.data) {
         setConnections(connRes.data);
      }
    } catch(err) {
      console.error("Failed to unfollow", err);
    }
  };

  const handleToggleBuddy = async () => {
    const token = getUserToken();
    if (!token) return;
    const newStatus = !userData.openToBuddy;
    
    setUserData({ ...userData, openToBuddy: newStatus });
    
    try {
      const formData = new FormData();
      formData.append("openToBuddy", newStatus);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put("/api/profile/me", formData, config);
    } catch(err) {
      console.error("Failed to toggle buddy status", err);
      setUserData({ ...userData, openToBuddy: !newStatus });
    }
  };

  // --- Creating Post Logics ---
  const openCreatePost = () => {
    setPostForm({ title: "", description: "", image: null, tags: "", visibility: "public", location: null, country: "" });
    setIsCreatingPost(true);
    
    // Automatically tag location for the post
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        let country = "";
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.data && res.data.address && res.data.address.country) {
             country = res.data.address.country;
          }
        } catch (e) { console.error("Reverse Geocoding failed", e); }
        
        setPostForm(prev => ({...prev, location: { lat: latitude, lng: longitude }, country }));
      }, () => {});
    }
  };

  const publishPost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.description) return;
    const token = getUserToken();
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append("title", postForm.title);
      formData.append("description", postForm.description);
      formData.append("tags", postForm.tags);
      formData.append("visibility", postForm.visibility);
      if (postForm.image) {
        formData.append("image", postForm.image);
      }
      if (postForm.location || postForm.country) {
        const locationPayload = { ...(postForm.location || {}), country: postForm.country };
        formData.append("location", JSON.stringify(locationPayload));
      }

      const config = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
      const { data } = await axios.post("/api/posts", formData, config);
      
      data.user = { name: userData.name };
      data.type = data.mediaType || (data.image ? "image" : "text");
      
      setPosts([data, ...posts]);
      setIsCreatingPost(false);
    } catch(err) {
      console.error("Publish post error", err);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to permanently delete this post?")) {
      const token = getUserToken();
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/posts/${postId}`, config);
        setPosts(posts.filter(p => p._id !== postId && p.id !== postId));
      } catch (err) {
        console.error("Delete post error", err);
      }
    }
  };

  const getUserId = () => {
    const userStr = localStorage.getItem("packngo_user");
    return userStr ? JSON.parse(userStr)._id : null;
  };

  // --- Interaction Handlers ---
  const handleLike = async (postId, isSavedTab = false) => {
    const token = getUserToken();
    if (!token) return;
    try {
      const { data } = await axios.put(`/api/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` }});
      if (isSavedTab) {
         setSavedPosts(savedPosts.map(p => p._id === postId ? { ...p, likes: data } : p));
      } else {
         setPosts(posts.map(p => p._id === postId ? { ...p, likes: data } : p));
      }
    } catch (err) { console.error(err); }
  };

  const handleShare = async (postId, isSavedTab = false) => {
    const token = getUserToken();
    if (!token) return;
    try {
      const { data } = await axios.put(`/api/posts/${postId}/share`, {}, { headers: { Authorization: `Bearer ${token}` }});
      if (isSavedTab) {
         setSavedPosts(savedPosts.map(p => p._id === postId ? { ...p, shares: data.shares } : p));
      } else {
         setPosts(posts.map(p => p._id === postId ? { ...p, shares: data.shares } : p));
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async (postId) => {
    const token = getUserToken();
    if (!token) return;
    try {
      const { data } = await axios.put(`/api/posts/${postId}/save`, {}, { headers: { Authorization: `Bearer ${token}` }});
      // Updating UI is complex without re-fetching saved posts. So we will simply fetch them again.
      const savedRes = await axios.get("/api/posts/saved", { headers: { Authorization: `Bearer ${token}` }});
      setSavedPosts(savedRes.data);
    } catch (err) { console.error(err); }
  };

  const handleCommentSubmit = async (e, postId, isSavedTab = false) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const token = getUserToken();
    if (!token) return;
    try {
      const { data } = await axios.post(`/api/posts/${postId}/comment`, { text: commentText }, { headers: { Authorization: `Bearer ${token}` }});
      if (isSavedTab) {
         setSavedPosts(savedPosts.map(p => p._id === postId ? { ...p, comments: data } : p));
      } else {
         setPosts(posts.map(p => p._id === postId ? { ...p, comments: data } : p));
      }
      setCommentText("");
    } catch (err) { console.error(err); }
  };

  // --- WATCH MY BACK: VIRTUAL ESCORT ---
  const triggerSOSApi = async (reason) => {
    const token = getUserToken();
    if (!token) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. SOS failed to fetch location.");
      return;
    }

    // Clear previous tracking if any
    if (sosWatchIdRef.current) navigator.geolocation.clearWatch(sosWatchIdRef.current);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const payload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          reason,
          pin: cancelPinInput
        };
        const { data } = await axios.post("/api/profile/sos", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("LIVE TRACKING INITIATED! Contacts notified with your tracking link.");

        // Start CONTINUOUS tracking
        sosWatchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            try {
              await axios.post("/api/profile/sos/location", {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              }, { headers: { Authorization: `Bearer ${token}` } });
            } catch (e) {
              console.error('Failed to sync location to SOS tracking', e);
            }
          },
          (err) => console.log('Continuous tracking error', err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

      } catch (err) {
        if (err.response && err.response.status === 400) {
          alert("Cancel Failed: " + err.response.data.msg);
        } else {
          console.error("SOS Trigger Error", err);
          alert("Failed to connect to SOS server.");
        }
      }
    }, () => {
      alert("Please allow location access to use the SOS feature.");
    });
  };

  const handleImmediateSOS = () => {
    if (window.confirm("Are you sure you want to trigger an Immediate SOS? Your real-time location will be tracked and sent to contacts.")) {
      triggerSOSApi('immediate');
    }
  };

  const startEscort = () => {
    const mins = parseInt(escortDurationInput);
    if (!mins || mins <= 0) return;
    setEscortTimeLeft(mins * 60);
    setEscortActive(true);
  };

  const cancelEscort = async () => {
    if (!cancelPinInput) {
      alert("Please enter your Safety PIN to disarm.");
      return;
    }
    const token = getUserToken();
    if (!token) return;

    try {
      const { data } = await axios.post("/api/profile/sos", { reason: 'cancel', pin: cancelPinInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(data.msg);
      setEscortActive(false);
      setEscortTimeLeft(0);
      setCancelPinInput("");
      if (sosWatchIdRef.current) {
        navigator.geolocation.clearWatch(sosWatchIdRef.current);
        sosWatchIdRef.current = null;
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert("Invalid PIN. Escort remains active.");
      } else {
        alert("Server error verifying PIN.");
      }
    }
  };

  useEffect(() => {
    if (escortActive && escortTimeLeft > 0) {
      escortIntervalRef.current = setInterval(() => {
        setEscortTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(escortIntervalRef.current);
            triggerSOSApi('timer_expired');
            setEscortActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(escortIntervalRef.current);
  }, [escortActive, escortTimeLeft, cancelPinInput]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="app">
        <header className="up-nav-global">
          <div className="up-logo-img">
             <img src="/logo.png" alt="PackNgo" />
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
      <Navbar activePage="" />
      
      <main className="profile-layout">
        {/* LEFT + CENTER MAIN AREA */}
        <div className="main">
          {/* Top profile card */}
          <section className="profile-card">
            <div className="profile-header">
              <img
                className="avatar"
                src={userData.avatar?.startsWith('/uploads') ? `${userData.avatar}` : userData.avatar}
                alt="avatar"
              />
              <div className="profile-info">
                <h1>{userData.name}</h1>
                <p className="handle">{userData.handle}</p>
                <p className="bio">{userData.bio}</p>
                <p className="location">📍 {userData.location}</p>
                {userData.interests && userData.interests.length > 0 && (
                  <p className="interests" style={{ color: '#a0a0b8', fontSize: '13px', marginTop: '4px' }}>
                    💡 Interests: {userData.interests.join(', ')}
                  </p>
                )}
                <div className="stats-row">
                  <div className="stat" onClick={() => setShowFollowersModal(true)} style={{ cursor: 'pointer' }} title="View Followers">
                    <div className="stat-number">{connections.followers?.length || userData.followers?.length || 0}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                  <div className="stat" onClick={() => setShowFollowingModal(true)} style={{ cursor: 'pointer' }} title="View Following">
                    <div className="stat-number">{connections.following?.length || userData.following?.length || 0}</div>
                    <div className="stat-label">Following</div>
                  </div>
                  <button className="edit-btn" onClick={openEditProfile}>
                    Edit Profile
                  </button>
                  <label className={`buddy-toggle-wrapper ${userData.openToBuddy ? 'active' : ''}`} title="Toggle if you are open to buddy requests">
                    <input className="buddy-toggle-input" type="checkbox" checked={!!userData.openToBuddy} onChange={handleToggleBuddy} />
                    <div className="buddy-toggle-switch"></div>
                    <span className="buddy-toggle-text">Looking for Travel Buddy</span>
                  </label>
                </div>
                <div className="badges-inline">
                  {(showAllBadges ? userData.badges : userData.badges?.slice(0, 5))?.map((badge, index) => (
                    <span key={index} className="chip">{badge}</span>
                  ))}
                  {userData.badges && userData.badges.length > 5 && (
                    <span className="chip" onClick={() => setShowAllBadges(!showAllBadges)} style={{cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)'}}>
                      {showAllBadges ? '▴ Less' : `▾ +${userData.badges.length - 5}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <nav className="tabs">
            <button 
              className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button 
              className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              Videos
            </button>
            <button 
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            <button 
              className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </button>
            
            <button className="create-post-btn" onClick={openCreatePost}>
              ➕ Create Post
            </button>
          </nav>

          {/* Grid content */}
          {activeTab === 'posts' && (
            <div className="content-grid">
              {posts.filter(post => {
                const content = ((post.title || "") + " " + (post.description || "") + " " + (post.tags || []).join(" ")).toLowerCase();
                return !content.includes("question") && !content.includes("tip");
              }).map((post, index) => {
                const isMediaPost = post.image || post.type === "image" || post.type === "video" || post.mediaType === "video";
                if (isMediaPost && post.image) {
                  const mediaUrl = post.image?.startsWith('/uploads') ? `${post.image}` : post.image;
                  return (
                    <div key={post._id || post.id} className="post-card large">
                      {post.mediaType === 'video' ? (
                        <video className="post-image" src={mediaUrl} controls />
                      ) : (
                        <img className="post-image" src={mediaUrl} alt={post.title} />
                      )}
                      <div className="post-body">
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        <div className="tags">
                          {post.tags?.map((tag, i) => (
                            <span key={i}>{tag}</span>
                          ))}
                        </div>
                        {post.likes !== undefined && (
                          <>
                            <div className="post-stats">
                              <span onClick={() => handleLike(post._id)} style={{cursor: 'pointer', color: post.likes?.includes(getUserId()) ? '#ef4444' : 'inherit'}}>
                                {post.likes?.includes(getUserId()) ? '❤️' : '♡'} {post.likes?.length || 0}
                              </span>
                              <span onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)} style={{cursor: 'pointer'}}>
                                💬 {post.comments?.length || 0}
                              </span>
                              <button className="post-delete-btn" onClick={() => deletePost(post._id || post.id)}>🗑️</button>
                            </div>
                            
                            {/* Comments component */}
                            {activeCommentId === post._id && (
                              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <form onSubmit={(e) => handleCommentSubmit(e, post._id, false)} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                  <input 
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '13px' }}
                                  />
                                </form>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                  {post.comments?.map((c, i) => (
                                    <div key={i} style={{ fontSize: '12px', padding: '4px 0' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {c.user?.avatar ? (
                                          <img src={c.user.avatar.startsWith('/uploads') ? `${c.user.avatar}` : c.user.avatar} alt={c.user?.name || "U"} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#2e7bff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                            {c.user?.name ? c.user.name.charAt(0).toUpperCase() : "U"}
                                          </div>
                                        )}
                                        <strong>{c.user?.name || "User"}:</strong> 
                                        <span style={{ color: '#aaa' }}>{c.text}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={post._id || post.id} className={`side-card ${index === 2 ? 'tall' : ''}`}>
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                      <div className="tags">
                        {post.tags?.map((tag, i) => (
                          <span key={i}>{tag}</span>
                        ))}
                      </div>
                      {post.likes !== undefined && (
                        <>
                          <div className="post-stats" style={{marginTop: '15px', color: '#888', fontSize: '12px'}}>
                            <span onClick={() => handleLike(post._id)} style={{cursor: 'pointer', marginRight: '12px', color: post.likes?.includes(getUserId()) ? '#ef4444' : 'inherit'}}>
                              {post.likes?.includes(getUserId()) ? '❤️' : '♡'} {post.likes?.length || 0}
                            </span>
                            <span onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)} style={{cursor: 'pointer'}}>
                              💬 {post.comments?.length || 0}
                            </span>
                            <button className="post-delete-btn" onClick={() => deletePost(post._id || post.id)}>🗑️</button>
                          </div>
                          
                          {/* Comments component */}
                          {activeCommentId === post._id && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                              <form onSubmit={(e) => handleCommentSubmit(e, post._id, false)} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <input 
                                  type="text" 
                                  placeholder="Add a comment..." 
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '13px' }}
                                />
                              </form>
                              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {post.comments?.map((c, i) => (
                                  <div key={i} style={{ fontSize: '12px', padding: '4px 0' }}>
                                    <strong>{c.user?.name || "User"}:</strong> <span style={{ color: '#aaa' }}>{c.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="content-grid">
              {posts.filter(p => p.mediaType === 'video').length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-icon">🎥</div>
                  <h3>No videos yet</h3>
                  <p>Start sharing your travel moments!</p>
                </div>
              ) : (
                posts.filter(p => p.mediaType === 'video').map((post) => {
                  const mediaUrl = post.image?.startsWith('/uploads') ? `${post.image}` : post.image;
                  return (
                    <div key={post._id || post.id} className="post-card large">
                      <video className="post-image" src={mediaUrl} controls />
                      <div className="post-body">
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        <div className="tags">
                          {post.tags?.map((tag, i) => (
                            <span key={i}>{tag}</span>
                          ))}
                        </div>
                        {post.likes !== undefined && (
                          <>
                            <div className="post-stats">
                              <span onClick={() => handleLike(post._id)} style={{cursor: 'pointer', color: post.likes?.includes(getUserId()) ? '#ef4444' : 'inherit'}}>
                                {post.likes?.includes(getUserId()) ? '❤️' : '♡'} {post.likes?.length || 0}
                              </span>
                              <span onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)} style={{cursor: 'pointer'}}>
                                💬 {post.comments?.length || 0}
                              </span>
                              <button className="post-delete-btn" onClick={() => deletePost(post._id || post.id)}>🗑️</button>
                            </div>
                            
                            {/* Comments component */}
                            {activeCommentId === post._id && (
                              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <form onSubmit={(e) => handleCommentSubmit(e, post._id, false)} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                  <input 
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '13px' }}
                                  />
                                </form>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                  {post.comments?.map((c, i) => (
                                    <div key={i} style={{ fontSize: '12px', padding: '4px 0' }}>
                                      <strong>{c.user?.name || "User"}:</strong> <span style={{ color: '#aaa' }}>{c.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="content-grid">
              {userReviews.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-icon">⭐</div>
                  <h3>No reviews yet</h3>
                  <p>Share your experiences about places you've visited!</p>
                </div>
              ) : (
                userReviews.map((review) => (
                  <div key={review._id} style={{ backgroundColor: '#1a1f2e', borderRadius: '12px', padding: '25px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <h3 onClick={() => navigate(`/Destinationdetail?name=${encodeURIComponent(review.destinationName)}`)} style={{ margin: 0, fontSize: '18px', cursor: 'pointer', color: '#38bdf8' }}>
                        {review.destinationName}
                      </h3>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[...Array(review.rating)].map((_, i) => (
                          <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', flex: 1, margin: 0 }}>
                      {review.text}
                    </p>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="content-grid">
              {savedPosts.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-icon">🔖</div>
                  <h3>No saved posts</h3>
                  <p>Save posts to view them here later</p>
                </div>
              ) : (
                savedPosts.map((post, index) => {
                  const mediaUrl = post.image?.startsWith('/uploads') ? `${post.image}` : post.image;
                  return (
                    <div key={post._id || post.id} className="post-card large">
                      {post.mediaType === 'video' ? (
                        <video className="post-image" src={mediaUrl} controls />
                      ) : (
                        post.image && <img className="post-image" src={mediaUrl} alt={post.title} />
                      )}
                      
                      <div className="post-body">
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        
                        <div className="post-stats" style={{marginTop: '15px', color: '#888', fontSize: '13px', display: 'flex', gap: '15px', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                          <span onClick={() => handleLike(post._id, true)} style={{cursor: 'pointer', color: post.likes?.includes(getUserId()) ? '#ef4444' : 'inherit'}}>
                            {post.likes?.includes(getUserId()) ? '❤️' : '♡'} {post.likes?.length || 0}
                          </span>
                          <span onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)} style={{cursor: 'pointer'}}>
                            💬 {post.comments?.length || 0}
                          </span>
                          <span onClick={() => handleShare(post._id, true)} style={{cursor: 'pointer'}}>
                            ↻ {post.shares || 0}
                          </span>
                          <span onClick={() => handleSave(post._id)} style={{cursor: 'pointer', marginLeft: 'auto', color: '#3b82f6'}}>
                            Ⓜ️ Saved
                          </span>
                        </div>
                        
                        {/* Comments component */}
                        {activeCommentId === post._id && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <form onSubmit={(e) => handleCommentSubmit(e, post._id, true)} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                              <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '13px' }}
                              />
                            </form>
                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                              {post.comments?.map((c, i) => (
                                <div key={i} style={{ fontSize: '12px', padding: '4px 0' }}>
                                  <strong>{c.user?.name || "User"}:</strong> <span style={{ color: '#aaa' }}>{c.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="sidebar">
          <section className="panel" style={{ border: '1px solid rgba(248, 113, 113, 0.3)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(248, 113, 113, 0.05) 100%)' }}>
            <h3 style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>🛡️ Watch My Back</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>Virtual escort timer. If it expires, your emergency contacts receive your GPS location.</p>
            
            {escortActive ? (
               <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                 <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', fontVariantNumeric: 'tabular-nums' }}>
                   {formatTime(escortTimeLeft)}
                 </div>
                 <input 
                   type="password" 
                   placeholder="PIN to Cancel" 
                   value={cancelPinInput}
                   onChange={e => setCancelPinInput(e.target.value)}
                   style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', textAlign: 'center', letterSpacing: '4px' }}
                   maxLength={4}
                 />
                 <button onClick={cancelEscort} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                   Arrive Safely
                 </button>
               </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <input 
                     type="number" 
                     value={escortDurationInput}
                     onChange={e => setEscortDurationInput(e.target.value)}
                     style={{ width: '60px', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', textAlign: 'center' }}
                   />
                   <button onClick={startEscort} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                     Start Timer (mins)
                   </button>
                 </div>
                 <button className="sos-btn" onClick={handleImmediateSOS} style={{ marginTop: '5px' }}>🚨 TRIGGER IMMEDIATE SOS</button>
               </div>
            )}
          </section>

          <section className="panel">
            <h3>Travel Stats</h3>
            <div className="panel-row">
              <span>Countries Visited</span>
              <strong>{userData.countriesVisited}</strong>
            </div>
            <div className="panel-row">
              <span>Kilometers Traveled</span>
              <strong>{userData.kmTraveled?.toLocaleString()} km</strong>
            </div>
            <div className="panel-row">
              <span>Solo Score</span>
              <strong>{userData.soloScore} / 10</strong>
            </div>
          </section>

          <section className="panel">
            <h3>Badges Earned</h3>
            {(showAllBadges ? userData.badges : userData.badges?.slice(0, 5))?.map((badge, index) => (
              <div key={index} className="badge-card">🏆 {badge}</div>
            ))}
            {userData.badges && userData.badges.length > 5 && (
                <button onClick={() => setShowAllBadges(!showAllBadges)} style={{width: '100%', padding: '8px', marginTop: '10px', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'}}>
                  {showAllBadges ? 'Show Less ▴' : `View ${userData.badges.length - 5} More ▾`}
                </button>
            )}
            {userData.badges && userData.badges.length >= 20 && (
                <div style={{ marginTop: '15px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '8px', padding: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', marginBottom: '4px', textTransform: 'uppercase' }}>🎉 Ultimate Traveler Reward</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#000', letterSpacing: '2px', background: '#ffe4e6', display: 'inline-block', padding: '2px 10px', borderRadius: '4px', border: '2px dashed #f43f5e' }}>PACKNGO20</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginTop: '8px', lineHeight: '1.4' }}>You've earned 20+ badges! 🥇<br/>Use this exclusive coupon code for <strong>20% off</strong> your next trip booking.</div>
                </div>
            )}
          </section>

          <section className="panel">
            <h3>Your Activity</h3>
            {posts.filter(post => {
              const content = ((post.title || "") + " " + (post.description || "") + " " + (post.tags || []).join(" ")).toLowerCase();
              return content.includes("question") || content.includes("tip");
            }).slice(0, 5).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#a0a0b8' }}>You haven't posted any questions or tips yet.</p>
            ) : (
              posts.filter(post => {
                const content = ((post.title || "") + " " + (post.description || "") + " " + (post.tags || []).join(" ")).toLowerCase();
                return content.includes("question") || content.includes("tip");
              }).slice(0, 5).map(post => (
                 <div key={post._id || post.id} onClick={() => setActiveActivityId(activeActivityId === (post._id || post.id) ? null : (post._id || post.id))} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                   <div style={{ fontSize: '11px', color: '#2e7bff', marginBottom: '4px', fontWeight: 'bold' }}>
                     {((post.title || "") + " " + (post.description || "") + " " + (post.tags || []).join(" ")).toLowerCase().includes('question') ? 'QUESTION' : 'TIP'}
                   </div>
                   <div style={{ fontSize: '14px', color: '#fff', marginBottom: '4px' }}>{post.title}</div>
                   {activeActivityId === (post._id || post.id) && (
                     <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', color: '#ccc' }}>
                        <p>{post.description}</p>
                        <div className="post-stats" style={{marginTop: '10px', color: '#888', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px', display: 'flex', gap: '10px'}}>
                          <span>❤️ {post.likes?.length || 0}</span>
                          <span>💬 {post.comments?.length || 0}</span>
                        </div>
                     </div>
                   )}
                 </div>
              ))
            )}
          </section>



          <section className="panel">
            <button className="link-btn" onClick={(e) => { 
              e.preventDefault(); 
              localStorage.removeItem("packngo_user");
              localStorage.removeItem("packngo_user_profile");
              navigate("/Login"); 
            }}>Sign out</button>
          </section>
        </aside>
      </main>

      {/* --- MODALS --- */}

      {/* FOLLOWERS MODAL */}
      {showFollowersModal && (
        <div className="up-modal-overlay" onClick={() => setShowFollowersModal(false)}>
          <div className="up-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="up-modal-header">
              <h2>Followers</h2>
              <button className="up-modal-close" onClick={() => setShowFollowersModal(false)}>×</button>
            </div>
            <div className="up-modal-body" style={{ maxHeight: '300px', overflowY: 'auto', padding: '20px' }}>
              {connections.followers.length === 0 ? <p style={{ color: '#aaa', textAlign: 'center' }}>No followers yet.</p> : (
                connections.followers.map(f => (
                  <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <img src={f.avatar?.startsWith('/uploads') ? `${f.avatar}` : (f.avatar || 'https://via.placeholder.com/40')} alt={f.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff' }}>{f.name}</div>
                      <div style={{ fontSize: '12px', color: '#a0a0b8' }}>{f.handle}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOLLOWING MODAL */}
      {showFollowingModal && (
        <div className="up-modal-overlay" onClick={() => setShowFollowingModal(false)}>
          <div className="up-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="up-modal-header">
              <h2>Following</h2>
              <button className="up-modal-close" onClick={() => setShowFollowingModal(false)}>×</button>
            </div>
            <div className="up-modal-body" style={{ maxHeight: '300px', overflowY: 'auto', padding: '20px' }}>
              {connections.following.length === 0 ? <p style={{ color: '#aaa', textAlign: 'center' }}>Not following anyone.</p> : (
                connections.following.map(f => (
                  <div key={f._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={f.avatar?.startsWith('/uploads') ? `${f.avatar}` : (f.avatar || 'https://via.placeholder.com/40')} alt={f.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{f.name}</div>
                        <div style={{ fontSize: '12px', color: '#a0a0b8' }}>{f.handle}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollowToggle(f._id)}
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#a0a0b8', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: '0.2s', ':hover': { background: '#f87171', color: '#fff' } }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f87171'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#a0a0b8'; }}
                    >
                      Unfollow
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isEditingProfile && (
        <div className="up-modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="up-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="up-modal-header">
              <h2>Edit Profile</h2>
              <button className="up-modal-close" onClick={() => setIsEditingProfile(false)}>×</button>
            </div>
            <form onSubmit={saveProfile}>
              <div style={{ display: 'flex', gap: '20px', maxWidth: '800px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#2e7bff', marginBottom: '10px' }}>General Information</h4>
                  <div className="up-form-group">
                    <label>Display Name</label>
                    <input required className="up-form-input" type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="up-form-group">
                    <label>Username / Handle</label>
                    <input required className="up-form-input" type="text" value={editForm.handle} onChange={e => setEditForm({...editForm, handle: e.target.value})} />
                  </div>
                  <div className="up-form-group">
                    <label>Location</label>
                    <input required className="up-form-input" type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                  </div>
                  <div className="up-form-group">
                    <label>Interests (comma separated)</label>
                    <input className="up-form-input" type="text" value={editForm.interests} onChange={e => setEditForm({...editForm, interests: e.target.value})} placeholder="Hiking, Photography, Food" />
                  </div>
                  <div className="up-form-group">
                    <label>Bio</label>
                    <textarea required className="up-form-input" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={3} style={{ resize: 'vertical' }} />
                  </div>
                  <div className="up-form-group">
                    <label>Upload New Avatar (optional)</label>
                    <input className="up-form-input" type="file" accept="image/*" onChange={e => setEditForm({...editForm, avatar: e.target.files[0]})} />
                  </div>
                </div>

                <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
                  <h4 style={{ color: '#f87171', marginBottom: '10px' }}>Emergency Contact Details</h4>
                  {editForm.emergencyContacts && editForm.emergencyContacts.map((contact, index) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <label style={{ fontSize: '13px', color: '#a0a0b8', marginBottom: '8px', display: 'block' }}>Contact {index + 1}</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input className="up-form-input" style={{ flex: 1, marginBottom: 0 }} type="text" value={contact.name} onChange={e => {
                          const newContacts = [...editForm.emergencyContacts];
                          newContacts[index].name = e.target.value;
                          setEditForm({...editForm, emergencyContacts: newContacts});
                        }} placeholder="Name" />
                        <input className="up-form-input" style={{ flex: 1, marginBottom: 0 }} type="tel" value={contact.phone} onChange={e => {
                          const newContacts = [...editForm.emergencyContacts];
                          newContacts[index].phone = e.target.value;
                          setEditForm({...editForm, emergencyContacts: newContacts});
                        }} placeholder="Phone" />
                      </div>
                    </div>
                  ))}
                  <div className="up-form-group">
                    <label>Safety PIN (4 digits)</label>
                    <input required className="up-form-input" type="password" value={editForm.safetyPin} onChange={e => setEditForm({...editForm, safetyPin: e.target.value})} minLength={4} maxLength={4} placeholder="1234" />
                  </div>
                  <div className="up-form-group" style={{ marginTop: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#fff' }}>
                      <input 
                        type="checkbox" 
                        checked={editForm.isPrivate} 
                        onChange={e => setEditForm({...editForm, isPrivate: e.target.checked})}
                        style={{ width: '18px', height: '18px' }}
                      />
                      Make Account Private (Only followers can see your posts and full profile)
                    </label>
                  </div>
                </div>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }} />
              <div className="up-form-actions">
                <button type="button" className="up-btn-cancel" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                <button type="submit" className="up-btn-save">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreatingPost && (
        <div className="up-modal-overlay" onClick={() => setIsCreatingPost(false)}>
          <div className="up-modal-content" onClick={e => e.stopPropagation()}>
            <div className="up-modal-header">
              <h2>Create a New Post</h2>
              <button className="up-modal-close" onClick={() => setIsCreatingPost(false)}>×</button>
            </div>
            <form onSubmit={publishPost}>
              <div className="up-form-group">
                <label>Post Title</label>
                <input required className="up-form-input" type="text" placeholder="Wandering through Kyoto..." value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              </div>
              <div className="up-form-group">
                <label>Upload Media (Image or Video, optional)</label>
                <input className="up-form-input" type="file" accept="image/*,video/*" onChange={e => setPostForm({...postForm, image: e.target.files[0]})} />
              </div>
              <div className="up-form-group">
                <label>Hash Tags (comma separated)</label>
                <input className="up-form-input" type="text" placeholder="Japan, Travel, Food" value={postForm.tags} onChange={e => setPostForm({...postForm, tags: e.target.value})} />
              </div>
              <div className="up-form-group">
                <label>Country (optional)</label>
                <input className="up-form-input" type="text" placeholder="e.g. India, Japan" value={postForm.country || ""} onChange={e => setPostForm({...postForm, country: e.target.value})} />
                <span style={{ fontSize: '11px', color: '#a0a0b8' }}>Adding a country will count towards your Countries Visited stats.</span>
              </div>
              <div className="up-form-group">
                <label>Visibility</label>
                <select className="up-form-input" value={postForm.visibility} onChange={e => setPostForm({...postForm, visibility: e.target.value})}>
                  <option value="public">Global (Any user can see)</option>
                  <option value="followers">Followers Only</option>
                </select>
              </div>
              <div className="up-form-group">
                <label>Story / Description</label>
                <textarea required className="up-form-input" placeholder="Tell us about your adventure..." value={postForm.description} onChange={e => setPostForm({...postForm, description: e.target.value})} />
              </div>
              <div className="up-form-actions">
                <button type="button" className="up-btn-cancel" onClick={() => setIsCreatingPost(false)}>Cancel</button>
                <button type="submit" className="up-btn-save">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}