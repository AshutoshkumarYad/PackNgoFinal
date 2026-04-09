import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { globalDestinations } from "./data/destinationsData";
import "./Homepage.css";
import Navbar from "./Navbar";

const travelerStories = [
  { name: "Elena Rodriguez", role: "Solo Photographer", icon: "📸" },
  { name: "Marcus Chen", role: "Mountain Explorer", icon: "🏔️" },
  { name: "Sophia Kim", role: "Digital Nomad", icon: "💻" }
];

const Homepage = () => {
  const navigate = useNavigate();

  const [popularDestinations, setPopularDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const getRecommendations = async () => {
      try {
        const userStr = localStorage.getItem("packngo_user");
        const token = userStr ? JSON.parse(userStr).token : null;
        let userBadges = [];
        
        if (token) {
           const res = await fetch("/api/profile/me", {
              headers: { "Authorization": `Bearer ${token}` }
           });
           if (res.ok) {
              const profile = await res.json();
              userBadges = profile.badges || [];
           }
        }

        // Native Scoring Matrix
        // Analyzes precise travel habits via earned badges, matching them against local destination tags
        const scored = globalDestinations.map(dest => {
           let score = Math.random() * 2; // Baseline variance to ensure the list isn't completely static
           
           const badgeStr = userBadges.join(" ").toLowerCase();
           if (dest.tag === "Nature" && (badgeStr.includes("nature") || badgeStr.includes("mountain") || badgeStr.includes("explorer"))) score += 15;
           if (dest.tag === "Beach" && (badgeStr.includes("beach") || badgeStr.includes("island") || badgeStr.includes("ocean"))) score += 15;
           if (dest.tag === "Cultural" && (badgeStr.includes("cultural") || badgeStr.includes("history") || badgeStr.includes("connoisseur"))) score += 15;
           if (dest.tag === "City Escape" && (badgeStr.includes("urban") || badgeStr.includes("city"))) score += 15;
           if (dest.tag === "Adventure" && (badgeStr.includes("adventure") || badgeStr.includes("nomad") || badgeStr.includes("wolf"))) score += 15;
           
           if (dest.rating >= 4.9) score += 2;
           if (dest.reviews > 3000) score += 1;
           return { ...dest, score };
        });

        // Sort by highest score first
        scored.sort((a, b) => b.score - a.score);
        
        // Take the top 6 organically generated locations
        setPopularDestinations(scored.slice(0, 6));
      } catch (err) {
        console.error("Native Rec Engine Error:", err);
        // Instant Fallback
        const shuffled = [...globalDestinations].sort(() => 0.5 - Math.random());
        setPopularDestinations(shuffled.slice(0, 6));
      } finally {
        setIsLoading(false);
      }
    };
    
    getRecommendations();
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
            
            {isLoading ? (
               <div style={{ color: "white", padding: "40px", textAlign: "center" }}>Loading trending destinations via AI...</div>
            ) : (
            <div className="pg-card-grid pg-card-grid-3">
              {popularDestinations.map((dest, i) => (
                <article className="pg-dest-card" key={i}>
                  <div className="pg-dest-img-wrap">
                    <img src={dest.img} alt={dest.city} className="pg-dest-img" />
                    <div className="pg-dest-badge">⭐ {dest.rating}</div>
                  </div>
                  <div className="pg-dest-body">
                    <h3>{dest.city}</h3>
                    <div className="pg-dest-meta">
                      <span>🧭 {dest.days}</span>
                      <span>🛡️ Verified Safe</span>
                    </div>
                    <button className="pg-action-link" onClick={() => navigate(`/Destinationdetail?name=${encodeURIComponent(dest.city)}`)}>View Details</button>
                  </div>
                </article>
              ))}
            </div>
            )}
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