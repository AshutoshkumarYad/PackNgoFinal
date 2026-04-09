import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Signup.css"; // Reuse Signup.css for shared styles

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("packngo_user", JSON.stringify(data));
      navigate("/Homepage");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="page-wrap">
      <div className="frame">
        <div className="brand">
          <img src="/logo.png" alt="PackNgo" />
        </div>
        <div className="top-right">
          Don't have an account? <Link to="/Signup">Sign Up</Link>
        </div>


        <div className="card">
          <div className="card-left">
            <h1 className="title">Welcome Back</h1>

            <form onSubmit={handleSubmit}>
              {error && <div style={{ color: "red", fontSize: "14px", marginBottom: "14px" }}>{error}</div>}
              <div className="input-wrap">
                <label>Email</label>
                <input type="email" placeholder="example.email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="input-wrap">
                <div className="password-row">
                  <label>Password</label>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <button className="btn-primary" type="submit">Log in</button>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
}
