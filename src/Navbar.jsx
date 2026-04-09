import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

export default function Navbar({ activePage }) {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662&auto=format&fit=crop");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const userStr = localStorage.getItem("packngo_user");
        if (userStr) {
          const { token } = JSON.parse(userStr);
          if (token) {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get("/api/profile/me", config);
            if (data && data.avatar) {
               const imgUrl = data.avatar.startsWith('/uploads') ? `${data.avatar}` : data.avatar;
               setAvatar(imgUrl);
            }
          }
        }
      } catch (err) {
         console.error("Could not load Navbar avatar");
      }
    };
    fetchAvatar();
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="pg-nav">
      <a href="/" className="pg-logo" onClick={(e) => { e.preventDefault(); navigate("/Homepage"); }}>
        <img src="/logo.png" alt="PackNgo" />
      </a>
      
      <nav className="pg-nav-links">
        <a 
          href="/Homepage" 
          className={activePage === "Home" ? "active" : ""}
          onClick={(e) => { e.preventDefault(); navigate("/Homepage"); }}
        >
          Home
        </a>
        <a 
          href="/Show" 
          className={activePage === "Explore" ? "active" : ""}
          onClick={(e) => { e.preventDefault(); navigate("/Show"); }}
        >
          Explore
        </a>
        <a 
          href="/Tripplanner" 
          className={activePage === "Plan Trip" ? "active" : ""}
          onClick={(e) => { e.preventDefault(); navigate("/Tripplanner"); }}
        >
          Plan Trip
        </a>
        <a 
          href="/Bookings" 
          className={activePage === "Bookings" ? "active" : ""}
          onClick={(e) => { e.preventDefault(); navigate("/Bookings"); }}
        >
          Bookings
        </a>
        <a 
          href="/CommunityFeed" 
          className={activePage === "Community" ? "active" : ""}
          onClick={(e) => { e.preventDefault(); navigate("/CommunityFeed"); }}
        >
          Community
        </a>
        <a 
          href="/Navigate" 
          className={activePage === "Navigate" ? "active" : ""}
          onClick={(e) => { e.preventDefault(); navigate("/Navigate"); }}
        >
          Navigate
        </a>
      </nav>

      <div className="pg-nav-icons">
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            style={{ marginRight: '16px', padding: '6px 12px', background: 'var(--primary, #00C6FF)', border: 'none', borderRadius: '20px', color: '#111', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Install App
          </button>
        )}
        <img 
          src={avatar} 
          alt="Profile Navigation" 
          className="pg-icon-circle" 
          onClick={() => navigate("/User")} 
        />
      </div>
    </header>
  );
}
