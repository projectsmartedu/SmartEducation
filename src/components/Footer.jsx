import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">
              <span className="logo-icon">📚</span>
              Smart Education
            </h3>
            <p className="footer-description">
              Empowering students with AI-driven personalized learning experiences
              for a better future.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook" className="social-icon">
                <i className="fab fa-facebook-f"></i>📘
              </a>
              <a href="#" aria-label="Twitter" className="social-icon">
                <i className="fab fa-twitter"></i>🐦
              </a>
              <a href="#" aria-label="LinkedIn" className="social-icon">
                <i className="fab fa-linkedin-in"></i>💼
              </a>
              <a href="#" aria-label="Instagram" className="social-icon">
                <i className="fab fa-instagram"></i>📸
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/support">Support</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Smart Education Platform. All rights reserved.</p>
          <p className="footer-tagline">
            Built with ❤️ for Digital India & Atmanirbhar Bharat
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
