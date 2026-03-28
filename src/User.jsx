import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./User.css";
import Navbar from "./Navbar";

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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", handle: "", bio: "", location: "" });

  // Create Post Modal State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", description: "", image: "", tags: "" });

  // Load persistence on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    const savedProfile = localStorage.getItem("packngo_user_profile");
    if (savedProfile) {
      setUserData(JSON.parse(savedProfile));
    }

    const savedPosts = localStorage.getItem("packngo_user_posts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(DEFAULT_POSTS);
    }

    setIsLoading(false);
  }, []);

  // --- Profile Editing Logics ---
  const openEditProfile = () => {
    setEditForm({
      name: userData.name,
      handle: userData.handle,
      bio: userData.bio,
      location: userData.location
    });
    setIsEditingProfile(true);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = { ...userData, ...editForm };
    setUserData(updatedProfile);
    localStorage.setItem("packngo_user_profile", JSON.stringify(updatedProfile));
    setIsEditingProfile(false);
  };

  // --- Creating Post Logics ---
  const openCreatePost = () => {
    setPostForm({ title: "", description: "", image: "", tags: "" });
    setIsCreatingPost(true);
  };

  const publishPost = (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.description) return;

    const newPost = {
      id: Date.now(),
      type: postForm.image.trim() ? "image" : "text",
      image: postForm.image.trim(),
      title: postForm.title,
      description: postForm.description,
      tags: postForm.tags.split(',').map(t => t.trim()).filter(t => t),
      likes: 0,
      comments: 0
    };

    const newPostsArray = [newPost, ...posts];
    setPosts(newPostsArray);
    localStorage.setItem("packngo_user_posts", JSON.stringify(newPostsArray));
    setIsCreatingPost(false);
  };

  const deletePost = (postId) => {
    if (window.confirm("Are you sure you want to permanently delete this post?")) {
      const updatedPosts = posts.filter(p => p.id !== postId);
      setPosts(updatedPosts);
      localStorage.setItem("packngo_user_posts", JSON.stringify(updatedPosts));
    }
  };

  const handleSOS = () => {
    alert("🚨 SOS Alert sent! Emergency contacts have been notified.");
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
                  <button className="edit-btn" onClick={openEditProfile}>
                    Edit Profile
                  </button>
                </div>
                <div className="badges-inline">
                  {userData.badges?.map((badge, index) => (
                    <span key={index} className="chip">{badge}</span>
                  ))}
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
              {posts.map((post, index) => {
                if (post.type === "image" && post.image) {
                  return (
                    <div key={post.id} className="post-card large">
                      <img className="post-image" src={post.image} alt={post.title} />
                      <div className="post-body">
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        <div className="tags">
                          {post.tags?.map((tag, i) => (
                            <span key={i}>{tag}</span>
                          ))}
                        </div>
                        {post.likes !== undefined && (
                          <div className="post-stats">
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                            <button className="post-delete-btn" onClick={() => deletePost(post.id)}>🗑️</button>
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
                        {post.tags?.map((tag, i) => (
                          <span key={i}>{tag}</span>
                        ))}
                      </div>
                      {post.likes !== undefined && (
                        <div className="post-stats" style={{marginTop: '15px', color: '#888', fontSize: '12px'}}>
                          <span style={{marginRight: '12px'}}>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                          <button className="post-delete-btn" onClick={() => deletePost(post.id)}>🗑️</button>
                        </div>
                      )}
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
            {userData.achievements?.map((achievement, index) => (
              <div key={index} className="badge-card">🏆 {achievement}</div>
            ))}
          </section>

          <section className="panel">
            <button className="sos-btn" onClick={handleSOS}>🚨 SOS Emergency Alert</button>
            <button className="link-btn" onClick={(e) => { e.preventDefault(); navigate("/Login"); }}>Sign out</button>
          </section>
        </aside>
      </main>

      {/* --- MODALS --- */}

      {isEditingProfile && (
        <div className="up-modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="up-modal-content" onClick={e => e.stopPropagation()}>
            <div className="up-modal-header">
              <h2>Edit Profile</h2>
              <button className="up-modal-close" onClick={() => setIsEditingProfile(false)}>×</button>
            </div>
            <form onSubmit={saveProfile}>
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
                <label>Bio</label>
                <textarea required className="up-form-input" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
              </div>
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
                <label>Image URL (optional)</label>
                <input className="up-form-input" type="text" placeholder="https://unsplash.com/..." value={postForm.image} onChange={e => setPostForm({...postForm, image: e.target.value})} />
              </div>
              <div className="up-form-group">
                <label>Hash Tags (comma separated)</label>
                <input className="up-form-input" type="text" placeholder="Japan, Travel, Food" value={postForm.tags} onChange={e => setPostForm({...postForm, tags: e.target.value})} />
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