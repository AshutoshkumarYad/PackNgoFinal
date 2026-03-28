import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";  
import "./Landing.css";  

/*
  Landing.jsx — PackNgo landing page
*/

export default function Landing() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/Show?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/Show');
    }
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      title: "Interest-Based\nMatching",
      desc: "Find travel partners who share your passion and travel style.",
      icon: "★",
    },
    {
      title: "Verified Solo Traveler Safety",
      desc: "Rigorous verification to build a safe community.",
      icon: "✔",
    },
    {
      title: "AI Chatbot Travel Assistant",
      desc: "Get travel guidance, local insights, and itineraries.",
      icon: "🤖",
    },
    {
      title: "Curated Destination Ideas",
      desc: "Destination ideas and trip inspiration for solo travelers.",
      icon: "🗺",
    },
  ];

  const destinations = [
    { name: "Santorini, Greece", likes: "9.3k Likes", img: "src/assets/santorini.jpg" },
    { name: "Ha Long Bay, Vietnam", likes: "8.7k Likes", img: "src/assets/halong.jpg" },
    { name: "Bagan, Myanmar", likes: "6.2k Likes", img: "src/assets/bagan.jpg" },
    { name: "Cappadocia, Turkey", likes: "10.3k Likes", img: "src/assets/cappadocia.jpg" },
    { name: "Kyoto, Japan", likes: "7.8k Likes", img: "src/assets/kyoto.jpg" },
    { name: "Patagonia, Chile", likes: "5.9k Likes", img: "src/assets/patagonia.jpg" },
    { name: "Rome, Italy", likes: "12.1k Likes", img: "src/assets/rome.jpg" },
    { name: "Queenstown, New Zealand", likes: "4.4k Likes", img: "src/assets/queenstown.jpg" },
  ];

  const travelers = [
    { initials: "ER", name: "Elena Rodriguez", tag: "Photography" },
    { initials: "MC", name: "Marcus Chen", tag: "Hiking" },
    { initials: "SK", name: "Sophia Kim", tag: "Culinary Tours" },
    { initials: "DL", name: "David Lee", tag: "Adventure Sports" },
    { initials: "CD", name: "Chloe Dubois", tag: "Art & Culture" },
    { initials: "OS", name: "Omar Sharif", tag: "History" },
  ];

  const Img = ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="dest-img"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/traveler.jpg";
      }}
    />
  );

  return (
    <div className="app">
      <header className="nav">
        <div className="nav-inner">
          <div className="nav-left">
            <img src="/logo.png" alt="PackNgo" className="logo" />
          </div>
          <div className="nav-center">
            <a href="#destinations" onClick={(e) => scrollToSection(e, 'destinations')}>Destinations</a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
            <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')}>Testimonials</a>
          </div>
          <div className="nav-right">
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search destinations..." 
                className="search" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
            <button className="btn primary" onClick={() => navigate('/Login')}>Log In</button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-content container">
            <h1>Find Your Solo Adventure Partner</h1>
            <p className="sub">
              Connect with like-minded solo travelers and explore the world together safely.
            </p>
            <div className="hero-ctas">
              <button className="btn primary" onClick={() => navigate('/Login')}>Find Your Solo Match</button>
              <button className="btn ghost" onClick={(e) => scrollToSection(e, 'features')}>Explore Features</button>
            </div>
          </div>
        </section>

        <section id="features" className="container section features">
          <div className="section-header-cnt">
            <h2 className="section-title">How PackNgo Works</h2>
            <p className="section-subtitle">Everything you need for an unforgettable solo journey.</p>
          </div>
          <div className="grid features-grid">
            {features.map((f, i) => (
              <div key={i} className="card feature-card">
                <div className="icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="destinations" className="container section">
          <div className="section-header-cnt">
            <h2 className="section-title">Featured Destinations</h2>
            <p className="section-subtitle">Discover where our community is exploring right now.</p>
          </div>
          <div className="grid dest-grid">
            {destinations.map((d, i) => (
              <article key={i} className="dest-card">
                <Img src={d.img} alt={d.name} />
                <div className="dest-info">
                  <div className="dest-name">{d.name}</div>
                  <div className="dest-meta">{d.likes}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="container section">
          <div className="section-header-cnt">
            <h2 className="section-title">Traveler Spotlights</h2>
            <p className="section-subtitle">Hear from our vibrant community of solo explorers.</p>
          </div>
          <div className="grid traveler-grid">
            {travelers.map((t, i) => (
              <div key={i} className="card traveler-card">
                <div className="avatar">{t.initials}</div>
                <div className="traveler-name">{t.name}</div>
                <div className="traveler-tag">{t.tag}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
  <div className="container footer-content">

    <div className="footer-col">
      <h3>About PackNgo</h3>
      <p>
        PackNgo connects solo travelers with like-minded companions. 
        Discover destinations, share experiences, and travel smarter 
        with AI-powered guidance.
      </p>
    </div>

    <div className="footer-col">
      <h4>Quick Links</h4>
      <ul>
        <li>Home</li>
        <li>Destinations</li>
        <li>Community</li>
        <li>AI Assistant</li>
      </ul>
    </div>

    <div className="footer-col">
      <h4>Contact</h4>
      <p>Email: support@packngo.com</p>
      <p>Location: Global Community</p>
    </div>

  </div>

  <div className="footer-bottom">
    © 2026 PackNgo. All rights reserved.
  </div>
</footer>

    </div>
  );
}
