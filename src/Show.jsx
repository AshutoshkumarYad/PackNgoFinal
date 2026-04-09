import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { globalDestinations } from "./data/destinationsData";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Show.css";
import Navbar from "./Navbar";

const defaultFallbackObj = { 
  city: "Global Destination", tag: "Discovery", reviews: 1000, rating: 4.8, days: "5 Days", budget: "Mid Range", region: "Global", 
  img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80" 
};

function Show() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedBudget, setSelectedBudget] = useState("All Budgets");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedTripType, setSelectedTripType] = useState("All Types");
  
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);

  // Native Database States - instantly load beautifully scaled arrays
  const [destinations, setDestinations] = useState(() => [...globalDestinations].sort(() => 0.5 - Math.random()).slice(0, 8));
  const [tailoredDestinations, setTailoredDestinations] = useState(() => [...globalDestinations].sort(() => 0.5 - Math.random()).slice(0, 4));
  const [isSearching, setIsSearching] = useState(false);
  const [isTailoredLoading, setIsTailoredLoading] = useState(false);

  const budgetOptions = ["All Budgets", "Budget Friendly", "Mid Range", "Luxury"];
  const regionOptions = ["All Regions", "Europe", "Asia", "Americas", "Africa", "Oceania"];
  const tripTypeOptions = ["All Types", "City Escape", "Adventure", "Cultural", "Beach", "Nature"];

  useEffect(() => {
    window.scrollTo(0, 0);
    // Instant execution from URL params without waiting on generative models
    if (searchParams.get("q")) {
       handleSearch(searchParams.get("q"));
    }
  }, []);

  const generateTailoredPadding = (srcArray) => {
      let tailored = srcArray.length > 4 ? [...srcArray].sort(() => 0.5 - Math.random()).slice(0, 4) : [...srcArray];
      if (tailored.length > 0 && tailored.length < 4) {
          const firstDest = tailored[0];
          const related = globalDestinations.filter(d => d.tag === firstDest.tag && d.city !== firstDest.city).sort(() => 0.5 - Math.random());
          for (let r of related) { if (tailored.length >= 4) break; tailored.push(r); }
          if (tailored.length < 4) {
              const randomMore = globalDestinations.filter(d => !tailored.find(t => t.city === d.city)).sort(() => 0.5 - Math.random());
              for (let r of randomMore) { if (tailored.length >= 4) break; tailored.push(r); }
          }
      }
      return tailored;
  };

  const handleSearch = async (queryParam) => {
    setIsSearching(true);
    setIsTailoredLoading(true);
    
    const activeQuery = (typeof queryParam === "string" ? queryParam : searchQuery).trim();
    if (!activeQuery) {
        setTimeout(() => {
          const filtered = globalDestinations.filter(d => {
             const matchBudget = selectedBudget === "All Budgets" || d.budget === selectedBudget;
             const matchRegion = selectedRegion === "All Regions" || d.region === selectedRegion;
             const matchType = selectedTripType === "All Types" || d.tag === selectedTripType;
             return matchBudget && matchRegion && matchType;
          });
          setDestinations(filtered.length > 0 ? filtered.slice(0, 8) : Array(4).fill(defaultFallbackObj).map((d,i)=>({...d, id:i})));
          setIsSearching(false);
          let tailored = filtered.length > 4 ? [...filtered].sort(() => 0.5 - Math.random()).slice(0, 4) : filtered.slice(0, 4);
          setTailoredDestinations(tailored.length ? tailored : Array(4).fill(defaultFallbackObj).map((d,i)=>({...d, id:i})));
          setIsTailoredLoading(false);
        }, 400);
        return;
    }

    try {
        const dbRes = await fetch(`/api/destinations/explore?q=${encodeURIComponent(activeQuery.toLowerCase())}`);
        if (dbRes.ok) {
           const dbData = await dbRes.json();
           setDestinations(dbData);
           setTailoredDestinations(generateTailoredPadding(dbData));
           setIsSearching(false);
           setIsTailoredLoading(false);
           return;
        }
    } catch (e) {
        console.error("Database check failed, falling back to Gemini", e);
    }

    try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { responseMimeType: "application/json" } });
        
        const prompt = `Analyze this travel query: "${activeQuery}".
If the query is a broad theme, region, or general idea (e.g. "beaches in Asia" or "adventure trips"), generate exactly 8 highly diverse, phenomenal travel destinations matching it.
HOWEVER, if the query is a specific, singular city, town, or exact location (e.g. "Delhi", "Paris, France", "Tokyo"), generate EXACTLY 1 card for that specific destination and STOP. DO NOT generate multiple variations of the same city.

Filter Strictness: (Budget: All Budgets, Region: All Regions, Type: All Types).
Return a STRICT JSON array of exact objects matching this schema precisely: 
[{"id": 1, "city": "Exact World Town/City", "tag": "Style (e.g. Adventure)", "reviews": 1500, "rating": 4.8, "days": "4-7 Days", "budget": "Mid Range", "region": "Asia"}]`;

        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        
        for (let dest of parsed) {
             dest.img = `/api/places/image?query=${encodeURIComponent("Most famous landmark in " + dest.city)}`;
        }

        setDestinations(parsed);
        let tailored = generateTailoredPadding(parsed);
        setTailoredDestinations(tailored);
        
        try {
           await fetch(`/api/destinations/explore`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: activeQuery, destinations: parsed })
           });
        } catch (e) { console.error("Failed to save to db"); }

    } catch (err) {
        console.error("Gemini fallback failed", err);
        setDestinations(Array(4).fill(defaultFallbackObj).map((d,i)=>({...d, id:i})));
        setTailoredDestinations(Array(4).fill(defaultFallbackObj).map((d,i)=>({...d, id:i})));
    } finally {
        setIsSearching(false);
        setIsTailoredLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBudget("All Budgets");
    setSelectedRegion("All Regions");
    setSelectedTripType("All Types");
  };

  const executeManualSearch = () => {
    handleSearch();
  };

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
            The world's first intelligent location matrix. Search for any vibe, aesthetic, or region on Earth instantly.
          </p>
          
          <div className="exp-search-bar" style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="exp-search-icon">🔍</span>
            <input 
              style={{ flex: 1 }}
              type="text" 
              placeholder="Search anywhere, e.g. 'Quiet castles in Eastern Europe'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeManualSearch()}
            />
            <button 
              onClick={executeManualSearch} 
              style={{ border: 'none', background: 'var(--primary)', color: '#111', padding: '0 30px', margin: '4px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
              Generate
            </button>
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
                   <button className="exp-btn-clear" onClick={resetFilters}>✕ Clear</button>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      <main className="exp-main container">
        
        {/* DYNAMIC DESTINATIONS GRID */}
        <section className="exp-section">
          <div className="exp-section-header">
            <h2>Generated Discoveries</h2>
            {!isSearching && <span className="exp-count">{destinations.length} global hits</span>}
          </div>

          {isSearching ? (
             <div className="exp-grid">
               {Array(4).fill(0).map((_, i) => (
                 <article key={i} className="exp-card" style={{ opacity: 0.4, animation: 'pulse 1.5s infinite' }}>
                   <div className="exp-card-img" style={{ background: '#222' }}></div>
                   <div className="exp-card-body" style={{ background: 'rgba(255,255,255,0.01)' }}>
                     <div style={{ height: '20px', background: '#333', borderRadius: '4px', marginBottom: '15px' }}></div>
                     <div style={{ height: '14px', background: '#333', borderRadius: '4px', width: '50%' }}></div>
                   </div>
                 </article>
               ))}
             </div>
          ) : destinations.length === 0 ? (
            <div className="exp-empty">
              <h3>No destinations matched your criteria.</h3>
              <p>Try clearing your rigid filters or typing a broader geographic location.</p>
              <button onClick={resetFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="exp-grid">
              {destinations.map(dest => (
                <article key={dest.id} className="exp-card">
                  <div className="exp-card-img">
                    <img src={dest.img || "/traveler.jpg"} alt={dest.city} loading="lazy" />
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
                      <button onClick={() => navigate(`/Destinationdetail?name=${encodeURIComponent(dest.city)}`)}>Discover</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* AI TAILORED CAROUSEL */}
        <section className="exp-section">
          <div className="exp-section-header">
            <h2>Perfect For Your Style</h2>
            <p style={{ color: '#888', marginTop: '4px', fontSize: '0.9rem' }}>Hyper-personalized hidden gems based on your exact search interest.</p>
          </div>
          
          {isTailoredLoading ? (
            <div className="exp-horizontal-scroll">
              {Array(4).fill(0).map((_, i) => (
                <article key={i} className="exp-card exp-card-slim" style={{ opacity: 0.4, animation: 'pulse 1.5s infinite', background: '#222' }}>
                  <div className="exp-card-img"></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="exp-horizontal-scroll">
              {tailoredDestinations.map(dest => (
                <article key={dest.id} className="exp-card exp-card-slim">
                   <div className="exp-card-img">
                      <img src={dest.img} alt={dest.city} loading="lazy" />
                   </div>
                   <div className="exp-card-overlay">
                      <h3>{dest.city}</h3>
                      <span>{dest.tag}</span>
                   </div>
                   <div className="exp-card-action">
                      <button onClick={() => navigate(`/Destinationdetail?name=${encodeURIComponent(dest.city)}`)}>Explore</button>
                   </div>
                </article>
              ))}
            </div>
          )}
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