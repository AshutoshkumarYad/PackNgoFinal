import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityFeed.css";
import Navbar from "./Navbar";

export default function CommunityFeed() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="cf-app">
      {/* Global Navbar Header */}
      <Navbar activePage="Community" />

      {/* Sub-Navigation and Search Area */}
      <div className="cf-subnav-container">
        <nav className="cf-subnav">
          <button className="cf-nav-pill active">Stories</button>
          <button className="cf-nav-pill">Tips</button>
          <button className="cf-nav-pill">Reels</button>
          <button className="cf-nav-pill">Photos</button>
          <button className="cf-nav-pill">Questions</button>
        </nav>

        <div className="cf-search-area">
          <div className="cf-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search posts, users, locations..."
            />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <main className="cf-layout">
        {/* FEED */}
        <section className="cf-feed">
          {/* Post 1 */}
          <article className="cf-post">
            <header className="cf-post-header">
              <div className="cf-post-user">
                <div className="cf-avatar">JZ</div>
                <div>
                  <div className="cf-user-name">Journey_Explorer</div>
                  <div className="cf-user-meta">Kyoto, Japan</div>
                </div>
              </div>
              <span className="cf-tag-pill">Culture</span>
            </header>

            <div className="cf-post-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1470&auto=format&fit=crop"
                alt="bamboo forest"
              />
            </div>

            <p className="cf-post-text">
              Lost in the timeless beauty of Kyoto&apos;s bamboo forest. Every
              rustle of leaves tells a story. 🌿 #Kyoto #TravelJapan
            </p>

            <footer className="cf-post-footer">
              <div className="cf-post-action">♡ 124</div>
              <div className="cf-post-action">💬 23</div>
              <div className="cf-post-action">↻ 10</div>
            </footer>
          </article>

          {/* Post 2 */}
          <article className="cf-post">
            <header className="cf-post-header">
              <div className="cf-post-user">
                <div className="cf-avatar" style={{ background: "linear-gradient(135deg, #2e7bff, #56b1ff)"}}>WD</div>
                <div>
                  <div className="cf-user-name">Wanderlust_Diaries</div>
                  <div className="cf-user-meta">Patagonia, Chile</div>
                </div>
              </div>
              <span className="cf-tag-pill">Adventure</span>
            </header>

            <div className="cf-post-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=1470&auto=format&fit=crop"
                alt="mountains"
              />
            </div>

            <p className="cf-post-text">
              The raw, untamed wilderness of Patagonia. Hike, explore, and find
              your wild.
            </p>

            <footer className="cf-post-footer">
              <div className="cf-post-action">♡ 210</div>
              <div className="cf-post-action">💬 45</div>
              <div className="cf-post-action">↻ 22</div>
            </footer>
          </article>

          {/* Post 3 (text only) */}
          <article className="cf-post">
            <header className="cf-post-header">
              <div className="cf-post-user">
                <div className="cf-avatar" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)"}}>BB</div>
                <div>
                  <div className="cf-user-name">BudgetBackpacker</div>
                  <div className="cf-user-meta">Global</div>
                </div>
              </div>
              <span className="cf-tag-pill">Tips</span>
            </header>

            <p className="cf-post-text spaced">
              <strong>PRO TIP:</strong> Always pack a universal adapter when traveling
              internationally. Saves a lot of hassle and money!
            </p>

            <footer className="cf-post-footer">
              <div className="cf-post-action">♡ 88</div>
              <div className="cf-post-action">💬 15</div>
              <div className="cf-post-action">↻ 5</div>
            </footer>
          </article>

          {/* Post 4 */}
          <article className="cf-post">
            <header className="cf-post-header">
              <div className="cf-post-user">
                <div className="cf-avatar" style={{ background: "linear-gradient(135deg, #10b981, #34d399)"}}>CR</div>
                <div>
                  <div className="cf-user-name">CityRoamer</div>
                  <div className="cf-user-meta">New York City, USA</div>
                </div>
              </div>
              <span className="cf-tag-pill">Urban</span>
            </header>

            <div className="cf-post-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1470&auto=format&fit=crop"
                alt="street art"
              />
            </div>

            <p className="cf-post-text">
              The energy of NYC never disappoints. Action packed streets and vibrant
              culture everywhere you look.
            </p>

            <footer className="cf-post-footer">
              <div className="cf-post-action">♡ 95</div>
              <div className="cf-post-action">💬 18</div>
              <div className="cf-post-action">↻ 7</div>
            </footer>
          </article>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="cf-sidebar">
          <section className="cf-side-card">
            <h3>Top Solo Travelers</h3>
            <div className="cf-side-user">
              <div className="cf-avatar tiny">L</div>
              <div className="cf-side-user-info">
                <div className="name">Liam Adventure</div>
                <div className="meta">15,400 followers</div>
              </div>
              <button className="cf-follow-btn">Follow</button>
            </div>
            <div className="cf-side-user">
              <div className="cf-avatar tiny" style={{ background: "linear-gradient(135deg, #2e7bff, #56b1ff)"}}>S</div>
              <div className="cf-side-user-info">
                <div className="name">Sophia Wander</div>
                <div className="meta">12,800 followers</div>
              </div>
              <button className="cf-follow-btn">Follow</button>
            </div>
            <div className="cf-side-user">
              <div className="cf-avatar tiny" style={{ background: "linear-gradient(135deg, #10b981, #34d399)"}}>N</div>
              <div className="cf-side-user-info">
                <div className="name">Noah Global</div>
                <div className="meta">10,100 followers</div>
              </div>
              <button className="cf-follow-btn">Follow</button>
            </div>
            <div className="cf-side-user">
              <div className="cf-avatar tiny" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)"}}>E</div>
              <div className="cf-side-user-info">
                <div className="name">Emma Journey</div>
                <div className="meta">9,500 followers</div>
              </div>
              <button className="cf-follow-btn">Follow</button>
            </div>
          </section>

          <section className="cf-side-card">
            <h3>Trending Topics</h3>
            <ul className="cf-list">
              <li>Budget Travel</li>
              <li>Solo Backpacking</li>
              <li>Hidden Gems</li>
              <li>Digital Nomad Life</li>
              <li>Sustainable Tourism</li>
            </ul>
          </section>

          <section className="cf-side-card">
            <h3>Suggested Stories</h3>
            <ul className="cf-stories">
              <li>
                <div className="title">7-Day Itinerary for Thailand</div>
                <div className="meta">TravelGuru · Tips</div>
              </li>
              <li>
                <div className="title">Finding the Best Street Food in Rome</div>
                <div className="meta">FoodieAdventurer · Food</div>
              </li>
              <li>
                <div className="title">
                  My First Solo Trip: Fears and Triumphs
                </div>
                <div className="meta">BraveExplorer · Stories</div>
              </li>
            </ul>
          </section>
        </aside>
      </main>

      <footer className="cf-footer">
        <span>Powered by</span>
        <span className="cf-logo-dot" /> PackNgo Community
      </footer>
    </div>
  );
}