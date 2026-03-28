import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from '@google/generative-ai';
import "./Tripplanner.css";
import Navbar from "./Navbar";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const Tripplanner = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // App overarching state
  const [savedTrips, setSavedTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);

  // Active Form / Trip states
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [travelers, setTravelers] = useState("1 Traveler (Solo)");
  const [budget, setBudget] = useState("Budget-Friendly");
  const [travelStyle, setTravelStyle] = useState("Culture & History");

  // Active Content states
  const [itinerary, setItinerary] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); 
  const [geminiHistory, setGeminiHistory] = useState([]); 
  
  // Chat input
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  // 1. Load from LocalStorage on initial mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem("packngo_saved_trips");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedTrips(parsed);
          // Auto-load the most recent trip if available
          if (parsed.length > 0) {
            loadTrip(parsed[0]);
          }
        }
      } catch (e) {
        console.error("Failed to parse saved trips");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Save to LocalStorage whenever savedTrips updates
  useEffect(() => {
    localStorage.setItem("packngo_saved_trips", JSON.stringify(savedTrips));
  }, [savedTrips]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatting]);

  // -- Helpers --

  const loadTrip = (trip) => {
    setActiveTripId(trip.id);
    setDestination(trip.destination);
    setStartDate(trip.startDate);
    setendDate(trip.endDate);
    setTravelers(trip.travelers);
    setBudget(trip.budget);
    setTravelStyle(trip.travelStyle);
    setItinerary(trip.itinerary);
    setChatHistory(trip.chatHistory);
    setGeminiHistory(trip.geminiHistory);
    setHasGenerated(true);
  };

  const createNewTripForm = () => {
    setActiveTripId(null);
    setDestination("");
    setStartDate("");
    setendDate("");
    setTravelers("1 Traveler (Solo)");
    setBudget("Budget-Friendly");
    setTravelStyle("Culture & History");
    setItinerary([]);
    setChatHistory([]);
    setGeminiHistory([]);
    setHasGenerated(false);
  };

  const modifyActiveTrip = (updates) => {
    setSavedTrips(prev => prev.map(trip => 
      trip.id === activeTripId ? { ...trip, ...updates } : trip
    ));
  };

  const deleteTrip = (e, id) => {
    e.stopPropagation();
    if(window.confirm("Delete this trip history?")) {
      setSavedTrips(prev => prev.filter(t => t.id !== id));
      if (activeTripId === id) {
        createNewTripForm();
      }
    }
  };

  // -- Generation --

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) return;
    
    setIsGenerating(true);
    setHasGenerated(false);
    setChatHistory([]);
    setGeminiHistory([]);

    let currentId = activeTripId;
    if (!currentId) {
      currentId = Date.now().toString();
      setActiveTripId(currentId);
    }

    if (!genAI) {
      setTimeout(() => {
        const errItinerary = [{ dayTitle: "Error", title: "API Key Missing", description: "Please add VITE_GEMINI_API_KEY to your .env file." }];
        setItinerary(errItinerary);
        setIsGenerating(false);
        setHasGenerated(true);
      }, 1000);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are an expert travel planner for 'PackNgo'. 
        The user will provide destination, dates, traveler count, budget, and style.
        Generate a daily itinerary.
        Return strictly a JSON array of objects, where each object represents a day or an activity.
        Each object MUST have these exact string keys:
        - "dayTitle" (e.g. "Day 1: Arrival & Exploration")
        - "title" (e.g. "Settle in")
        - "description" (e.g. "Arrive at destination...")
        Do not return any markdown formatting outside of the JSON array. Only the JSON array.`,
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Plan a trip to ${destination} from ${startDate} to ${endDate} for ${travelers}. Budget is ${budget}. Travel style is ${travelStyle}.`;
      
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      const parsedItinerary = JSON.parse(responseText.trim());
      setItinerary(Array.isArray(parsedItinerary) ? parsedItinerary : [parsedItinerary]);
      
      const newGeminiHistory = [
        { role: "user", parts: [{ text: prompt }] },
        { role: "model", parts: [{ text: responseText }] }
      ];
      setGeminiHistory(newGeminiHistory);

      const newChatHistory = [
        { role: "bot", text: `Your customizable itinerary to ${destination} is ready! Let me know if you want to swap any activities or need specific recommendations.` }
      ];
      setChatHistory(newChatHistory);

      // Save or update to savedTrips array
      const tripRecord = {
        id: currentId,
        name: `${destination} (${new Date(startDate).toLocaleDateString()})`,
        destination, startDate, endDate, travelers, budget, travelStyle,
        itinerary: Array.isArray(parsedItinerary) ? parsedItinerary : [parsedItinerary],
        chatHistory: newChatHistory,
        geminiHistory: newGeminiHistory,
        hasGenerated: true
      };

      setSavedTrips(prev => {
        const exists = prev.find(t => t.id === currentId);
        if (exists) return prev.map(t => t.id === currentId ? tripRecord : t);
        return [tripRecord, ...prev];
      });

    } catch (error) {
      console.error("Gemini Generation Error:", error);
      setItinerary([{ dayTitle: "Error", title: "Generation Failed", description: error.message || String(error) }]);
    } finally {
      setIsGenerating(false);
      setHasGenerated(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !genAI || !activeTripId) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    
    const initialUserChat = [...chatHistory, { role: "user", text: userMsg }];
    setChatHistory(initialUserChat);
    setIsChatting(true);

    try {
      const chatModel = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are an expert travel planner for 'PackNgo'. You previously generated a JSON itinerary for the user. Answer their follow-up questions enthusiastically and concisely in normal text format (no JSON).`
      });

      const session = chatModel.startChat({
        history: geminiHistory
      });

      const result = await session.sendMessage(userMsg);
      const botResponse = result.response.text();

      const updatedGeminiHistory = [
        ...geminiHistory,
        { role: "user", parts: [{ text: userMsg }] },
        { role: "model", parts: [{ text: botResponse }] }
      ];
      setGeminiHistory(updatedGeminiHistory);

      const updatedChatHistory = [...initialUserChat, { role: "bot", text: botResponse }];
      setChatHistory(updatedChatHistory);

      // Persist to saved trips list
      modifyActiveTrip({
        chatHistory: updatedChatHistory,
        geminiHistory: updatedGeminiHistory
      });

    } catch (error) {
      console.error("Chat Error:", error);
      const errChatHistory = [...initialUserChat, { role: "bot", text: "Sorry, I had trouble processing that request. Please try again." }];
      setChatHistory(errChatHistory);
      modifyActiveTrip({ chatHistory: errChatHistory });
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="tp-container">
      {/* Navbar */}
      <Navbar activePage="Plan Trip" />

      {/* Hero */}
      <section className="tp-hero">
        <h1>Design Your Dream Journey</h1>
        <p>
          Tell us where you want to go and what you love to do. Our AI smart planner 
          will craft the perfect bespoke itinerary for your next adventure in seconds.
        </p>
      </section>

      {/* Main Content */}
      <main className="tp-content">
        {/* Left Panel: Form & History */}
        <div className="tp-panel tp-left-panel">
          <h2>Trip Details</h2>
          <form onSubmit={handleGenerate}>
            <div className="tp-form-group">
              <label>Destination</label>
              <input 
                type="text" 
                className="tp-input" 
                placeholder="e.g. Kyoto, Japan or Paris, France" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required 
              />
            </div>

            <div className="tp-row">
              <div className="tp-form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  className="tp-input" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required 
                />
              </div>
              <div className="tp-form-group">
                <label>End Date</label>
                <input 
                  type="date" 
                  className="tp-input" 
                  value={endDate}
                  onChange={(e) => setendDate(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="tp-row">
              <div className="tp-form-group">
                <label>Travelers</label>
                <select className="tp-input" value={travelers} onChange={(e) => setTravelers(e.target.value)}>
                  <option>1 Traveler (Solo)</option>
                  <option>2 Travelers (Couple)</option>
                  <option>3-5 Travelers (Group)</option>
                  <option>6+ Travelers (Large Group)</option>
                </select>
              </div>
              <div className="tp-form-group">
                <label>Budget</label>
                <select className="tp-input" value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option>Budget-Friendly</option>
                  <option>Moderate</option>
                  <option>Luxury</option>
                </select>
              </div>
            </div>

            <div className="tp-form-group">
              <label>Travel Style</label>
              <select className="tp-input" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
                <option>Culture & History</option>
                <option>Adventure & Nature</option>
                <option>Relaxation & Beaches</option>
                <option>Food & Culinary</option>
                <option>Nightlife & Party</option>
              </select>
            </div>

            <button type="submit" className="tp-btn" disabled={isGenerating}>
              {isGenerating ? "Crafting Itinerary..." : (activeTripId ? "Update Itinerary ✨" : "Generate Itinerary ✨")}
            </button>
          </form>

          {/* History Sidebar Section */}
          <div className="tp-history-section">
            <button className="tp-new-trip-btn" onClick={createNewTripForm}>
              + Start a New Trip
            </button>
            
            {savedTrips.length > 0 && (
              <>
                <h3 className="tp-history-title">Your Saved Trips</h3>
                <div className="tp-history-list">
                  {savedTrips.map(trip => (
                    <div 
                      key={trip.id} 
                      className={`tp-history-item ${activeTripId === trip.id ? 'active' : ''}`}
                      onClick={() => loadTrip(trip)}
                    >
                      <div className="tp-history-item-icon">✈️</div>
                      <div className="tp-history-item-text">{trip.name}</div>
                      <button className="tp-history-del-btn" onClick={(e) => deleteTrip(e, trip.id)}>×</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Itinerary/Preview */}
        <div className="tp-panel tp-right-panel">
          <h2>Suggested Itinerary</h2>
          <div className="tp-itinerary">
            {isGenerating ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#a0a0b8" }}>
                <p>Analyzing your preferences using AI...</p>
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "8px" }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2e7bff', animation: 'ping 1s infinite' }}></div>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2e7bff', animation: 'ping 1s infinite 0.2s' }}></div>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2e7bff', animation: 'ping 1s infinite 0.4s' }}></div>
                </div>
              </div>
            ) : !hasGenerated ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666677" }}>
                <p>Fill in your details and click generate to see your bespoke AI-crafted daily guide here.</p>
              </div>
            ) : (
              <>
                {itinerary.map((item, index) => (
                  <div className="tp-itinerary-item" key={index}>
                    <div className="tp-ai-sparkle">✦</div>
                    <div className="tp-itinerary-header">
                      <span className="tp-day">{item.dayTitle}</span>
                    </div>
                    <h3 className="tp-itinerary-title">{item.title}</h3>
                    <p className="tp-itinerary-desc">
                      {item.description}
                    </p>
                  </div>
                ))}

                {/* Chat Interface appended below itinerary */}
                <div className="tp-chat-section">
                  <div className="tp-chat-header">
                    <span>Ask Follow-up Questions</span>
                  </div>
                  <div className="tp-chat-messages">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`tp-chat-bubble ${msg.role}`} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                    ))}
                    {isChatting && (
                      <div className="tp-typing">Assistant is formulating a response...</div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form className="tp-chat-form" onSubmit={handleSendMessage}>
                    <input 
                      type="text" 
                      className="tp-chat-input"
                      placeholder="e.g. Any vegan spots on Day 2?"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={isChatting}
                    />
                    <button type="submit" className="tp-chat-submit" disabled={!chatInput.trim() || isChatting}>➤</button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tripplanner;
