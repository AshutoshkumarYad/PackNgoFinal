import React from 'react';
import { Star, MapPin, Calendar, DollarSign, Users, ChevronRight } from 'lucide-react';
import './Destinationdetail.css';

export default function MysticAlpsPage() {
  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      backgroundColor: '#0a0e1a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 80px',
        backgroundColor: 'rgba(10, 14, 26, 0.95)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>PackNgo</div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Tours</a>
          <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Destinations</a>
          <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Reviews</a>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>👤</div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        height: '500px',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 80px'
      }}>
        <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '20px', margin: '0 0 20px 0' }}>
          Mystic Alps, Switzerland
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', maxWidth: '700px' }}>
          Discover the breathtaking beauty of the Swiss Alps with guided tours through scenic trails and stunning vistas.
        </p>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} fill="#fbbf24" color="#fbbf24" />
            <span>4.8 Rating</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} />
            <span>Swiss Alps</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} />
            <span>Available Year-Round</span>
          </div>
        </div>
        <button style={{
          backgroundColor: '#7c3aed',
          color: '#fff',
          border: 'none',
          padding: '16px 40px',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Plan My Trip
        </button>
      </div>

      {/* About Section */}
      <div style={{ padding: '80px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px' }}>
          About This Destination
        </h2>
        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#cbd5e1', maxWidth: '900px' }}>
          The Swiss Alps offer an unparalleled blend of majestic landscapes, rich cultural heritage, and thrilling outdoor activities. From picturesque mountain villages to awe-inspiring peaks, this region is a haven for adventurers and nature lovers alike. Whether you're skiing down powdery slopes, hiking through alpine meadows, or simply soaking in the serene beauty, the Swiss Alps provide an unforgettable experience for visitors seeking both excitement and tranquility.
        </p>
      </div>

      {/* Safety & Budget Section */}
      <div style={{ 
        padding: '0 80px 80px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px'
      }}>
        {/* Safety */}
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '25px' }}>
            Safety & Well-being
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Overall Safety Index</div>
            <div style={{ color: '#10b981', fontSize: '18px', fontWeight: '600' }}>High (8.5/10)</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px', color: '#cbd5e1' }}>
            <div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: '#fff' }}>Solo Female Safety</div>
                <div>Very Safe (9/10)</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: '#fff' }}>Local Transportation</div>
                <div>Safe (8/10)</div>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#fff' }}>Health Resources</div>
                <div>Well-equipped local clinics & hospitals</div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: '#fff' }}>Natural Hazards</div>
                <div>Low to Moderate (Avalanches in winter)</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: '#fff' }}>Political Stability</div>
                <div>Very Stable</div>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#fff' }}>Emergency Services</div>
                <div>24/7 Accessible via 112 or 144</div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '25px' }}>
            Budget Breakdown (Daily Average)
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Accommodation</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#cbd5e1' }}>🏨 High-end Hotels</span>
              <span>$200</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#cbd5e1' }}>🏨 Mid-range Hotels - $100 - $200</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#cbd5e1' }}>🏨 Cost & Hostels - $50 (shared) - $70 (single)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#cbd5e1' }}>🍽️ Meals (budgeted) - $50 (avg) - $80 (better diet)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Attractions */}
      <div style={{ padding: '80px', backgroundColor: '#0f1420', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px' }}>
          Top Attractions
        </h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '25px'
        }}>
          {[
            { name: 'Interlaken Resort', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400' },
            { name: 'Gornergrat Railway', img: 'https://images.unsplash.com/photo-1531973486364-5fa64260d75b?w=400' },
            { name: 'Lake Brienz Cruise', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
            { name: 'Chapel Bridge', img: 'https://images.unsplash.com/photo-1527824404775-dce343118ebc?w=400' },
            { name: 'Alpine Cable Cars', img: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400' },
            { name: 'Jungfraujoch Summit', img: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400' }
          ].map((attraction, idx) => (
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
      <div style={{ padding: '80px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px' }}>
          Suggested Itineraries
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { title: '3-Day Alpine Explorer', arrow: true },
            { title: '5-Day Swiss Peak & Lakes', 
              desc: 'Day 1: Arrive in Zurich | Visit the Old Town | Afternoon: Kunsthaus Zurich museum | Evening: Stroll along Lake Zurich & dine at Zeughauskeller...',
              expanded: true 
            },
            { title: '7-Day Grand Alpine Journey', arrow: true }
          ].map((itinerary, idx) => (
            <div key={idx} style={{
              backgroundColor: '#1a1f2e',
              borderRadius: '12px',
              padding: '25px',
              cursor: 'pointer'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: itinerary.expanded ? '15px' : '0'
              }}>
                <span style={{ fontSize: '20px', fontWeight: '600' }}>{itinerary.title}</span>
                {itinerary.arrow && <ChevronRight size={24} />}
              </div>
              {itinerary.expanded && (
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                  {itinerary.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ padding: '80px', backgroundColor: '#0f1420', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px' }}>
          Solo Traveler Reviews
        </h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '25px'
        }}>
          {[
            { name: 'Alice D.', rating: 5, text: "I can't speak highly enough of my solo trip to the Swiss Alps! Everything was flawlessly arranged, from the cozy accommodations to the thrilling activities..." },
            { name: 'Marco T.', rating: 4, text: "My experience was overall great! The itinerary was comprehensive and allowed me to see both the iconic sights and hidden gems..." },
            { name: 'Emma J.', rating: 5, text: "I traveled alone for the first time and couldn't have chosen a better destination! The guides were knowledgeable..." },
            { name: 'Jake H.', rating: 5, text: "As a solo traveler, safety is always my top priority. I felt completely secure throughout my journey..." },
            { name: 'Sara K.', rating: 4, text: "Great trip overall! The Swiss Alps are stunning, and the tour was well coordinated. My only minor complaint..." },
            { name: 'Eric M.', rating: 5, text: "Exceptional experience! The Swiss Alps exceeded every expectation. The mountains, culture, and people made this..." }
          ].map((review, idx) => (
            <div key={idx} style={{
              backgroundColor: '#1a1f2e',
              borderRadius: '12px',
              padding: '25px'
            }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {review.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{review.name}</div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Gallery */}
      <div style={{ padding: '80px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px' }}>
          Photo Gallery
        </h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          gridAutoRows: '200px'
        }}>
          <div style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px'
          }} />
          <div style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px'
          }} />
          <div style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px',
            gridRow: 'span 2'
          }} />
          <div style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1531973486364-5fa64260d75b?w=400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px'
          }} />
          <div style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px'
          }} />
          <div style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px'
          }} />
        </div>
      </div>

      {/* Nearby Destinations */}
      <div style={{ padding: '80px', backgroundColor: '#0f1420', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px' }}>
          Nearby Destinations
        </h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '25px'
        }}>
          {[
            { name: 'Zermatt, Switzerland', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400' },
            { name: 'Lake Como, Italy', img: 'https://images.unsplash.com/photo-1527824404775-dce343118ebc?w=400' },
            { name: 'Chamonix, France', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
            { name: 'Bavarian Alps, Germany', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400' }
          ].map((dest, idx) => (
            <div key={idx} style={{
              height: '250px',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${dest.img})`,
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
              <span style={{ fontSize: '16px', fontWeight: '600' }}>{dest.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '40px 80px',
        borderTop: '1px solid #1a1f2e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Packtrips</div>
        <div style={{ color: '#64748b', fontSize: '14px' }}>
          © 2023 Packtrips. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}