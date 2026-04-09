import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./User.css";

export default function LiveTrack() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchLocation();
    
    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchLocation();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchLocation = async () => {
    try {
      const { data } = await axios.get(`/api/profile/track/${id}`);
      setTrackingData(data);
      if (data && data.liveLocation && data.liveLocation.lat) {
        initMap(data.liveLocation.lat, data.liveLocation.lng);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Tracking session not found or has ended.");
      } else {
        setError("Failed to fetch live location.");
      }
    }
  };

  const initMap = (lat, lng) => {
    // We update the iframe src directly to avoid total re-renders of the frame
    if (mapRef.current) {
        const newSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=es;z=14&output=embed`;
        if (mapRef.current.src !== newSrc) {
            mapRef.current.src = newSrc;
        }
    }
  };

  if (error) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Live Tracking Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', background: '#2e7bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!trackingData || !trackingData.liveLocation) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
         <div className="loading-spinner" style={{ marginBottom: '20px' }}></div>
         <h3>Establishing secure connection...</h3>
      </div>
    );
  }

  const { lat, lng, timestamp } = trackingData.liveLocation;
  const timeUpdated = new Date(timestamp).toLocaleTimeString();

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#f87171', color: '#fff', padding: '15px 20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(248,113,113,0.3)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>🚨 EMERGENCY LIVE TRACKING 🚨</h1>
        <p style={{ margin: '5px 0 0', fontSize: '14px' }}>This page automatically updates every 5 seconds</p>
      </header>

      <main style={{ flex: 1, padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src={trackingData.avatar?.startsWith('/uploads') ? `${trackingData.avatar}` : trackingData.avatar || 'https://via.placeholder.com/60'} 
              alt={trackingData.name} 
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <div>
              <h2 style={{ margin: 0, color: '#fff' }}>{trackingData.name}</h2>
              <p style={{ margin: '5px 0 0', color: '#a0a0b8' }}>is currently sharing their real-time location.</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
               <div style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                 <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                 LIVE
               </div>
               <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#888' }}>Last updated: {timeUpdated}</p>
            </div>
        </div>

        <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <iframe 
                ref={mapRef}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', background: '#2e7bff', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
               Get Directions to {trackingData.name}
            </a>
        </div>
      </main>
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
}
