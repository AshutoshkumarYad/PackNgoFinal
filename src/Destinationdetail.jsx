import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './Destinationdetail.css';
import Navbar from './Navbar';

export default function Destinationdetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeName = searchParams.get("name") || "Swiss Alps";

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  // Authentic Reviews State
  const [realReviews, setRealReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("packngo_user"));

  // Survival Guide States
  const [guideData, setGuideData] = useState(null);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('etiquette'); // etiquette, phrases, safety

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchRealReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/${encodeURIComponent(placeName)}`);
        if (res.ok) {
           const data = await res.json();
           setRealReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch authentic reviews:", err);
      }
    };
    fetchRealReviews();

    const fetchDetails = async () => {
      try {
        const cacheKey = `dest_data_${placeName}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setData(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        try {
          const dbRes = await fetch(`/api/destinations/detail/${encodeURIComponent(placeName)}`);
          if (dbRes.ok) {
             const dbData = await dbRes.json();
             setData(dbData);
             sessionStorage.setItem(cacheKey, JSON.stringify(dbData));
             setIsLoading(false);
             return;
          }
        } catch (e) {
          console.error("Database fetch failed, falling back to Gemini", e);
        }

        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        const prompt = `You are a legendary local travel guide. Generate a comprehensive travel page for "${placeName}".
        The JSON MUST perfectly match this exact schema:
        {
          "title": "Full Name of Destination",
          "heroDescription": "1 elegant, highly customized sentence capturing the essence of ${placeName}",
          "rating": "4.8",
          "locationText": "Region or Country",
          "season": "Best time to visit",
          "aboutText": "A highly detailed, rich 3-4 sentence paragraph deeply describing the history, local culture, legendary landmarks, and vibrant atmosphere of ${placeName}. Make it incredibly immersive.",
          "safety": {
            "overall": "High (8.5/10)",
            "soloFemale": "Very Safe (9/10)",
            "transport": "Safe (8/10)",
            "health": "Well-equipped local clinics",
            "hazards": "Low to Moderate",
            "political": "Very Stable",
            "emergency": "911 or 112"
          },
          "budget": {
            "hotelHigh": "$200",
            "hotelMid": "$100 - $150",
            "hostel": "$30 - $50",
            "meals": "$40 avg daily"
          },
          "attractions": ["Name of Place 1", "Name of Place 2", "Name of Place 3", "Name of Place 4", "Name of Place 5", "Name of Place 6"],
          "itineraries": [
            { "title": "3-Day Highlights", "desc": "Day 1... Day 2... Day 3...", "expanded": false },
            { "title": "5-Day Deep Dive", "desc": "Day 1 to 5...", "expanded": true },
            { "title": "7-Day Ultimate", "desc": "Day 1 to 7...", "expanded": false }
          ],
          "reviews": [
            { "name": "Alex D.", "rating": 5, "text": "Incredible solo trip! So much to see." },
            { "name": "Sam T.", "rating": 4, "text": "Loved the local food and culture." },
            { "name": "Jordan P.", "rating": 5, "text": "Felt very safe and welcomed." },
            { "name": "Casey H.", "rating": 4, "text": "Great transport links." },
            { "name": "Riley M.", "rating": 5, "text": "Highlight of my year!" },
            { "name": "Jamie L.", "rating": 5, "text": "Must visit." }
          ],
          "nearby": ["Nearby City 1", "Nearby Place 2", "Nearby Region 3", "Nearby Attraction 4"]
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);
        
        parsed.attractions = parsed.attractions.slice(0, 6).map((name) => ({ name, img: `/api/places/image?query=${encodeURIComponent(name + ' ' + placeName)}` }));
        parsed.nearby = parsed.nearby.slice(0, 4).map((name) => ({ name, img: `/api/places/image?query=${encodeURIComponent(name)}` }));
        
        setData(parsed);
        sessionStorage.setItem(cacheKey, JSON.stringify(parsed));

        try {
          await fetch(`/api/destinations/detail`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(parsed)
          });
        } catch (e) {
          console.error("Failed to save generated data to database", e);
        }
      } catch (err) {
        console.error("Gemini failed to load destination:", err);
        // Fallback robust mock dataset if Gemini throws rate-limiting or parsing errors
        const fallbackAttractionTypes = ["Most famous landmark", "Top historic site", "Most beautiful architecture", "Most popular tourist site", "Biggest cultural monument", "Top scenic viewpoint"];
        const fallbackNearbyTypes = ["Neighboring popular city", "Nearby iconic village", "Most famous neighboring region", "Nearby mountain or beach resort"];
        
        setData({
          title: placeName,
          heroDescription: "A breathtaking global destination offering incredible adventures.",
          rating: "4.8",
          locationText: "Global Discovery",
          season: "Year-Round",
          aboutText: "This fantastic destination offers unparalleled experiences for travelers. Its vibrant history, captivating natural beauty, and rich local culture make it an absolute must-visit. From exploring ancient historic landmarks to relaxing amidst stunning geographical scenery, this location provides the absolute perfect escape for both thrill-seekers and those looking to completely unwind and connect with local traditions.",
          safety: { overall: "High (8/10)", soloFemale: "Very Safe", transport: "Reliable", health: "Accessible Clinics", hazards: "Low", political: "Stable", emergency: "Standard Local Dial" },
          budget: { hotelHigh: "$250+", hotelMid: "$120", hostel: "$40", meals: "$35 daily avg" },
          attractions: fallbackAttractionTypes.map((type, i) => ({ 
             name: type, 
             img: `/api/places/image?query=${encodeURIComponent(type + " in " + placeName)}` 
          })),
          itineraries: [{ title: "3-Day Highlights", desc: "Day 1: Arrival & Exploration.\nDay 2: City Tours & Monuments.\nDay 3: Scenic Views & Departure.", expanded: true }, { title: "5-Day Deep Dive", desc: "Explore the deeper culture across 5 extended days...", expanded: false }],
          reviews: [{ name: "Alex R.", rating: 5, text: "Absolutely loved the vibe here! Highly recommend." }, { name: "Jamie L.", rating: 4, text: "Great food and safely walkable." }, { name: "Sam K.", rating: 5, text: "Stunning spot for any independent traveler." }],
          nearby: fallbackNearbyTypes.map((type, i) => ({ 
             name: `Neighboring ${type}`, 
             img: `/api/places/image?query=${encodeURIComponent("Tourist " + type + " near " + placeName)}` 
          }))
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [placeName]);

  const toggleItinerary = (idx) => {
    const newData = {...data};
    newData.itineraries[idx].expanded = !newData.itineraries[idx].expanded;
    setData(newData);
  };

  const fetchSurvivalGuide = async () => {
    if (guideData) {
      setShowGuideModal(true);
      return;
    }

    setIsGuideLoading(true);
    setShowGuideModal(true);

    const cacheKey = `survival_guide_${placeName}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setGuideData(JSON.parse(cached));
      setIsGuideLoading(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          generationConfig: { responseMimeType: "application/json" }
      });
      const prompt = `You are a local survival guide expert for "${placeName}".
      Return strictly JSON formatted exactly like this:
      {
        "etiquette": ["Important do #1", "Important don't #2", "Cultural norm #3"],
        "phrases": [
          {"english": "Hello", "local": "Native Script (e.g., こんにちは or Hola)", "pronunciation": "Phonetic English Breakdown (e.g., kohn-nee-chee-wah)"}
        ],
        "safety": ["Specific safety tip 1", "Neighborhood to avoid 2", "Scam warning 3"]
      }
      CRITICAL INSTRUCTION: For the "phrases" array, the "local" value MUST be in the actual native script and language of ${placeName} (e.g., Japanese Kanji/Hiragana, Thai script, Spanish, etc.). The "pronunciation" MUST be a clear phonetic breakdown for an English speaker.
      Provide 5 key etiquette rules, 7 essential phrases, and 4 crucial safety/scam warnings.`;
      
      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      setGuideData(parsed);
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
    } catch (err) {
      console.error("Survival Guide generation failed:", err);
      // Premium fallback data
      setGuideData({
        etiquette: ["Always respect local cultural norms and etiquette.", "Avoid loud or disruptive behavior in public transport.", "Dress appropriately when visiting religious or historical landmarks.", "Learn a few basic words in the local language to show respect."],
        phrases: [
          {english: "Hello", local: "(Network Error / Rate Limit)", pronunciation: "Failed to generate native translation"},
          {english: "Thank you", local: "(Network Error / Rate Limit)", pronunciation: "Failed to generate native translation"},
          {english: "Where is the bathroom?", local: "(Network Error / Rate Limit)", pronunciation: "Failed to generate native translation"},
          {english: "How much is this?", local: "(Network Error / Rate Limit)", pronunciation: "Failed to generate native translation"},
          {english: "Help", local: "(Network Error / Rate Limit)", pronunciation: "Failed to generate native translation"}
        ],
        safety: ["Always keep your personal belongings secure in crowded tourist areas.", "Use exclusively official and metered taxis or verified ride-sharing apps.", "Exercise standard urban caution when exploring unfamiliar neighborhoods after dark.", "Keep digital copies of your passport and emergency contacts readily available."]
      });
    } finally {
      setIsGuideLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.token) {
       alert("Please log in to submit a review.");
       return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(placeName)}`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentUser.token}`
         },
         body: JSON.stringify({ rating: reviewRating, text: reviewInput })
      });
      const resData = await res.json();
      if (!res.ok) {
         alert(resData.msg || "Failed to submit review.");
         return;
      }
      setRealReviews([resData, ...realReviews]);
      setReviewInput("");
      setReviewRating(5);
      alert("Review successfully posted!");
    } catch (err) {
      console.error("Review error:", err);
      alert("Network error while submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
       const res = await fetch(`/api/reviews/${reviewId}`, {
         method: "DELETE",
         headers: {
            "Authorization": `Bearer ${currentUser.token}`
         }
       });
       if (res.ok) {
          setRealReviews(realReviews.filter(r => r._id !== reviewId));
       } else {
          const resData = await res.json();
          alert(resData.msg || "Failed to delete review.");
       }
    } catch (err) {
       console.error("Failed to delete review", err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#0a0e1a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
         <Navbar activePage="" />
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="dest-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s infinite linear' }}></div>
            <h2 style={{ color: '#fff', marginTop: '20px' }}>Mapping Details For {placeName}...</h2>
         </div>
         <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
     return <div style={{ color: 'white', padding: '50px' }}>Failed to load destination data. Please try again.</div>;
  }

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      backgroundColor: '#0a0e1a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh'
    }}>
      <Navbar activePage="" />
      <div className="hero-section" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("/api/places/image?query=${encodeURIComponent("Most famous landmark in " + placeName)}")`
      }}>
        <div className="hero-content">
          <h1 className="hero-title">{data.title}</h1>
          <p className="hero-description">{data.heroDescription}</p>
          <div className="hero-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} fill="#fbbf24" color="#fbbf24" />
              <span>{data.rating} Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} />
              <span>{data.locationText}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} />
              <span>{data.season}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button className="cta-button" onClick={() => navigate('/Tripplanner')}>
              Plan My Trip
            </button>
            <button className="cta-button" onClick={fetchSurvivalGuide} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              🛡️ AI Survival Guide
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="section">
        <h2 className="section-title">About This Destination</h2>
        <p className="section-text">{data.aboutText}</p>
      </div>

      {/* Safety & Budget Section */}
      <div className="section dark-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          {/* Safety */}
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '25px' }}>
              Safety & Well-being
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Overall Safety Index</div>
              <div style={{ color: '#10b981', fontSize: '18px', fontWeight: '600' }}>{data.safety.overall}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px', color: '#cbd5e1' }}>
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>Solo Female Safety</div>
                  <div>{data.safety.soloFemale}</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>Local Transportation</div>
                  <div>{data.safety.transport}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#fff' }}>Health Resources</div>
                  <div>{data.safety.health}</div>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>Natural Hazards</div>
                  <div>{data.safety.hazards}</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>Political Stability</div>
                  <div>{data.safety.political}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#fff' }}>Emergency Services</div>
                  <div>{data.safety.emergency}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '25px' }}>
              Budget Breakdown (Daily Average)
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Accommodation</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#cbd5e1' }}>🏨 High-end Hotels</span>
                <span>{data.budget.hotelHigh}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#cbd5e1' }}>🏨 Mid-range Hotels</span>
                <span>{data.budget.hotelMid}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ color: '#cbd5e1' }}>🏨 Hostels</span>
                <span>{data.budget.hostel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#cbd5e1' }}>🍽️ Meals (budgeted)</span>
                <span>{data.budget.meals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Attractions */}
      <div className="section dark-section">
        <h2 className="section-title">Top Attractions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
          {data.attractions.map((attraction, idx) => (
            <div key={idx} style={{
              height: '200px',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${attraction.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '18px', fontWeight: '600' }}>{attraction.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Itineraries */}
      <div className="section">
        <h2 className="section-title">Suggested Itineraries</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.itineraries.map((itinerary, idx) => (
            <div key={idx} onClick={() => toggleItinerary(idx)} style={{
              backgroundColor: '#1a1f2e',
              borderRadius: '12px',
              padding: '25px',
              cursor: 'pointer'
            }}>
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: itinerary.expanded ? '15px' : '0'
              }}>
                <span style={{ fontSize: '20px', fontWeight: '600' }}>{itinerary.title}</span>
                <ChevronRight size={24} style={{ transform: itinerary.expanded ? 'rotate(90deg)' : 'rotate(0)' }}/>
              </div>
              {itinerary.expanded && (
                <p className="section-text" style={{ marginTop: '15px', whiteSpace: 'pre-line' }}>{itinerary.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="section dark-section">
        <h2 className="section-title">Verified Traveler Reviews</h2>
        
        {/* Form to leave a review */}
        <div style={{ backgroundColor: '#1a1f2e', borderRadius: '12px', padding: '25px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Leave and Verify a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
              <span style={{color: '#cbd5e1'}}>Rating:</span>
              {[1,2,3,4,5].map(star => (
                <Star 
                   key={star} 
                   size={24} 
                   fill={reviewRating >= star ? "#fbbf24" : "transparent"} 
                   color={reviewRating >= star ? "#fbbf24" : "#64748b"} 
                   style={{ cursor: 'pointer' }}
                   onClick={() => setReviewRating(star)}
                />
              ))}
            </div>
            <textarea 
               value={reviewInput}
               onChange={(e) => setReviewInput(e.target.value)}
               placeholder="Share your authentic experience about this destination..."
               required
               style={{ width: '100%', minHeight: '100px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '15px', color: '#fff', marginBottom: '15px', fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={submittingReview} style={{ backgroundColor: '#2e7bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: submittingReview ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {submittingReview ? "Verifying Trip..." : "Submit Review"}
            </button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
          {/* Authentic Database Reviews */}
          {realReviews.map((review) => (
            <div key={review._id} style={{ backgroundColor: '#1a1f2e', borderRadius: '12px', padding: '25px', border: '1px solid rgba(16, 185, 129, 0.3)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                 <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span> Verified
                 </span>
                 {currentUser && currentUser.user.id === review.user._id && (
                    <button onClick={() => handleDeleteReview(review._id)} style={{ background: '#f87171', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                 )}
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <img src={review.user.avatar ? (review.user.avatar.startsWith('/uploads') ? `${review.user.avatar}` : review.user.avatar) : 'https://via.placeholder.com/48'} alt={review.user.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{review.user.name}</div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{review.text}</p>
            </div>
          ))}

          {/* AI Mock Reviews */}
          {data.reviews.map((review, idx) => (
            <div key={`mock-${idx}`} style={{ backgroundColor: '#1a1f2e', borderRadius: '12px', padding: '25px', opacity: 0.6 }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {review.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{review.name}</div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#e2e8f0" color="#e2e8f0" />
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>{review.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Destinations */}
      <div className="section dark-section">
        <h2 className="section-title">Nearby Discoveries</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
          {data.nearby.map((dest, idx) => (
            <div key={idx} style={{
              height: '250px', borderRadius: '12px', overflow: 'hidden', position: 'relative',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${dest.img})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'flex-end', padding: '20px', cursor: 'pointer', transition: 'transform 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => {
              navigate(`/Destinationdetail?name=${encodeURIComponent(dest.name)}`);
            }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>{dest.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '40px 80px', borderTop: '1px solid #1a1f2e',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '1400px', margin: '0 auto'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Packtrips</div>
        <div style={{ color: '#64748b', fontSize: '14px' }}>© 2026 PackNgo. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
        </div>
      </footer>

      {/* AI Survival Guide Modal */}
      {showGuideModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowGuideModal(false)}>
          <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🗺️</span>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>AI Survival Guide: {placeName}</h3>
              </div>
              <button onClick={() => setShowGuideModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', padding: '0 24px', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => setActiveGuideTab('etiquette')} style={{ padding: '15px 0', background: 'transparent', border: 'none', color: activeGuideTab === 'etiquette' ? '#fbbf24' : '#94a3b8', borderBottom: activeGuideTab === 'etiquette' ? '2px solid #fbbf24' : '2px solid transparent', cursor: 'pointer', fontWeight: '600' }}>🤝 Etiquette</button>
              <button onClick={() => setActiveGuideTab('phrases')} style={{ padding: '15px 0', background: 'transparent', border: 'none', color: activeGuideTab === 'phrases' ? '#38bdf8' : '#94a3b8', borderBottom: activeGuideTab === 'phrases' ? '2px solid #38bdf8' : '2px solid transparent', cursor: 'pointer', fontWeight: '600' }}>🗣️ Phrases</button>
              <button onClick={() => setActiveGuideTab('safety')} style={{ padding: '15px 0', background: 'transparent', border: 'none', color: activeGuideTab === 'safety' ? '#f87171' : '#94a3b8', borderBottom: activeGuideTab === 'safety' ? '2px solid #f87171' : '2px solid transparent', cursor: 'pointer', fontWeight: '600' }}>🛡️ Safety</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {isGuideLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div className="dest-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s infinite linear', marginBottom: '20px' }}></div>
                  Our AI is currently curating localized intel for you...
                </div>
              ) : guideData ? (
                <>
                  {activeGuideTab === 'etiquette' && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {guideData.etiquette.map((item, idx) => (
                        <li key={idx} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid #fbbf24', lineHeight: '1.5' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {activeGuideTab === 'phrases' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {guideData.phrases.map((phrase, idx) => (
                        <div key={idx} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                          <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{phrase.english}</div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#fff' }}>{phrase.local}</div>
                          <div style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '14px' }}>"{phrase.pronunciation}"</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeGuideTab === 'safety' && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {guideData.safety.map((item, idx) => (
                        <li key={idx} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid #f87171', lineHeight: '1.5' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}