import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";

import Landing from "./Landing";
import Homepage from "./Homepage";
import Signup from "./Signup";
import Show from "./Show";
import User from "./User";
import Destinationdetail from "./Destinationdetail";

const router=createBrowserRouter([
  {
    path:'/',
    element:<Landing/>
  },
  {
    path:'/Signup',
    element:<Signup/>
  },
  {
    path:'/Homepage',
    element:<Homepage/>
  },
  {
    path:'/User',
    element:<User/>
  },
  {
    path:'/Show',
    element:<Show/>
  },
  {
    path:'/Destinationdetail',
    element:<Destinationdetail/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
