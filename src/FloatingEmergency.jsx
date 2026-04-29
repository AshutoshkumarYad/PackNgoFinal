import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FloatingEmergency.css';

export default function FloatingEmergency() {
  const [activeTrip, setActiveTrip] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
     return localStorage.getItem('hideEmergencyWidget') === 'true';
  });

  useEffect(() => {
    const fetchActiveTrip = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const { data } = await axios.get('/api/trips', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!data || data.length === 0) return;

        // Find if current date is within any trip's timeframe
        const today = new Date();
        // Give a generous boundary, normalize times
        today.setHours(0,0,0,0);

        for (const trip of data) {
           if (trip.emergencyContacts) {
              const start = new Date(trip.startDate);
              const end = new Date(trip.endDate);
              // Normalize times for inclusive comparison
              start.setHours(0,0,0,0);
              end.setHours(23,59,59,999);

              // Show if today is before the end date (both upcoming and currently active trips!)
              if (today <= end) {
                 setActiveTrip(trip);
                 break;
              }
           }
        }
      } catch (err) {
        console.error("Failed to fetch active trip for SOS logic", err);
      }
    };

    fetchActiveTrip();
    
    // Check again periodically
    const interval = setInterval(fetchActiveTrip, 1000 * 60 * 60);
    
    // Listen for custom events triggered by Tripplanner
    window.addEventListener('tripUpdated', fetchActiveTrip);
    
    return () => {
       clearInterval(interval);
       window.removeEventListener('tripUpdated', fetchActiveTrip);
    };
  }, []);

  if (!activeTrip || isDismissed) return null;

  return (
    <div className={`floating-emergency-wrapper ${isOpen ? 'open' : ''}`}>
      {/* Expanded Widget */}
      {isOpen && (
        <div className="fe-widget glass-panel">
          <div className="fe-header">
            <h4>🚨 Emergency • {activeTrip.destination?.split(',')[0]}</h4>
            <button className="fe-close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <div className="fe-content">
            <p className="fe-subtext">Immediate local response numbers. Tap to dial.</p>
            {activeTrip.emergencyContacts.police && (
              <a href={`tel:${activeTrip.emergencyContacts.police}`} className="fe-contact-row">
                <span className="fe-icon">🚓</span>
                <span className="fe-label">Police</span>
                <span className="fe-number">{activeTrip.emergencyContacts.police}</span>
              </a>
            )}
            {activeTrip.emergencyContacts.ambulance && (
               <a href={`tel:${activeTrip.emergencyContacts.ambulance}`} className="fe-contact-row">
                 <span className="fe-icon">🚑</span>
                 <span className="fe-label">Ambulance</span>
                 <span className="fe-number">{activeTrip.emergencyContacts.ambulance}</span>
               </a>
            )}
            {activeTrip.emergencyContacts.fire && (
               <a href={`tel:${activeTrip.emergencyContacts.fire}`} className="fe-contact-row">
                 <span className="fe-icon">🚒</span>
                 <span className="fe-label">Fire</span>
                 <span className="fe-number">{activeTrip.emergencyContacts.fire}</span>
               </a>
            )}
          </div>
          <button className="fe-dismiss-btn" onClick={() => {
             if(window.confirm("Remove this widget from the screen globally?")) {
               setIsDismissed(true);
               localStorage.setItem('hideEmergencyWidget', 'true');
             }
          }}>
            Dismiss Widget Permanently
          </button>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          className="fe-floating-btn" 
          onClick={() => setIsOpen(true)}
          title="Local Emergency Numbers"
        >
          <span className="fe-pulse"></span>
          🚨
        </button>
      )}
    </div>
  );
}
