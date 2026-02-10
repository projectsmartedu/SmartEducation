import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login/signup logic here
    console.log('Form submitted:', formData);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="login-branding">
            <h1>📚 Smart Education</h1>
            <p>Transform your learning journey with AI-powered education</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Personalized learning paths</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>AI-driven analytics</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Expert-curated content</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>24/7 support available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
            <p className="login-subtitle">
              {isLogin
                ? 'Login to continue your learning journey'
                : 'Start your journey to smarter education'}
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">
                    Forgot Password?
                  </a>
                </div>
              )}

              <button type="submit" className="login-btn">
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="social-login">
              <button className="social-btn google-btn">
                <span>🔍</span> Continue with Google
              </button>
              <button className="social-btn facebook-btn">
                <span>📘</span> Continue with Facebook
              </button>
            </div>

            <div className="toggle-mode">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <button onClick={toggleMode} className="toggle-btn">
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button onClick={toggleMode} className="toggle-btn">
                    Login
                  </button>
                </p>
              )}
            </div>

            <div className="login-footer">
              <p>
                By continuing, you agree to our{' '}
                <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
