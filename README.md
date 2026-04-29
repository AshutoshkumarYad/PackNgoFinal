# 🌍 PackNgo - Your Smart Collaborative Travel Companion

PackNgo is a modern, AI-powered travel planning and social network platform designed to revolutionize how people explore destinations, organize trips, and connect with fellow travelers. Built as a Progressive Web App (PWA), it offers a seamless experience across desktop and mobile devices.

---

## ✨ Full Feature List

### 🤖 1. AI-Powered Trip Planning (Google Gemini)
*   **Smart Itinerary Generation:** Users enter a destination, budget, trip duration, and their preferences, and the Gemini AI instantly builds a personalized day-by-day travel itinerary.
*   **Dynamic Explanations:** Real-time generation of destination details including historical significance, prime times to visit, local culinary specialties, and top attractions.

### 👥 2. Social Travel Community 
*   **Community Feed (Posts):** Users can upload images and write posts about their trips. A dynamic global feed allows travelers to connect, read reviews, and get inspired.
*   **Travel Buddy Matching Algorithm:** Travelers can click an "Open to Travel Buddy" toggle on their profile. The system queries the database and matches users who share similar destination interests, creating opportunities to connect globally.
*   **Real-time Global Chat:** Powered by Socket.io, users have access to an instant-messaging chat room to discuss live travel plans.

### 📍 3. Interactive Maps & Navigation
*   **Map Routing & Directions:** Integrated map components allow users to plot routes and get travel guidance directly within the app.
*   **Live Location Tracking:** Users can engage a live tracker interface that plots coordinates for enhanced on-the-go navigation.

### 🖼️ 4. Dynamic Visuals Engine
*   **Google Places Proxy Service:** To make itineraries vivid, the Express backend automatically fetches professional destination photos from the Google Places API based on whatever location the user generated via AI.
*   **Image Caching & Fallbacks:** Fallback logic hooks into Unsplash APIs so no destination is ever left blank.

### 🔧 5. Robust Security & User Management
*   **Authentication Engine:** Full JWT (JSON Web Token) implementation ensuring stateless, secure user sessions with encrypted passwords via `bcryptjs`.
*   **Rate-Limiting Security:** Custom backend middleware heavily restricts automated login spam and brute-force attacks to protect user data.
*   **Persistent Profiles & Saves:** Users have dedicated profiles to update avatars, manage a travel "bucket list," and save AI-generated itineraries permanently to their "My Bookings" page.

### 📱 6. Progressive Web App (PWA) Capabilities
*   **Installable App:** The webapp provides an "Install" prompt, allowing users to download PackNgo to their iPhone, Android, or Native Windows / Mac device as a standalone application.
*   **Service Worker Caching:** Key assets, fonts, and API requests are managed by a service worker cache, ensuring ultra-fast load times even on slow networks.

---

## 🛠️ Technology Stack Breakdown

This application uses the highly scalable **MERN Stack** coupled with modern tooling:

### Frontend (Client-side)
*   **Framework:** React 18
*   **Build Tool:** Vite (Ultra-fast Hot Module Replacement)
*   **Routing:** React Router DOM (v6 module system)
*   **Styling:** Custom Modular CSS with variables for rapid theming
*   **PWA:** `vite-plugin-pwa` (Workbox)
*   **Map Systems:** OpenStreetMap / Leaflet (Assuming based on routing UI)

### Backend (Server-side)
*   **Runtime:** Node.js
*   **Framework:** Express.js 5
*   **Real-Time Comms:** Socket.io
*   **Authentication:** `jsonwebtoken` (JWT)
*   **Security Addons:** `express-rate-limit`, `cors`
*   **File Uploads:** `multer` (Local temporary file streaming/uploads)
*   **API Data Calls:** `axios`

### Database
*   **Engine:** MongoDB (Document-based NoSQL)
*   **ORM / Modeler:** Mongoose 

### Third-Party Microservices
*   **Google Gemini SDK:** Directly powers the AI logic processor for planning.
*   **Google Places API:** Backstop for fetching dynamic location coordinates and photos.
*   **Unsplash CDN:** Used for layout filler graphics and fallbacks.
