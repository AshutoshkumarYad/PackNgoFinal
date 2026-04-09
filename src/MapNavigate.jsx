import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './MapNavigate.css';

export default function MapNavigate() {
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const locStr = `${lat},${lng}`;
          setUserLocation(locStr);
          setSearchQuery(locStr);
          setIsLocating(false);
        },
        (err) => {
          console.error("Location access denied", err);
          setSearchQuery('Eiffel Tower'); // Fallback
          setIsLocating(false);
        }
      );
    } else {
      setSearchQuery('Eiffel Tower');
      setIsLocating(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
    }
  };

  const locateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locStr = `${position.coords.latitude},${position.coords.longitude}`;
        setUserLocation(locStr);
        setSearchQuery(locStr);
        setInputValue("");
        setIsLocating(false);
      }, () => {
        setIsLocating(false);
        alert("Unable to fetch location. Please ensure location services are enabled.");
      });
    }
  };

  // Determine if we should show directions (saddr -> daddr) or just a pin (q=)
  const isRoutingMode = userLocation && searchQuery && userLocation !== searchQuery;
  const mapSrc = isRoutingMode 
    ? `https://maps.google.com/maps?saddr=${encodeURIComponent(userLocation)}&daddr=${encodeURIComponent(searchQuery)}&hl=en&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&hl=en&z=14&output=embed`;

  return (
    <div className="map-navigator-container">
      <Navbar activePage="Navigate" />
      
      <div className="map-overlay-search">
        <form onSubmit={handleSearch} className="map-search-form">
          <span className="map-search-icon">📍</span>
          <input
            type="text"
            placeholder="Search destination, city, or landmark to navigate..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="map-search-input"
          />
          <button type="button" onClick={locateMe} className="map-location-btn" title="Find My Location">
            🎯
          </button>
          <button type="submit" className="map-search-btn">Get Directions</button>
        </form>
      </div>

      <div className="map-canvas">
        {isLocating ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s infinite linear', marginBottom: '20px' }}></div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <h2>Acquiring GPS Signal...</h2>
          </div>
        ) : (
          <iframe
            title="Google Map Locator"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={mapSrc}
            allowFullScreen
          ></iframe>
        )}
      </div>
    </div>
  );
}
