import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLoginRaw from 'react-facebook-login/dist/facebook-login-render-props';
const FacebookLogin = FacebookLoginRaw.default || FacebookLoginRaw;
import "./Signup.css"; // Reuse Signup.css for shared styles

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login logic, then redirect
    navigate("/Homepage");
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Google login successful:', codeResponse);
      navigate("/Homepage");
    },
    onError: (error) => console.log('Google Login Failed:', error)
  });

  const responseFacebook = (response) => {
    console.log('Facebook login response:', response);
    if(response.accessToken) {
      navigate("/Homepage");
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
              <div className="input-wrap">
                <label>Email</label>
                <input type="email" placeholder="example.email@gmail.com" required />
              </div>

              <div className="input-wrap">
                <div className="password-row">
                  <label>Password</label>
                </div>
                <input type="password" required />
              </div>

              <button className="btn-primary" type="submit">Log in</button>

              <div className="or">Or log in with</div>

              <div className="socials">
                <button type="button" className="social" onClick={() => loginWithGoogle()}>G</button>
                <FacebookLogin
                  appId={import.meta.env.VITE_FACEBOOK_APP_ID || "123456789"}
                  autoLoad={false}
                  callback={responseFacebook}
                  render={renderProps => (
                    <button type="button" className="social" onClick={renderProps.onClick}>f</button>
                  )}
                />
                <button type="button" className="social" onClick={() => navigate("/Homepage")}></button>
              </div>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
}
