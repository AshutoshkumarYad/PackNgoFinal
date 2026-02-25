import React from "react";
import "./Signup.css";

export default function Signup() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="page-wrap">
      <div className="frame">
        <div className="brand">PackNGo</div>
        <div className="top-right">
          Already have an account? <a href="#">Log In</a>
        </div>

        {/* Background decorative shapes */}
        <div className="decor-circle left"></div>
        <div className="decor-circle right"></div>
        <div className="decor-rect"></div>

        <div className="card">
          <div className="card-left">
            <h1 className="title">Create an account</h1>

            <form onSubmit={handleSubmit}>
              <div className="input-wrap">
                <label>Full Name</label>
                <input type="text" />
              </div>

              <div className="input-wrap">
                <label>Email</label>
                <input type="email" placeholder="example.email@gmail.com" />
              </div>

              <div className="input-wrap">
                <div className="password-row">
                  <label>Password</label>
                  <span className="small-muted">Enter at least 8+ characters</span>
                </div>
                <input type="password" />
              </div>

              <div className="input-wrap">
                <label>Confirm Password</label>
                <input type="password" />
              </div>

              <button className="btn-primary">Sign in</button>

              <div className="or">Or sign in with</div>

              <div className="socials">
                <div className="social">G</div>
                <div className="social">f</div>
                <div className="social"></div>
              </div>

              <div className="legal">By signing up you agree to our Terms & Services.</div>
            </form>
          </div>

          <div className="card-right"></div>
        </div>
      </div>
    </div>
  );
}
