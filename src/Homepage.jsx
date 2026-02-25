import React from "react";
import "./Homepage.css";

const popularDestinations = [
  { title: "Ancient Temples of Kyoto", image: "kyoto.webp" },
  { title: "Patagonian Wilderness", image: "pantagonia.jpg" },
  { title: "Marrakech Souks", image: "marrekesh.jpg" },
  { title: "Romantic Paris", image: "paris.webp" },
  { title: "Aurora Icelandic Nights", image: "aurora.jpg" },
  { title: "Tropical Bora Bora", image: "bora.jpg" }
];

const Homepage = () => {
  return (
    <div className="pg-page">
      {/* Navbar */}
      <header className="pg-nav">
        <div className="pg-logo">PackNgo</div>

        <nav className="pg-nav-links">
          <a href="#home">Home</a>
          <a href="#explore">Explore</a>
          <a href="">Plan Trip</a>
          <a href="#stories">Stories</a>
        </nav>

        <div className="pg-nav-icons">
          <span className="pg-icon-circle" />
        </div>
      </header>

      {/* Hero */}
<section className="pg-hero" id="home">
  <div className="pg-hero-overlay" />
  <div className="pg-hero-content">
    <h1>Your Next Unforgettable Journey Begins Here</h1>

    <div className="pg-hero-buttons">
      <button
        className="pg-primary-btn"
        onClick={() => window.location.href = "http://localhost:5178/"}
      >
        Plan My Trip
      </button>

      <button
        className="pg-secondary-btn"
        onClick={() => window.location.href = "http://localhost:5175/"}
      >
        Community
      </button>
    </div>
  </div>
</section>

      {/* Popular Destinations */}
      <section className="pg-section" id="explore">
        <h2>Popular Destinations</h2>
        <div className="pg-card-grid pg-card-grid-3">
          {popularDestinations.map((dest, i) => (
            <div className="pg-card-destination" key={i}>
              <div className="pg-card-image">
                <img src={dest.image} alt={dest.title} />
              </div>
              <div className="pg-card-body">
                <h3>{dest.title}</h3>
                <div className="pg-card-meta">
                  <span>4-6 days</span>
                  <span>Safety 4.8</span>
                </div>
                <button className="pg-link">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Traveler Stories */}
      <section className="pg-section" id="stories">
        <h2>Traveler Stories</h2>
        <div className="pg-profile-row">
          {[
            { name: "Alex Johnson", role: "Backpacker & Hiker" },
            { name: "Bob Williams", role: "Adventure Seeker" },
            { name: "Carol Davis", role: "Digital Nomad" }
          ].map((p, i) => (
            <div className="pg-profile-card" key={i}>
              <div className="pg-avatar" />
              <div>
                <h3>{p.name}</h3>
                <p>{p.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pg-section pg-cta">
        <h2>Ready for your next solo adventure?</h2>
        <button className="pg-primary-btn">Start Planning Now</button>
      </section>

      {/* Footer */}
      <footer className="pg-footer">
        <div className="pg-logo">PackNgo</div>
        <p>© 2025 PackNgo</p>
      </footer>
    </div>
  );
};

export default Homepage;
