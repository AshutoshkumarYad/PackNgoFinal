import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

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
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
