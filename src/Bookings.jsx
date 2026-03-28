import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Bookings.css";
import Navbar from "./Navbar";

const bookingCategories = [
  {
    title: "Solo-Friendly Stays",
    desc: "Find vibrant hostels and safe spaces to meet fellow adventurers.",
    icon: "🛏️",
    img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop",
    links: [
      { name: "Hostelworld", url: "https://www.hostelworld.com" },
      { name: "Couchsurfing", url: "https://www.couchsurfing.com" },
    ]
  },
  {
    title: "Flexible Flights",
    desc: "Compare and book the most flexible and cheapest flights globally.",
    icon: "✈️",
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop",
    links: [
      { name: "Skyscanner", url: "https://www.skyscanner.com" },
      { name: "Google Flights", url: "https://www.google.com/flights" },
    ]
  },
  {
    title: "Overland Travel",
    desc: "Scenic and budget-friendly train and bus journeys across regions.",
    icon: "🚆",
    img: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=2000&auto=format&fit=crop",
    links: [
      { name: "Omio", url: "https://www.omio.com" },
      { name: "Eurail", url: "https://www.eurail.com" },
      { name: "FlixBus", url: "https://www.flixbus.com" }
    ]
  },
  {
    title: "Local Experiences",
    desc: "Book guided tours, meetups, and unique activities with locals.",
    icon: "🗺️",
    img: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2000&auto=format&fit=crop",
    links: [
      { name: "Airbnb Experiences", url: "https://www.airbnb.com/s/experiences" },
      { name: "GetYourGuide", url: "https://www.getyourguide.com" },
    ]
  },
  {
    title: "Social Dining",
    desc: "Don't eat alone! Join local dining experiences and food tours.",
    icon: "🍽️",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop",
    links: [
      { name: "EatWith", url: "https://www.eatwith.com" },
      { name: "Traveling Spoon", url: "https://www.travelingspoon.com" },
    ]
  },
  {
    title: "Digital Nomad Hubs",
    desc: "Discover workspaces and co-living tailored for remote workers.",
    icon: "💻",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop",
    links: [
      { name: "Selina", url: "https://www.selina.com" },
      { name: "Outsite", url: "https://www.outsite.co" },
    ]
  }
];

export default function Bookings() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bk-app">
      <Navbar activePage="Bookings" />

      {/* FULL-BLEED HERO */}
      <section className="bk-hero">
        <div className="bk-hero-bg"></div>
        <div className="bk-hero-gradient"></div>
        <div className="bk-hero-content container">
          <h1>Curated Bookings for the Solo Explorer</h1>
          <p>We've handpicked the best platforms for hostels, flexible transport, social dining, and local experiences so you can journey with confidence.</p>
        </div>
      </section>

      {/* BOOKINGS GRID */}
      <main className="bk-main container">
        <div className="bk-section-header">
          <h2>Our Trusted Partners</h2>
          <p>Select a category below to browse and book through our recommended platforms.</p>
        </div>

        <div className="bk-grid">
          {bookingCategories.map((cat, i) => (
            <article key={i} className="bk-card" style={{animationDelay: `${i * 0.1}s`}}>
              <div className="bk-card-img-wrap">
                <img src={cat.img} alt={cat.title} className="bk-card-img" />
                <div className="bk-card-icon">{cat.icon}</div>
              </div>
              <div className="bk-card-body">
                <h3>{cat.title}</h3>
                <p className="bk-card-desc">{cat.desc}</p>
                <div className="bk-links-wrapper">
                  {cat.links.map((link, j) => (
                    <a 
                      key={j} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bk-partner-btn"
                    >
                      <span>{link.name}</span>
                      <span className="bk-arrow">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bk-footer">
        <div className="container">
          <div className="bk-footer-logo">PackNgo Bookings</div>
          <div className="bk-footer-links">
             <span>© 2026 PackNgo. Mediating your next journey.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
