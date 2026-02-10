import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  return (
    <div className="contact-container">
      {/* Header */}
      <section className="contact-header">
        <h1>Get In Touch</h1>
        <p>
          Have questions? We'd love to hear from you. Send us a message and we'll
          respond as soon as possible.
        </p>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="contact-wrapper">
          {/* Contact Info */}
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p className="contact-tagline">
              Fill out the form and our team will get back to you within 24 hours
            </p>

            <div className="info-items">
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-text">
                  <h3>Email</h3>
                  <p>support@smarteducation.in</p>
                  <p>info@smarteducation.in</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📱</div>
                <div className="info-text">
                  <h3>Phone</h3>
                  <p>+91 1800-XXX-XXXX (Toll Free)</p>
                  <p>+91 98765-43210</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📍</div>
                <div className="info-text">
                  <h3>Address</h3>
                  <p>Smart Education Campus</p>
                  <p>Tech Hub, Bangalore, India</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">🕐</div>
                <div className="info-text">
                  <h3>Working Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            <div className="social-connect">
              <h3>Connect With Us</h3>
              <div className="social-links">
                <a href="#" className="social-link">📘 Facebook</a>
                <a href="#" className="social-link">🐦 Twitter</a>
                <a href="#" className="social-link">💼 LinkedIn</a>
                <a href="#" className="social-link">📸 Instagram</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send Us a Message</h2>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
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
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                {submitted ? '✓ Message Sent!' : 'Send Message'}
              </button>

              {submitted && (
                <div className="success-message">
                  Thank you! We'll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-card">
            <h3>How do I enroll?</h3>
            <p>
              Simply sign up on our platform, choose your courses, and start
              learning immediately. No complicated procedures!
            </p>
          </div>
          <div className="faq-card">
            <h3>Is there a free trial?</h3>
            <p>
              Yes! We offer a 7-day free trial with full access to all features
              and courses.
            </p>
          </div>
          <div className="faq-card">
            <h3>Can I access on mobile?</h3>
            <p>
              Absolutely! Our platform is fully responsive and works seamlessly on
              all devices.
            </p>
          </div>
          <div className="faq-card">
            <h3>Do you offer certificates?</h3>
            <p>
              Yes, you'll receive a verified certificate upon successful
              completion of any course.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
