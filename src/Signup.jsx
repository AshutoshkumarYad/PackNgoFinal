import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.post("/api/auth/register", { name, email, password });
      localStorage.setItem("packngo_user", JSON.stringify(data));
      navigate("/Homepage");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account. Try again.");
    }
  };

  return (
    <div className="page-wrap">
      <div className="frame">
        <div className="brand">
          <img src="/logo.png" alt="PackNgo" />
        </div>
        <div className="top-right">
          Already have an account? <Link to="/Login">Log In</Link>
        </div>


        <div className="card">
          <div className="card-left">
            <h1 className="title">Create an account</h1>

            <form onSubmit={handleSubmit}>
              {error && <div style={{ color: "red", fontSize: "14px", marginBottom: "14px" }}>{error}</div>}
              <div className="input-wrap">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="input-wrap">
                <label>Email</label>
                <input type="email" placeholder="example.email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="input-wrap">
                <div className="password-row">
                  <label>Password</label>
                  <span className="small-muted">Enter at least 8+ characters</span>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div className="input-wrap">
                <label>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              <button className="btn-primary" type="submit">Sign Up</button>

              <div className="legal">By signing up you agree to our Terms & Services.</div>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
}
