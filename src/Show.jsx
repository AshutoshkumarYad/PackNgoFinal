import React, { useState, useEffect } from "react";
import "./Show.css";

function Show() {
  // State for destinations data
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [tailoredDestinations, setTailoredDestinations] = useState([]);
  const [discoverMore, setDiscoverMore] = useState([]);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch data on mount
  useEffect(() => {
    fetchDestinations();
    
    // Set up real-time updates every 45 seconds
    const interval = setInterval(() => {
      fetchDestinations();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Fetch destinations (simulated API call)
  const fetchDestinations = async () => {
    try {
      // In real app: const response = await fetch('YOUR_API_URL/destinations');
      
      // Simulated data with dynamic reviews
      const popular = [
        {
          id: 1,
          city: "Paris, France",
          tag: "City Escape",
          reviews: Math.floor(2120 + Math.random() * 50),
          rating: 4.8,
          days: "4–7 Days",
          budget: "Mid Range",
          region: "Europe",
         img: "/src/assets/Paris.jpg",
        },
        {
          id: 2,
          city: "Kyoto, Japan",
          tag: "Cultural",
          reviews: Math.floor(870 + Math.random() * 30),
          rating: 4.9,
          days: "5–10 Days",
          budget: "Mid Range",
          region: "Asia",
          img: "/src/assets/kyoto.jpg",
        },
        {
          id: 3,
          city: "Machu Picchu, Peru",
          tag: "Adventure",
          reviews: Math.floor(1340 + Math.random() * 40),
          rating: 4.9,
          days: "3–5 Days",
          budget: "Budget Friendly",
          region: "Americas",
          img: "/src/assets/peru.webp",
        },
        {
          id: 4,
          city: "Reykjavik, Iceland",
          tag: "Nature",
          reviews: Math.floor(650 + Math.random() * 20),
          rating: 4.7,
          days: "4–6 Days",
          budget: "Luxury",
          region: "Europe",
          img: "/src/assets/Reykjavik.jpg",
        },
        {
          id: 5,
          city: "Cape Town, South Africa",
          tag: "Beach",
          reviews: Math.floor(910 + Math.random() * 25),
          rating: 4.8,
          days: "5–8 Days",
          budget: "Mid Range",
          region: "Africa",
          img: "/src/assets/capetown.jpg",
        },
        {
          id: 6,
          city: "Rome, Italy",
          tag: "Cultural",
          reviews: Math.floor(1780 + Math.random() * 60),
          rating: 4.8,
          days: "4–7 Days",
          budget: "Mid Range",
          region: "Europe",
          img: "/src/assets/rome.jpg",
        },
        {
          id: 7,
          city: "Zermatt, Switzerland",
          tag: "Nature",
          reviews: Math.floor(420 + Math.random() * 15),
          rating: 4.7,
          days: "3–5 Days",
          budget: "Luxury",
          region: "Europe",
          img: "/src/assets/zermatt.webp",
        },
        {
          id: 8,
          city: "Patagonia, Chile",
          tag: "Adventure",
          reviews: Math.floor(380 + Math.random() * 12),
          rating: 4.9,
          days: "7–14 Days",
          budget: "Mid Range",
          region: "Americas",
          img: "/src/assets/patagonia.jpg",
        },
        {
          id: 9,
          city: "Dubai, UAE",
          tag: "City Escape",
          reviews: Math.floor(1010 + Math.random() * 35),
          rating: 4.6,
          days: "3–5 Days",
          budget: "Luxury",
          region: "Asia",
          img: "/src/assets/dubai.webp",
        },
      ];

      const tailored = [
        {
          id: 101,
          city: "Bali, Indonesia",
          tag: "Super Friendly",
          budget: "Budget Friendly",
          region: "Asia",
          img: "/src/assets/bali.jpg",
        },
        {
          id: 102,
          city: "Queenstown, NZ",
          tag: "Very Safe",
          budget: "Mid Range",
          region: "Oceania",
          img: "/src/assets/queenstown.jpg",
        },
        {
          id: 103,
          city: "Amalfi Coast, Italy",
          tag: "Luxury",
          budget: "Luxury",
          region: "Europe",
          img: "/src/assets/amalfi.webp",
        },
        {
          id: 104,
          city: "Santorini, Greece",
          tag: "Romantic",
          budget: "Luxury",
          region: "Europe",
          img: "/src/assets/Paris.jpg",
        },
        {
          id: 105,
          city: "Chiang Mai, Thailand",
          tag: "Budget Friendly",
          budget: "Budget Friendly",
          region: "Asia",
          img: "/src/assets/bankok.webp",
        },
      ];

      const discover = [
        {
          id: 201,
          city: "Lisbon, Portugal",
          tag: "Budget Friendly",
          days: "4–7 Days",
          budget: "Budget Friendly",
          region: "Europe",
          img: "/src/assets/lisbon.avif",
        },
        {
          id: 202,
          city: "Vancouver, Canada",
          tag: "Mix of Range",
          days: "5–8 Days",
          budget: "Mid Range",
          region: "Americas",
          img: "/src/assets/vancouver.webp",
        },
        {
          id: 203,
          city: "Bangkok, Thailand",
          tag: "Super Friendly",
          days: "3–6 Days",
          budget: "Budget Friendly",
          region: "Asia",
          img: "/src/assets/bankok.webp",
        },
        {
          id: 204,
          city: "Sydney, Australia",
          tag: "Mid Range",
          days: "5–10 Days",
          budget: "Mid Range",
          region: "Oceania",
          img: "/src/assets/sydney.webp",
        },
      ];

      setPopularDestinations(popular);
      setTailoredDestinations(tailored);
      setDiscoverMore(discover);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setIsLoading(false);
    }
  };

  // Filter destinations based on search and filters
  const getFilteredDestinations = (destinations) => {
    return destinations.filter(dest => {
      const matchesSearch = dest.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBudget = selectedBudget === "All Budgets" || dest.budget === selectedBudget;
      const matchesRegion = selectedRegion === "All Regions" || dest.region === selectedRegion;
      const matchesTripType = selectedTripType === "All Types" || dest.tag === selectedTripType;
      
      return matchesSearch && matchesBudget && matchesRegion && matchesTripType;
    });
  };

  // Carousel navigation
  const handlePrevTailored = () => {
    setTailoredIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTailored = () => {
    setTailoredIndex(prev => Math.min(tailoredDestinations.length - 3, prev + 1));
  };

  // Get visible tailored destinations
  const getVisibleTailored = () => {
    return tailoredDestinations.slice(tailoredIndex, tailoredIndex + 3);
  };

  // Handle filter selection
  const handleBudgetSelect = (budget) => {
    setSelectedBudget(budget);
    setShowBudgetDropdown(false);
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setShowRegionDropdown(false);
  };

  const handleTripTypeSelect = (type) => {
    setSelectedTripType(type);
    setShowTripTypeDropdown(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBudget("All Budgets");
    setSelectedRegion("All Regions");
    setSelectedTripType("All Types");
  };

  const filteredPopular = getFilteredDestinations(popularDestinations);
  const filteredDiscover = getFilteredDestinations(discoverMore);

  if (isLoading) {
    return (
      <div className="app-root">
        <header className="navbar">
          <div className="nav-left">
            <span className="logo-text">Pac<span className="logo-highlight">KN</span>Go</span>
          </div>
        </header>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-left">
          <span className="logo-text">Pac<span className="logo-highlight">KN</span>Go</span>
        </div>
        <nav className="nav-links">
          <a href="#hero">Home</a>
          <a href="#popular">Explore</a>
          <a href="#trips">Trips</a>
          <a href="#community">Community</a>
          <a href="#profile">Profile</a>
        </nav>
        <div className="nav-right">
          <div className="nav-avatar">A</div>
        </div>
      </header>

      <main className="main-area">
        {/* HERO */}
        <section className="hero-section" id="hero">
          <div className="container">
            <div className="hero-card">
              <div className="hero-left">
                <h1>Where will your next solo adventure take you?</h1>
                <p className="hero-text">
                  Explore hand-picked destinations perfect for independent
                  travelers. From vibrant cities to serene natural escapes,
                  find your next journey.
                </p>

                <div className="hero-search">
                  <input
                    type="text"
                    placeholder="Search destinations, countries or experiences..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn-primary">Search</button>
                </div>

                <div className="hero-filters">
                  {/* Budget Dropdown */}
                  <div className="dropdown-wrapper">
                    <button 
                      className="pill-btn"
                      onClick={() => {
                        setShowBudgetDropdown(!showBudgetDropdown);
                        setShowRegionDropdown(false);
                        setShowTripTypeDropdown(false);
                      }}
                    >
                      {selectedBudget} ▾
                    </button>
                    {showBudgetDropdown && (
                      <div className="dropdown-menu">
                        {budgetOptions.map(option => (
                          <div
                            key={option}
                            className={`dropdown-item ${selectedBudget === option ? 'active' : ''}`}
                            onClick={() => handleBudgetSelect(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Region Dropdown */}
                  <div className="dropdown-wrapper">
                    <button 
                      className="pill-btn"
                      onClick={() => {
                        setShowRegionDropdown(!showRegionDropdown);
                        setShowBudgetDropdown(false);
                        setShowTripTypeDropdown(false);
                      }}
                    >
                      {selectedRegion} ▾
                    </button>
                    {showRegionDropdown && (
                      <div className="dropdown-menu">
                        {regionOptions.map(option => (
                          <div
                            key={option}
                            className={`dropdown-item ${selectedRegion === option ? 'active' : ''}`}
                            onClick={() => handleRegionSelect(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trip Type Dropdown */}
                  <div className="dropdown-wrapper">
                    <button 
                      className="pill-btn"
                      onClick={() => {
                        setShowTripTypeDropdown(!showTripTypeDropdown);
                        setShowBudgetDropdown(false);
                        setShowRegionDropdown(false);
                      }}
                    >
                      {selectedTripType} ▾
                    </button>
                    {showTripTypeDropdown && (
                      <div className="dropdown-menu">
                        {tripTypeOptions.map(option => (
                          <div
                            key={option}
                            className={`dropdown-item ${selectedTripType === option ? 'active' : ''}`}
                            onClick={() => handleTripTypeSelect(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reset Filters Button */}
                  {(selectedBudget !== "All Budgets" || selectedRegion !== "All Regions" || selectedTripType !== "All Types" || searchQuery) && (
                    <button className="pill-btn reset-btn" onClick={resetFilters}>
                      ✕ Clear Filters
                    </button>
                  )}
                </div>

                {/* Active Filters Display */}
                {(selectedBudget !== "All Budgets" || selectedRegion !== "All Regions" || selectedTripType !== "All Types") && (
                  <div className="active-filters">
                    <span className="filter-label">Active filters:</span>
                    {selectedBudget !== "All Budgets" && (
                      <span className="filter-tag">{selectedBudget}</span>
                    )}
                    {selectedRegion !== "All Regions" && (
                      <span className="filter-tag">{selectedRegion}</span>
                    )}
                    {selectedTripType !== "All Types" && (
                      <span className="filter-tag">{selectedTripType}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="hero-right">
                <img
                  src="traveller.jpg"
                  alt="Solo traveler"
                />
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR DESTINATIONS */}
        <section className="section" id="popular">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Popular Solo Destinations</h2>
              <span className="results-count">{filteredPopular.length} destinations found</span>
            </div>
            
            {filteredPopular.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No destinations found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn-primary" onClick={resetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-3">
                {filteredPopular.map((d) => (
                  <div key={d.id} className="card destination-card">
                    <img src={d.img} alt={d.city} className="card-image" />
                    <div className="card-body">
                      <h3>{d.city}</h3>
                      <div className="meta-row">
                        <span>🧭 {d.days}</span>
                        <span className="divider">•</span>
                        <span>👤 Solo Friendly</span>
                      </div>
                      <div className="meta-row small">
                        <span>⭐ {d.rating} ({d.reviews.toLocaleString()} Reviews)</span>
                      </div>
                      <div className="card-footer">
                        <span className="tag-pill">{d.tag}</span>
                        <button className="btn-outline">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* TAILORED JUST FOR YOU */}
        <section className="section" id="trips">
          <div className="container">
            <div className="title-row">
              <h2 className="section-title">Tailored Just For You</h2>
              <div className="carousel-arrows">
                <button 
                  onClick={handlePrevTailored}
                  disabled={tailoredIndex === 0}
                  className="carousel-btn"
                >
                  {"<"}
                </button>
                <button 
                  onClick={handleNextTailored}
                  disabled={tailoredIndex >= tailoredDestinations.length - 3}
                  className="carousel-btn"
                >
                  {">"}
                </button>
              </div>
            </div>

            <div className="grid grid-3">
              {getVisibleTailored().map((d) => (
                <div key={d.id} className="card destination-card">
                  <img src={d.img} alt={d.city} className="card-image" />
                  <div className="card-body">
                    <h3>{d.city}</h3>
                    <div className="meta-row small">
                      <span>👤 {d.tag}</span>
                    </div>
                    <div className="card-footer">
                      <button className="btn-primary full-width">
                        Explore Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DISCOVER MORE */}
        <section className="section" id="community">
          <div className="container">
            <h2 className="section-title">Discover More For You</h2>
            
            {filteredDiscover.length === 0 ? (
              <div className="no-results">
                <p>No matching destinations in this section</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {filteredDiscover.map((d) => (
                  <div key={d.id} className="card wide-card">
                    <div className="wide-image-wrap">
                      <img src={d.img} alt={d.city} />
                    </div>
                    <div className="wide-body">
                      <h3>{d.city}</h3>
                      <div className="meta-row">
                        <span>🧭 {d.days}</span>
                        <span className="divider">•</span>
                        <span>👤 Solo</span>
                      </div>
                      <div className="meta-row small">
                        <span className="tag-pill">{d.tag}</span>
                      </div>
                      <div className="wide-footer">
                        <button className="btn-primary">Discover</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer" id="profile">
        <div className="container footer-inner">
          <span>© 2025 PacKNGo. All rights reserved.</span>
          <div className="footer-links">
            <a href="#!">Privacy Policy</a>
            <a href="#!">Terms of Service</a>
            <a href="#!">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Show;