import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import './User.css'; // Re-use styling from User

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('packngo_user'));

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const config = currentUser ? { headers: { Authorization: `Bearer ${currentUser.token}` } } : {};
        
        const profileRes = await axios.get(`/api/profile/user/${id}`, config);
        setProfile(profileRes.data);
        
        if (currentUser && profileRes.data.followers) {
          setIsFollowing(profileRes.data.followers.some(f => f === currentUser._id || (f._id && f._id === currentUser._id)));
        }

        if (!profileRes.data.isPrivateRestricted) {
          const postsRes = await axios.get(`/api/posts/user/${id}`, config);
          setPosts(postsRes.data);
        }
      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchProfile();
  }, [id, currentUser?.token]);

  const handleFollow = async () => {
    if (!currentUser) {
      alert("Please log in to follow users.");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      await axios.put(`/api/profile/follow/${id}`, {}, config);
      setIsFollowing(!isFollowing);
      
      // Update follower count visually
      if (profile && profile.followers) {
        setProfile({
          ...profile,
          followers: isFollowing 
            ? profile.followers.filter(f => f !== currentUser._id)
            : [...profile.followers, currentUser._id]
        });
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <Navbar activePage="" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app">
        <Navbar activePage="" />
        <div className="main" style={{ textAlign: 'center', marginTop: '100px', color: '#fff' }}>
          <h2>Profile Not Found</h2>
          <button onClick={() => navigate('/CommunityFeed')} style={{ marginTop: '20px', padding: '10px 20px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Community</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar activePage="" />
      
      <main className="profile-layout" style={{ maxWidth: '1000px', margin: '70px auto 0', display: 'block', paddingInline: '20px' }}>
        <div className="main" style={{ width: '100%' }}>
          {/* Top profile card */}
          <section className="profile-card">
            <div className="profile-header">
              <img
                className="avatar"
                src={profile.avatar?.startsWith('/uploads') ? `${profile.avatar}` : (profile.avatar || 'https://via.placeholder.com/120')}
                alt="avatar"
              />
              <div className="profile-info">
                <h1>{profile.name}</h1>
                <p className="handle">{profile.handle || `@user_${id.substring(0, 5)}`}</p>
                <p className="bio">{profile.bio}</p>
                
                <div className="stats-row">
                  <div className="stat">
                    <div className="stat-number">{profile.followers?.length || 0}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">{profile.following?.length || 0}</div>
                    <div className="stat-label">Following</div>
                  </div>
                  
                  {currentUser && currentUser._id !== id && (
                    <button 
                      onClick={handleFollow}
                      style={{
                        padding: '8px 24px',
                        background: isFollowing ? 'rgba(255,255,255,0.1)' : '#2e7bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
                
                {profile.badges && profile.badges.length > 0 && (
                  <div className="badges-inline" style={{ marginTop: '15px' }}>
                    {profile.badges.slice(0, 5).map((badge, index) => (
                      <span key={index} className="chip">{badge}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {profile.isPrivateRestricted ? (
            <div className="empty-state" style={{ marginTop: '30px', padding: '60px 20px' }}>
              <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
              <h3>This Account is Private</h3>
              <p>Follow this user to see their posts and travel journey.</p>
            </div>
          ) : (
            <div style={{ marginTop: '30px' }}>
              <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '20px', paddingLeft: '10px' }}>Posts by {profile.name}</h2>
              <div className="content-grid">
                {posts.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-icon">📷</div>
                    <h3>No posts yet</h3>
                  </div>
                ) : (
                  posts.map((post) => {
                    const isMediaPost = post.image || post.type === "image" || post.type === "video" || post.mediaType === "video";
                    if (isMediaPost && post.image) {
                      const mediaUrl = post.image?.startsWith('/uploads') ? `${post.image}` : post.image;
                      return (
                        <div key={post._id} className="post-card large">
                          {post.mediaType === 'video' ? (
                            <video className="post-image" src={mediaUrl} controls />
                          ) : (
                            <img className="post-image" src={mediaUrl} alt={post.title} />
                          )}
                          <div className="post-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                              <img src={profile.avatar?.startsWith('/uploads') ? `${profile.avatar}` : (profile.avatar || 'https://via.placeholder.com/40')} alt={profile.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{profile.name}</span>
                            </div>
                            <h3>{post.title}</h3>
                            <p>{post.description}</p>
                            <div className="tags">
                              {post.tags?.map((tag, i) => (
                                <span key={i}>{tag}</span>
                              ))}
                            </div>
                            <div className="post-stats" style={{marginTop: '10px', color: '#888', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px'}}>
                              <span>❤️ {post.likes?.length || 0}</span>
                              <span style={{ marginLeft: '10px' }}>💬 {post.comments?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
