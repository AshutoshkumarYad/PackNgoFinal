import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import Navbar from "./Navbar";

import kyoto from "./assets/kyoto.jpg";
import pantagonia from "./assets/pantagonia.jpg";
import marrekesh from "./assets/marrekesh.jpg";
import paris from "./assets/paris.webp";
import aurora from "./assets/aurora.jpg";
import bora from "./assets/bora.jpg";
import traveler from "./assets/traveler.jpg";

const popularDestinations = [
  { title: "Ancient Temples of Kyoto", image: kyoto, days: "5-10 days", rating: "4.9" },
  { title: "Patagonian Wilderness", image: pantagonia, days: "7-14 days", rating: "4.8" },
  { title: "Marrakech Souks", image: marrekesh, days: "4-7 days", rating: "4.7" },
  { title: "Romantic Paris", image: paris, days: "3-6 days", rating: "4.8" },
  { title: "Aurora Icelandic Nights", image: aurora, days: "4-6 days", rating: "4.9" },
  { title: "Tropical Bora Bora", image: bora, days: "5-8 days", rating: "4.9" }
];

const travelerStories = [
  { name: "Elena Rodriguez", role: "Solo Photographer", icon: "📸" },
  { name: "Marcus Chen", role: "Mountain Explorer", icon: "🏔️" },
  { name: "Sophia Kim", role: "Digital Nomad", icon: "💻" }
];

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pg-page">
      {/* --- UNIFIED NAVBAR --- */}
      <Navbar activePage="Home" />

      <main>
        {/* --- CINEMATIC HERO --- */}
        <section className="pg-hero" id="home">
          <div className="pg-hero-bg"></div>
          <div className="pg-hero-gradient"></div>
          
          <div className="pg-hero-content pg-container">
            <div className="pg-hero-text-block">
              <h1>Your Next Unforgettable Journey Begins Here.</h1>
              <p>Discover hand-picked global destinations, leverage AI to plan your perfect itinerary, and connect with a community of independent explorers.</p>
              
              <div className="pg-hero-buttons">
                <button
                  className="pg-primary-btn"
                  onClick={() => navigate("/Tripplanner")}
                >
                  Plan My Trip ➔
                </button>
                <button
                  className="pg-secondary-btn"
                  onClick={() => navigate("/CommunityFeed")}
                >
                  Explore Community
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- POPULAR DESTINATIONS --- */}
        <section className="pg-section" id="explore">
          <div className="pg-container">
            <div className="pg-section-header">
              <h2>Popular Destinations</h2>
              <button className="pg-text-link" onClick={() => navigate("/Show")}>See All Destinations →</button>
            </div>
            
            <div className="pg-card-grid pg-card-grid-3">
              {popularDestinations.map((dest, i) => (
                <article className="pg-dest-card" key={i}>
                  <div className="pg-dest-img-wrap">
                    <img src={dest.image} alt={dest.title} className="pg-dest-img" />
                    <div className="pg-dest-badge">⭐ {dest.rating}</div>
                  </div>
                  <div className="pg-dest-body">
                    <h3>{dest.title}</h3>
                    <div className="pg-dest-meta">
                      <span>🧭 {dest.days}</span>
                      <span>🛡️ Verified Safe</span>
                    </div>
                    <button className="pg-action-link" onClick={() => navigate("/Destinationdetail")}>View Details</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --- TRAVELER STORIES --- */}
        <section className="pg-section pg-dark-section" id="stories">
          <div className="pg-container">
            <div className="pg-section-header">
               <h2>Traveler Spotlights</h2>
            </div>
            
            <div className="pg-profile-grid">
              {travelerStories.map((traveler, i) => (
                <div className="pg-story-card" key={i}>
                  <div className="pg-story-avatar">
                    {traveler.icon}
                  </div>
                  <div className="pg-story-info">
                    <h3>{traveler.name}</h3>
                    <p>{traveler.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="pg-section">
          <div className="pg-container">
             <div className="pg-cta-box">
               <div className="pg-cta-content">
                 <h2>Ready for your next solo adventure?</h2>
                 <p>Join thousands of confident solo travelers crafting perfect itineraries with our AI agent and community guides.</p>
                 <button className="pg-primary-btn" onClick={() => navigate("/Tripplanner")}>Start Planning For Free</button>
               </div>
             </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="pg-footer">
        <div className="pg-container">
          <div className="pg-footer-content">
             <div className="pg-footer-brand">PackNgo Hub</div>
             <p>© 2026 PackNgo. Unlocking the world for independent travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;