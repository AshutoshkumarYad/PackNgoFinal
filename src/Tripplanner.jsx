import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
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
  const [expenses, setExpenses] = useState([]);
  
  // View states & widgets
  const [viewMode, setViewMode] = useState("itinerary"); // itinerary, budget, converter
  
  // Currency Converter states
  const [exchangeRates, setExchangeRates] = useState({});
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertAmount, setConvertAmount] = useState(1);
  const [convertedResult, setConvertedResult] = useState(null);
  
  // Chat input
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  const getUserToken = () => {
    const userStr = localStorage.getItem("packngo_user");
    return userStr ? JSON.parse(userStr).token : null;
  };

  const saveTripToDB = async (tripData) => {
    const token = getUserToken();
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post("/api/trips", tripData, config);
    } catch (e) {
      console.error("Failed to save trip", e);
    }
  };

  // 1. Load from DB on initial mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTrips = async () => {
      const token = getUserToken();
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/trips", config);
        // Map backend _id to id for local consistency if needed
        const mappedData = data.map(t => ({ ...t, id: t._id || t.id }));
        setSavedTrips(mappedData);
        if (mappedData.length > 0) {
          loadTrip(mappedData[0]);
        }
      } catch (e) {
        console.error("Failed to fetch saved trips");
      }
    };
    fetchTrips();

    // Fetch currency rates
    const fetchRates = async () => {
      try {
        const res = await axios.get("https://open.er-api.com/v6/latest/USD");
        setExchangeRates(res.data.rates || {});
      } catch (e) {
        console.error("Failed to load exchange rates");
      }
    };
    fetchRates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setItinerary(trip.itinerary || []);
    setChatHistory(trip.chatHistory || []);
    setGeminiHistory(trip.geminiHistory || []);
    setExpenses(trip.expenses || []);
    setHasGenerated(true);
    setViewMode("itinerary");
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
    setExpenses([]);
    setHasGenerated(false);
    setViewMode("itinerary");
  };

  const modifyActiveTrip = (updates) => {
    setSavedTrips(prev => {
      const updatedArray = prev.map(trip => 
        trip.id === activeTripId ? { ...trip, ...updates } : trip
      );
      const activeObj = updatedArray.find(t => t.id === activeTripId);
      if (activeObj) saveTripToDB(activeObj);
      return updatedArray;
    });
  };

  const deleteTrip = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Delete this trip history?")) {
      setSavedTrips(prev => prev.filter(t => t.id !== id));
      if (activeTripId === id) {
        createNewTripForm();
      }
      
      const token = getUserToken();
      if (token) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`/api/trips/${id}`, config);
        } catch(err) {
          console.error("Failed to delete trip from DB");
        }
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
        model: "gemini-flash-latest",
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
        expenses: [],
        hasGenerated: true
      };

      saveTripToDB(tripRecord);

      setSavedTrips(prev => {
        const exists = prev.find(t => t.id === currentId);
        if (exists) return prev.map(t => t.id === currentId ? tripRecord : t);
        return [tripRecord, ...prev];
      });

    } catch (error) {
      console.error("Gemini Generation Error:", error);
      // Fallback elegant mock dataset if the user's API Key gets disabled or restricted
      const fallbackItinerary = [
         { dayTitle: "Day 1: Arrival & Exploration", title: `Welcome to ${destination}`, description: `Arrive and settle into your accommodations. Explore the local neighborhood and grab a casual dinner enjoying the regional cuisine.` },
         { dayTitle: "Day 2: City Highlights", title: "Immersive Tours", description: `Spend the morning touring iconic landmarks. In the afternoon, dive into the local ${travelStyle.toLowerCase()} scene.` },
         { dayTitle: "Day 3: Scenic Views & Departure", title: "Farewell", description: `Enjoy a relaxed morning at a local cafe reflecting on your trip. Pack up and prepare for departure.` }
      ];
      setItinerary(fallbackItinerary);
      
      const newChatHistory = [
        { role: "bot", text: `(Offline Mode Active: Your Google API key was rejected. Displaying a generic sample itinerary for ${destination} so you can continue testing the UI.)` }
      ];
      setChatHistory(newChatHistory);
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
        model: "gemini-flash-latest",
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
      const errChatHistory = [...initialUserChat, { role: "bot", text: "(Offline Mode active: I cannot answer follow-up questions right now because the Google Gemini API is rejecting the active Key. Please check your developer console.)" }];
      setChatHistory(errChatHistory);
      modifyActiveTrip({ chatHistory: errChatHistory });
    } finally {
      setIsChatting(false);
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = Number(fd.get("amount"));
    const desc = fd.get("description");
    const category = fd.get("category");
    if (!amount || !desc) return;
    
    const newExpense = { 
      id: Date.now().toString(), 
      amount, 
      description: desc, 
      category, 
      date: new Date().toISOString() 
    };
    
    const newExpenses = [newExpense, ...(expenses || [])];
    setExpenses(newExpenses);
    modifyActiveTrip({ expenses: newExpenses });
    e.target.reset();
  };

  const handleDeleteExpense = (expenseId) => {
    const newExpenses = expenses.filter(ex => ex.id !== expenseId);
    setExpenses(newExpenses);
    modifyActiveTrip({ expenses: newExpenses });
  };

  const handleConvert = (e) => {
    e.preventDefault();
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return;
    
    // Convert to USD first (base), then to target
    const inUSD = convertAmount / exchangeRates[fromCurrency];
    const result = inUSD * exchangeRates[toCurrency];
    setConvertedResult(result.toFixed(2));
  };

  // Helper to determine budget amount
  const getBudgetLimit = () => {
    if (budget === "Budget-Friendly") return 50;
    if (budget === "Moderate") return 150;
    if (budget === "Luxury") return 500;
    return 100;
  };
  
  const tripDays = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))) : 1;
  const totalBudget = getBudgetLimit() * tripDays;
  const totalSpent = (expenses || []).reduce((sum, ex) => sum + Number(ex.amount), 0);
  const spentPercent = Math.min(100, (totalSpent / totalBudget) * 100);

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

        {/* Right Panel: Content Area */}
        <div className="tp-panel tp-right-panel">
          <div className="tp-right-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>{viewMode === 'itinerary' ? 'Suggested Itinerary' : viewMode === 'budget' ? 'Budget & Expenses' : 'Currency Converter'}</h2>
            {hasGenerated && (
              <div className="tp-view-toggles" style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setViewMode('itinerary')} className={`tp-toggle-btn ${viewMode === 'itinerary' ? 'active' : ''}`} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'itinerary' ? '#2e7bff' : '#2a2f3e', color: '#fff', cursor: 'pointer' }}>Itinerary</button>
                <button onClick={() => setViewMode('budget')} className={`tp-toggle-btn ${viewMode === 'budget' ? 'active' : ''}`} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'budget' ? '#2e7bff' : '#2a2f3e', color: '#fff', cursor: 'pointer' }}>Budget</button>
                <button onClick={() => setViewMode('converter')} className={`tp-toggle-btn ${viewMode === 'converter' ? 'active' : ''}`} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'converter' ? '#2e7bff' : '#2a2f3e', color: '#fff', cursor: 'pointer' }}>Currency</button>
              </div>
            )}
          </div>
          
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
                {/* ITINERARY VIEW */}
                {viewMode === 'itinerary' && (
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

                {/* BUDGET VIEW */}
                {viewMode === 'budget' && (
                  <div className="tp-budget-section" style={{ color: '#fff' }}>
                    
                    <div className="tp-budget-summary" style={{ background: '#1a1f2e', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Total Spent: <strong style={{color: '#fff', fontSize: '20px'}}>${totalSpent.toFixed(2)}</strong></span>
                        <span>Estimated Budget: <span style={{color: '#a0a0b8'}}>${totalBudget}</span> ({tripDays} days)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: spentPercent > 90 ? '#ef4444' : spentPercent > 70 ? '#f59e0b' : '#10b981', width: `${spentPercent}%`, transition: 'width 0.3s' }}></div>
                      </div>
                    </div>

                    <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#1a1f2e', padding: '20px', borderRadius: '12px' }}>
                      <input type="number" name="amount" placeholder="Amount ($)" required style={{ flex: '0 0 100px', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#0a0e1a', color: '#fff' }} />
                      <input type="text" name="description" placeholder="What did you buy?" required style={{ flex: '1', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#0a0e1a', color: '#fff' }} />
                      <select name="category" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#0a0e1a', color: '#fff' }}>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Activity">Activity</option>
                        <option value="Accommodation">Accommodation</option>
                        <option value="Other">Other</option>
                      </select>
                      <button type="submit" style={{ padding: '10px 20px', background: '#2e7bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
                    </form>

                    <div className="tp-expenses-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {expenses.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>No expenses logged yet.</div>
                      ) : (
                        expenses.map(ex => (
                          <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1f2e', padding: '15px 20px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '600' }}>{ex.description}</span>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>{ex.category} • {new Date(ex.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>${Number(ex.amount).toFixed(2)}</span>
                              <button onClick={() => handleDeleteExpense(ex.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer' }}>×</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* CURRENCY CONVERTER VIEW */}
                {viewMode === 'converter' && (
                  <div className="tp-currency-section" style={{ background: '#1a1f2e', padding: '30px', borderRadius: '12px', color: '#fff' }}>
                    <h3 style={{ marginBottom: '20px' }}>Real-time Exchange Rate</h3>
                    <form onSubmit={handleConvert} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <input type="number" value={convertAmount} onChange={e => setConvertAmount(e.target.value)} required style={{ flex: '1', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #374151', background: '#0a0e1a', color: '#fff' }} />
                        
                        <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} style={{ width: '100px', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #374151', background: '#0a0e1a', color: '#fff' }}>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                          <option value="INR">INR</option>
                          <option value="AUD">AUD</option>
                          <option value="CAD">CAD</option>
                        </select>
                      </div>
                      
                      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '20px' }}>⬇</div>
                      
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                         <div style={{ flex: '1', padding: '12px', fontSize: '18px', fontWeight: 'bold', background: '#0a0e1a', borderRadius: '6px', border: '1px solid #374151', minHeight: '48px', display: 'flex', alignItems: 'center' }}>
                           {convertedResult !== null ? convertedResult : '---'}
                         </div>
                        
                        <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} style={{ width: '100px', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #374151', background: '#0a0e1a', color: '#fff' }}>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                          <option value="INR">INR</option>
                          <option value="AUD">AUD</option>
                          <option value="CAD">CAD</option>
                        </select>
                      </div>

                      <button type="submit" style={{ padding: '15px', fontSize: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                        Convert Currency
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tripplanner;
