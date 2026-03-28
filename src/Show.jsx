import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Show.css";
import Navbar from "./Navbar";

function Show() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State for destinations data
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [tailoredDestinations, setTailoredDestinations] = useState([]);
  const [discoverMore, setDiscoverMore] = useState([]);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedBudget, setSelectedBudget] = useState("All Budgets");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedTripType, setSelectedTripType] = useState("All Types");
  
  // State for dropdown visibility
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State for carousel index
  const [tailoredIndex, setTailoredIndex] = useState(0);

  // Filter options
  const budgetOptions = ["All Budgets", "Budget Friendly", "Mid Range", "Luxury"];
  const regionOptions = ["All Regions", "Europe", "Asia", "Americas", "Africa", "Oceania"];
  const tripTypeOptions = ["All Types", "City Escape", "Adventure", "Cultural", "Beach", "Nature"];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const popular = [
        {
          id: 1, city: "Paris, France", tag: "City Escape", reviews: 2154,
          rating: 4.8, days: "4–7 Days", budget: "Mid Range", region: "Europe",
          img: "/src/assets/Paris.jpg"
        },
        {
          id: 2, city: "Kyoto, Japan", tag: "Cultural", reviews: 890,
          rating: 4.9, days: "5–10 Days", budget: "Mid Range", region: "Asia",
          img: "/src/assets/kyoto.jpg"
        },
        {
          id: 3, city: "Machu Picchu, Peru", tag: "Adventure", reviews: 1380,
          rating: 4.9, days: "3–5 Days", budget: "Budget Friendly", region: "Americas",
          img: "/src/assets/peru.webp"
        },
        {
           id: 4, city: "Reykjavik, Iceland", tag: "Nature", reviews: 654,
           rating: 4.7, days: "4–6 Days", budget: "Luxury", region: "Europe",
           img: "/src/assets/Reykjavik.jpg"
        },
        {
           id: 5, city: "Cape Town, South Africa", tag: "Beach", reviews: 935,
           rating: 4.8, days: "5–8 Days", budget: "Mid Range", region: "Africa",
           img: "/src/assets/capetown.jpg"
        },
        {
           id: 6, city: "Rome, Italy", tag: "Cultural", reviews: 1840,
           rating: 4.8, days: "4–7 Days", budget: "Mid Range", region: "Europe",
           img: "/src/assets/rome.jpg"
        }
      ];

      const tailored = [
        { id: 101, city: "Bali, Indonesia", tag: "Super Friendly", img: "/src/assets/bali.jpg" },
        { id: 102, city: "Queenstown, NZ", tag: "Very Safe", img: "/src/assets/queenstown.jpg" },
        { id: 103, city: "Amalfi Coast, Italy", tag: "Luxury", img: "/src/assets/amalfi.webp" },
        { id: 104, city: "Santorini, Greece", tag: "Romantic", img: "/src/assets/Paris.jpg" },
      ];

      const discover = [
        { id: 201, city: "Lisbon, Portugal", tag: "Backpacker Favorite", img: "/src/assets/lisbon.avif" },
        { id: 202, city: "Vancouver, Canada", tag: "Mountain Vibes", img: "/src/assets/vancouver.webp" },
        { id: 203, city: "Bangkok, Thailand", tag: "Foodie Paradise", img: "/src/assets/bankok.webp" },
        { id: 204, city: "Sydney, Australia", tag: "Beach Life", img: "/src/assets/sydney.webp" },
      ];

      setPopularDestinations(popular);
      setTailoredDestinations(tailored);
      setDiscoverMore(discover);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const getFilteredDestinations = (destinations) => {
    return destinations.filter(dest => {
      const matchQ = dest.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchB = selectedBudget === "All Budgets" || dest.budget === selectedBudget;
      const matchR = selectedRegion === "All Regions" || dest.region === selectedRegion;
      const matchT = selectedTripType === "All Types" || dest.tag === selectedTripType;
      return matchQ && matchB && matchR && matchT;
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBudget("All Budgets");
    setSelectedRegion("All Regions");
    setSelectedTripType("All Types");
  };

  const filteredPopular = getFilteredDestinations(popularDestinations);

  if (isLoading) {
    return (
      <div className="exp-app">
        <div className="exp-loading"><div className="exp-spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="exp-app">
      {/* GLOBAL NAVBAR */}
      <Navbar activePage="Explore" />

      {/* FULL-BLEED HERO */}
      <section className="exp-hero">
        <div className="exp-hero-bg"></div>
        <div className="exp-hero-gradient"></div>
        
        <div className="exp-hero-content">
          <h1>Where will your next solo adventure take you?</h1>
          <p>
            Explore hand-picked destinations perfect for independent travelers. 
            From vibrant cities to serene natural escapes, find your true north.
          </p>
          
          <div className="exp-search-bar">
            <span className="exp-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search cities, countries, or regions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="exp-filter-bar-wrapper">
            <div className="exp-filter-bar">
              <div className="exp-filter-group">
                <div className="exp-dropdown">
                  <button onClick={() => {setShowBudgetDropdown(!showBudgetDropdown); setShowRegionDropdown(false); setShowTripTypeDropdown(false);}}>
                    {selectedBudget} <span className="caret">▾</span>
                  </button>
                  {showBudgetDropdown && (
                    <div className="exp-dropdown-menu">
                      {budgetOptions.map(opt => <div key={opt} onClick={() => {setSelectedBudget(opt); setShowBudgetDropdown(false)}}>{opt}</div>)}
                    </div>
                  )}
                </div>

                <div className="exp-dropdown">
                  <button onClick={() => {setShowRegionDropdown(!showRegionDropdown); setShowBudgetDropdown(false); setShowTripTypeDropdown(false);}}>
                    {selectedRegion} <span className="caret">▾</span>
                  </button>
                  {showRegionDropdown && (
                    <div className="exp-dropdown-menu">
                      {regionOptions.map(opt => <div key={opt} onClick={() => {setSelectedRegion(opt); setShowRegionDropdown(false)}}>{opt}</div>)}
                    </div>
                  )}
                </div>

                <div className="exp-dropdown">
                  <button onClick={() => {setShowTripTypeDropdown(!showTripTypeDropdown); setShowBudgetDropdown(false); setShowRegionDropdown(false);}}>
                    {selectedTripType} <span className="caret">▾</span>
                  </button>
                  {showTripTypeDropdown && (
                    <div className="exp-dropdown-menu">
                      {tripTypeOptions.map(opt => <div key={opt} onClick={() => {setSelectedTripType(opt); setShowTripTypeDropdown(false)}}>{opt}</div>)}
                    </div>
                  )}
                </div>
                
                {(selectedBudget !== "All Budgets" || selectedRegion !== "All Regions" || selectedTripType !== "All Types" || searchQuery) && (
                   <button className="exp-btn-clear" onClick={resetFilters}>✕ Clear Filters</button>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      <main className="exp-main container">
        
        {/* POPULAR DESTINATIONS GRID */}
        <section className="exp-section">
          <div className="exp-section-header">
            <h2>Popular Solo Destinations</h2>
            <span className="exp-count">{filteredPopular.length} results found</span>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="exp-empty">
              <h3>No destinations matched your criteria.</h3>
              <p>Try clearing some filters or searching broader locations.</p>
              <button onClick={resetFilters}>Clear All Filters</button>
            </div>
          ) : (
            <div className="exp-grid">
              {filteredPopular.map(dest => (
                <article key={dest.id} className="exp-card">
                  <div className="exp-card-img">
                    <img src={dest.img || "/traveler.jpg"} alt={dest.city} />
                    <div className="exp-card-badge">{dest.tag}</div>
                  </div>
                  <div className="exp-card-body">
                    <h3>{dest.city}</h3>
                    <div className="exp-meta">
                      <span>🧭 {dest.days}</span>
                      <span>⭐ {dest.rating} ({dest.reviews.toLocaleString()})</span>
                    </div>
                    <div className="exp-card-footer">
                      <span className="exp-budget-pill">{dest.budget}</span>
                      <button onClick={() => navigate('/Destinationdetail')}>Discover</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* TAILORED CAROUSEL */}
        <section className="exp-section">
          <div className="exp-section-header">
            <h2>Perfect For Your Style</h2>
          </div>
          <div className="exp-horizontal-scroll">
            {tailoredDestinations.map(dest => (
              <article key={dest.id} className="exp-card exp-card-slim">
                 <div className="exp-card-img">
                    <img src={dest.img} alt={dest.city} />
                 </div>
                 <div className="exp-card-overlay">
                    <h3>{dest.city}</h3>
                    <span>{dest.tag}</span>
                 </div>
                 <div className="exp-card-action">
                    <button onClick={() => navigate('/Destinationdetail')}>Explore</button>
                 </div>
              </article>
            ))}
          </div>
        </section>

        {/* MORE DISCOVERIES */}
        <section className="exp-section">
          <div className="exp-section-header">
            <h2>Hidden Gems & Getaways</h2>
          </div>
          <div className="exp-grid exp-grid-wide">
            {discoverMore.map(dest => (
              <article key={dest.id} className="exp-card exp-card-horizontal">
                <div className="exp-card-img">
                  <img src={dest.img} alt={dest.city} />
                </div>
                <div className="exp-card-body">
                  <h3>{dest.city}</h3>
                  <span className="exp-highlight-pill">{dest.tag}</span>
                  <button className="exp-card-link" onClick={() => navigate('/Destinationdetail')}>View Itinerary →</button>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="exp-footer">
        <div className="container">
          <div className="exp-footer-logo">PackNgo Explore</div>
          <div className="exp-footer-links">
             <span>© 2026 PackNgo. All Rights Reserved.</span>
             <a href="#!">Privacy Policy</a>
             <a href="#!">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Show;