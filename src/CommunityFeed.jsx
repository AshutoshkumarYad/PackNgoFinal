import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CommunityFeed.css";
import Navbar from "./Navbar";
import CommunityChat from "./CommunityChat";

export default function CommunityFeed() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom states
  const [searchQuery, setSearchQuery] = useState("");
  const [topUsers, setTopUsers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [buddyRequests, setBuddyRequests] = useState([]);

  // Navigation State
  const [activeTab, setActiveTab] = useState("Stories"); // 'Stories', 'Tips', 'Questions', 'Buddy Requests'
  const [openToBuddy, setOpenToBuddy] = useState(false);

  // Post Creation States
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDesc, setNewPostDesc] = useState("");
  
  // Buddy Creation States
  const [newBuddyDest, setNewBuddyDest] = useState("");
  const [newBuddyDate, setNewBuddyDate] = useState("");
  const [newBuddyDesc, setNewBuddyDesc] = useState("");

  // Interaction states
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  
  const getUserToken = () => {
    const userStr = localStorage.getItem("packngo_user");
    return userStr ? JSON.parse(userStr).token : null;
  };
  const getUserId = () => {
    const userStr = localStorage.getItem("packngo_user");
    return userStr ? JSON.parse(userStr)._id : null;
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchFeed = async () => {
      try {
        const token = getUserToken();
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.get("/api/posts/feed", config);
        setPosts(data);
        
        if (token) {
          try {
            const profileRes = await axios.get("/api/profile/me", config);
            if(profileRes.data) {
               if (profileRes.data.user && profileRes.data.user.savedPosts) {
                 setSavedPosts(profileRes.data.user.savedPosts);
               }
               if (profileRes.data.following) {
                 setFollowingList(profileRes.data.following);
               }
               if (profileRes.data.openToBuddy !== undefined) {
                 setOpenToBuddy(profileRes.data.openToBuddy);
               }
            }
          } catch(e) {}
        }

        try {
          if (token) {
            const recomRes = await axios.get("/api/profile/recommendations", config);
            if (recomRes.data && recomRes.data.length > 0) {
              setTopUsers(recomRes.data);
            } else {
              const topRes = await axios.get("/api/profile/top"); // public fallback if empty
              setTopUsers(topRes.data);
            }
          } else {
            const topRes = await axios.get("/api/profile/top");
            setTopUsers(topRes.data);
          }
        } catch (e) {
          console.error("Failed fetching recommendations/top users", e);
        }

        try {
          const buddyRes = await axios.get("/api/buddies", config);
          setBuddyRequests(buddyRes.data);
        } catch (e) {
          console.error("Failed fetching buddy requests");
        }

      } catch (err) {
        console.error("Failed to fetch feed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // --- Interaction Handlers ---
  const handleFollow = async (targetUserId) => {
    const token = getUserToken();
    if (!token) return alert("Please log in to follow");
    try {
       const { data } = await axios.put(`/api/profile/follow/${targetUserId}`, {}, { headers: { Authorization: `Bearer ${token}` }});
       setFollowingList(data.followingList);
       
       setTopUsers(topUsers.map(u => 
         u.user._id === targetUserId 
           ? { ...u, customFollowerCount: data.targetFollowers } 
           : u
       ));
    } catch(err) { console.error(err) }
  };
  const handleLike = async (postId) => {
    const token = getUserToken();
    if (!token) return alert("Please log in to like a post");
    try {
      const { data } = await axios.put(`/api/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data } : p));
    } catch (err) { console.error(err); }
  };

  const handleShare = async (postId) => {
    const token = getUserToken();
    if (!token) return alert("Please log in to share");
    try {
      const { data } = await axios.put(`/api/posts/${postId}/share`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setPosts(posts.map(p => p._id === postId ? { ...p, shares: data.shares } : p));
    } catch (err) { console.error(err); }
  };

  const handleSave = async (postId) => {
    const token = getUserToken();
    if (!token) return alert("Please log in to save a post");
    try {
      const { data } = await axios.put(`/api/posts/${postId}/save`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setSavedPosts(data);
    } catch (err) { console.error(err); }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const token = getUserToken();
    if (!token) return alert("Please log in to comment");
    
    try {
      const { data } = await axios.post(`/api/posts/${postId}/comment`, { text: commentText }, { headers: { Authorization: `Bearer ${token}` }});
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: data } : p));
      setCommentText("");
    } catch (err) { console.error(err); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostDesc.trim()) return;
    
    const token = getUserToken();
    if (!token) return alert("Please log in to create a post");
    
    try {
      // Tags use the activeTab so Tips load in the Tips tab, etc.
      const payload = {
        title: newPostTitle,
        description: newPostDesc,
        tags: activeTab, // backend splits by comma, so this is fine
        visibility: 'public'
      };
      
      const { data } = await axios.post(`/api/posts`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Inject pseudo user info so it immediately looks right locally
      const localUserStr = localStorage.getItem("packngo_user");
      const localUser = localUserStr ? JSON.parse(localUserStr) : null;
      if(localUser) {
          data.user = { _id: localUser._id, name: localUser.name };
      }
      
      setPosts([data, ...posts]);
      setNewPostTitle("");
      setNewPostDesc("");
    } catch (err) { console.error("Failed to create post", err); }
  };

  const handleCreateBuddyRequest = async (e) => {
    e.preventDefault();
    if (!newBuddyDest.trim() || !newBuddyDesc.trim() || !newBuddyDate.trim()) return;
    const token = getUserToken();
    try {
      const { data } = await axios.post("/api/buddies", {
        destination: newBuddyDest,
        date: newBuddyDate,
        description: newBuddyDesc
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBuddyRequests([data, ...buddyRequests]);
      setNewBuddyDest(""); setNewBuddyDate(""); setNewBuddyDesc("");
    } catch(err) { console.error(err); }
  };

  const handleConnectBuddy = async (reqId) => {
    const token = getUserToken();
    try {
      await axios.put(`/api/buddies/${reqId}/connect`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Connected! Feel free to start a chat now.");
    } catch(err) { console.error(err); }
  };

  // Filter posts based on activeTab and Search
  const filteredPosts = posts.filter(post => {
    // 1. Tab Logic
    let matchesTab = false;
    if (activeTab === "Stories") {
       matchesTab = !post.tags || (!post.tags.includes("Tips") && !post.tags.includes("Questions") || post.tags.includes("Stories"));
    } else {
       matchesTab = post.tags && post.tags.includes(activeTab);
    }

    // 2. Search Logic (strict hashtag matching)
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (post.tags && post.tags.length > 0) {
        matchesSearch = post.tags.some(tag => tag.toLowerCase().includes(q));
      } else {
        matchesSearch = false; // No tags = doesn't match wildcard tag search
      }
    }

    return matchesTab && matchesSearch;
  });

  // --- Derived State for Sidebars ---
  const allTags = posts.flatMap(p => p.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    // Exclude basic tab tags from trending
    if (tag && typeof tag === 'string' && !["Stories", "Tips", "Questions"].includes(tag)) {
      const formatted = tag.trim();
      if(formatted) acc[formatted] = (acc[formatted] || 0) + 1;
    }
    return acc;
  }, {});
  const trendingTopics = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 5);
    
  const suggestedStories = [...posts]
    .filter(p => p.title || p.description) // Ensure there's content to preview
    .sort((a,b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 3);

  return (
    <div className="cf-app">
      {/* Global Navbar Header */}
      <Navbar activePage="Community" />

      {/* Top Sub-Navigation (Mobile/Tablet only) */}
      <div className="cf-subnav-container">
        <nav className="cf-subnav">
          {["Stories", "Tips", "Questions", ...(openToBuddy ? ["Buddy Requests"] : [])].map(tab => (
            <button 
              key={tab}
              className={`cf-nav-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="cf-search-area">
          <div className="cf-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main layout (3-column on Desktop) */}
      <main className="cf-layout">
        
        {/* LEFT COLUMN: Navigation */}
        <aside className="cf-left-nav">
          {[
            { label: 'Stories', icon: '📚' },
            { label: 'Tips', icon: '💡' },
            { label: 'Questions', icon: '❓' },
            ...(openToBuddy ? [{ label: 'Buddy Requests', icon: '🤝' }] : [])
          ].map(tab => (
            <div 
              key={tab.label}
              className={`cf-left-nav-item ${activeTab === tab.label ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </aside>

        {/* MIDDLE COLUMN: FEED */}
        <section className="cf-feed">
          
          {/* CREATE POST INPUT (Hidden on Stories tab) */}
          {activeTab === 'Buddy Requests' ? (
            <div className="cf-post cf-create-post" style={{ borderLeft: '4px solid #ec4899' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>Find a Travel Buddy 🤝</h3>
              <form onSubmit={handleCreateBuddyRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                   type="text"
                   placeholder="Destination (e.g. Paris, Tokyo)"
                   value={newBuddyDest}
                   onChange={(e) => setNewBuddyDest(e.target.value)}
                   style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '15px' }}
                />
                <input 
                   type="text"
                   placeholder="When? (e.g. Oct 12th - 20th)"
                   value={newBuddyDate}
                   onChange={(e) => setNewBuddyDate(e.target.value)}
                   style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '15px' }}
                />
                <textarea 
                   placeholder="What are your plans? Looking for someone to hike with?"
                   value={newBuddyDesc}
                   onChange={(e) => setNewBuddyDesc(e.target.value)}
                   rows={3}
                   style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', resize: 'none' }}
                />
                <button type="submit" style={{ alignSelf: 'flex-end', background: '#ec4899', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Post Request
                </button>
              </form>
            </div>
          ) : activeTab !== 'Stories' ? (
            <div className="cf-post cf-create-post">
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                {activeTab === 'Tips' ? 'Share a Tip 💡' : 'Ask a Question ❓'}
              </h3>
              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                   type="text"
                   placeholder="Title"
                   value={newPostTitle}
                   onChange={(e) => setNewPostTitle(e.target.value)}
                   style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '15px' }}
                />
                <textarea 
                   placeholder="Description / Context..."
                   value={newPostDesc}
                   onChange={(e) => setNewPostDesc(e.target.value)}
                   rows={3}
                   style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', resize: 'none' }}
                />
                <button type="submit" style={{ alignSelf: 'flex-end', background: '#2e7bff', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Post {activeTab.slice(0, -1)}
                </button>
              </form>
            </div>
          ) : null}

          {isLoading ? (
             <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : activeTab === 'Buddy Requests' ? (
             !openToBuddy ? (
               <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                 <h3>Discover Travel Buddies</h3>
                 <p style={{ color: '#a0a0b8', marginTop: '10px', fontSize: '14px' }}>You have disabled Buddy Requests in your profile. Head to your profile page and toggle "Looking for Travel Buddy" to unlock this feature and match with others!</p>
               </div>
             ) : buddyRequests.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px' }}>No buddy requests found. Be the first!</div>
             ) : buddyRequests.map(req => (
               <div key={req._id} className="cf-post">
                 <div className="cf-post-header">
                   <img className="cf-avatar" src={req.user?.avatar || "https://i.pravatar.cc/100?img=1"} alt="Avatar" />
                   <div className="cf-user-info">
                     <span className="cf-user-name">{req.user?.name || "Anonymous Traveler"}</span>
                     <span className="cf-post-time">is traveling to {req.destination}!</span>
                   </div>
                 </div>
                 <div className="cf-post-body" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', borderLeft: '3px solid #ec4899', marginTop: '10px' }}>
                    <p style={{ marginBottom: '8px', color: '#e2e8f0' }}><strong>📍 Destination:</strong> {req.destination}</p>
                    <p style={{ marginBottom: '15px', color: '#e2e8f0' }}><strong>📅 When:</strong> {req.date}</p>
                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#cbd5e1' }}>{req.description}</p>
                 </div>
                 <div style={{ marginTop: '15px', textAlign: 'right' }}>
                   <button 
                      onClick={() => handleConnectBuddy(req._id)} 
                      style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                   >
                     Connect 👋
                   </button>
                 </div>
               </div>
             ))
          ) : filteredPosts.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '40px' }}>No posts found for this category. Be the first!</div>
          ) : filteredPosts.map(post => {
            const isMedia = post.image || post.type === "image" || post.type === "video" || post.mediaType === "video";
            const mediaUrl = post.image?.startsWith('/uploads') ? `${post.image}` : post.image;
            return (
          <article key={post._id} id={`post-${post._id}`} className="cf-post">
            <header className="cf-post-header">
              <div className="cf-post-user">
                <div className="cf-avatar">{post.user?.name ? post.user.name.charAt(0).toUpperCase() : "U"}</div>
                <div>
                  <div className="cf-user-name">{post.user?.name || "Unknown User"}</div>
                  <div className="cf-user-meta">{isMedia ? 'Creator' : 'Story Highlights'}</div>
                </div>
              </div>
              {post.tags && post.tags[0] && <span className="cf-tag-pill">{post.tags[0]}</span>}
            </header>

            {isMedia && post.image && (
              <div className="cf-post-image-wrap">
                {post.mediaType === 'video' ? (
                  <video src={mediaUrl} controls style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: '#000', borderRadius: '12px' }} />
                ) : (
                  <img src={mediaUrl} alt={post.title} />
                )}
              </div>
            )}

            <p className={`cf-post-text ${!isMedia ? 'spaced' : ''}`}>
               {!isMedia && <strong>{post.title}</strong>}{!isMedia && <br/>}
              {post.description}
            </p>

            <footer className="cf-post-footer">
              <div 
                className="cf-post-action" 
                onClick={() => handleLike(post._id)}
                style={{ color: post.likes?.includes(getUserId()) ? '#ef4444' : 'inherit' }}
              >
                {post.likes?.includes(getUserId()) ? '❤️' : '♡'} {post.likes?.length || 0}
              </div>
              <div className="cf-post-action" onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}>
                💬 {post.comments?.length || 0}
              </div>
              <div className="cf-post-action" onClick={() => handleShare(post._id)}>
                ↻ {post.shares || 0}
              </div>
              <div 
                className="cf-post-action" 
                onClick={() => handleSave(post._id)}
                style={{ marginLeft: 'auto', color: savedPosts.includes(post._id) ? '#3b82f6' : 'inherit' }}
              >
                {savedPosts.includes(post._id) ? 'Ⓜ️ Saved' : '🔖 Save'}
              </div>
            </footer>

            {/* Comments Section Dropdown */}
            {activeCommentId === post._id && (
              <div className="cf-comments-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                <form onSubmit={(e) => handleCommentSubmit(e, post._id)} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder={activeTab === 'Questions' ? "Write an answer..." : "Write a reply..."} 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px' }}
                  />
                  <button type="submit" style={{ background: '#2e7bff', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Post</button>
                </form>
                
                <div className="cf-comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {post.comments?.map((comment, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                      <div className="cf-avatar tiny" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                         {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
                        <strong style={{ display: 'block', color: '#fff', marginBottom: '4px', fontSize: '12px' }}>{comment.user?.name || "User"}</strong>
                        <span style={{ color: '#a0a0b8' }}>{comment.text}</span>
                      </div>
                    </div>
                  ))}
                  {(!post.comments || post.comments.length === 0) && (
                    <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '10px 0' }}>No comments yet.</div>
                  )}
                </div>
              </div>
            )}
          </article>
          )})}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="cf-sidebar">
          <section className="cf-side-card">
            <h3>Suggested For You ✨</h3>
            {topUsers.length === 0 ? (
               <div style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '10px' }}>Loading travelers...</div>
            ) : topUsers.map((profile, i) => {
              const isFollowing = followingList.includes(profile.user._id);
              const nameInitial = profile.user.name ? profile.user.name.charAt(0).toUpperCase() : "U";
              const count = profile.customFollowerCount !== undefined ? profile.customFollowerCount : (profile.followers ? profile.followers.length : 0);
              const gradients = [
                "linear-gradient(135deg, #a855f7, #ec4899)",
                "linear-gradient(135deg, #2e7bff, #56b1ff)",
                "linear-gradient(135deg, #10b981, #34d399)",
                "linear-gradient(135deg, #f59e0b, #fbbf24)"
              ];
              
              return (
                <div key={profile._id} className="cf-side-user">
                  <div className="cf-avatar tiny" style={{ background: gradients[i % gradients.length] }}>
                    {nameInitial}
                  </div>
                  <div className="cf-side-user-info">
                    <div className="name">{profile.user.name}</div>
                    <div className="meta">{count.toLocaleString()} followers</div>
                  </div>
                  <button 
                    className="cf-follow-btn" 
                    onClick={() => handleFollow(profile.user._id)}
                    style={{
                      background: isFollowing ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isFollowing ? '#fff' : 'inherit',
                      borderColor: isFollowing ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </section>

          <section className="cf-side-card">
            <h3>Trending Topics</h3>
            <ul className="cf-list">
              {trendingTopics.length > 0 ? trendingTopics.map(topic => (
                <li 
                   key={topic} 
                   onClick={() => { 
                      setActiveTab("Stories"); 
                      setSearchQuery(topic); 
                      window.scrollTo({ top: 300, behavior: 'smooth' }); 
                   }} 
                   style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                >
                   <span>#{topic}</span>
                   <span style={{ color: '#888', fontSize: '12px' }}>{tagCounts[topic]} posts</span>
                </li>
              )) : (
                <li style={{ color: '#888' }}>No trending topics yet</li>
              )}
            </ul>
          </section>

          <section className="cf-side-card">
            <h3>Suggested Stories</h3>
            <ul className="cf-stories">
              {suggestedStories.length > 0 ? suggestedStories.map(story => (
                <li 
                   key={story._id} 
                   onClick={() => {
                      setActiveTab("Stories");
                      setSearchQuery(""); // Clear search to ensure it's visible in feed
                      setTimeout(() => document.getElementById(`post-${story._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                   }} 
                   style={{ cursor: 'pointer' }}
                >
                  <div className="title" style={{ transition: 'color 0.2s', ':hover': { color: '#ec4899' }}}>
                    {story.title || (story.description ? story.description.substring(0, 40) + '...' : 'Media Post')}
                  </div>
                  <div className="meta">
                    {story.user?.name || 'Traveler'} · {story.tags?.[0] || 'Story'} · {story.likes?.length || 0} ❤️
                  </div>
                </li>
              )) : (
                <li style={{ color: '#888' }}>No stories available</li>
              )}
            </ul>
          </section>

          {/* PRIVATE CHAT MODULE */}
          <section className="cf-side-chat-module">
             <CommunityChat token={getUserToken()} currentUserId={getUserId()} />
          </section>

        </aside>
      </main>

      <footer className="cf-footer">
        <span>Powered by</span>
        <span className="cf-logo-dot" /> PackNgo Community
      </footer>
    </div>
  );
}