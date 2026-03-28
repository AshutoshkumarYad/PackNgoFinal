import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ activePage }) {
  const navigate = useNavigate();

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
      </nav>

      <div className="pg-nav-icons">
        <img 
          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662&auto=format&fit=crop" 
          alt="Profile Navigation" 
          className="pg-icon-circle" 
          onClick={() => navigate("/User")} 
        />
      </div>
    </header>
  );
}
