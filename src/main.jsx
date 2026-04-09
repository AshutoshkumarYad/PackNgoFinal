import React from "react";
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker automatically
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App is ready to work offline!");
  },
})
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import Landing from "./Landing";
import Homepage from "./Homepage";
import Signup from "./Signup";
import Login from "./Login";
import Show from "./Show";
import User from "./User";
import Destinationdetail from "./Destinationdetail";
import Tripplanner from "./Tripplanner";
import CommunityFeed from "./CommunityFeed";
import Bookings from "./Bookings";
import MapNavigate from "./MapNavigate";
import LiveTrack from "./LiveTrack";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/Signup',
    element: <Signup />
  },
  {
    path: '/Login',
    element: <Login />
  },
  {
    path: '/Homepage',
    element: <Homepage />
  },
  {
    path: '/User',
    element: <User />
  },
  {
    path: '/Show',
    element: <Show />
  },
  {
    path: '/Destinationdetail',
    element: <Destinationdetail />
  },
  {
    path: '/Tripplanner',
    element: <Tripplanner />
  },
  {
    path: '/CommunityFeed',
    element: <CommunityFeed />
  },
  {
    path: '/Bookings',
    element: <Bookings />
  },
  {
    path: '/Navigate',
    element: <MapNavigate />
  },
  {
    path: '/track/:id',
    element: <LiveTrack />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
