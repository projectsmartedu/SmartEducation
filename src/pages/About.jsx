import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Smart Education Platform</h1>
          <p className="about-subtitle">
            Empowering India's Future Through AI-Driven Education
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section mission-section">
        <div className="section-content">
          <div className="content-split">
            <div className="content-text">
              <h2>Our Mission</h2>
              <p>
                To revolutionize education in India by leveraging artificial
                intelligence and data analytics to create personalized learning
                experiences that adapt to each student's unique needs, pace, and
                learning style.
              </p>
              <p>
                We believe that every student deserves access to quality education
                tailored to their individual strengths and weaknesses. Our platform
                bridges the gap between traditional education and modern technology.
              </p>
            </div>
            <div className="content-visual">
              <div className="visual-card">
                <h3>🎯 Our Goal</h3>
                <p>
                  Transform 1 million students' lives by 2030 through personalized
                  AI-driven education
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-section vision-section">
        <div className="section-content">
          <h2>Our Vision</h2>
          <p className="vision-lead">
            To build a self-reliant, inclusive, and intelligent education system
            aligned with the goals of Digital India and Atmanirbhar Bharat.
          </p>
          <div className="vision-grid">
            <div className="vision-card">
              <h3>🇮🇳 Swadeshi Technology</h3>
              <p>
                Built entirely using indigenous solutions, ensuring data sovereignty
                and supporting India's tech ecosystem.
              </p>
            </div>
            <div className="vision-card">
              <h3>🌟 Inclusive Education</h3>
              <p>
                Making quality education accessible to students across all
                socio-economic backgrounds.
              </p>
            </div>
            <div className="vision-card">
              <h3>🚀 Future-Ready Skills</h3>
              <p>
                Equipping students with 21st-century skills to thrive in the global
                economy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section how-section">
        <div className="section-content">
          <h2>How It Works</h2>
          <div className="process-timeline">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Student Assessment</h3>
                <p>
                  Initial diagnostic tests evaluate student's current knowledge level,
                  learning style, and areas of interest.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Analysis</h3>
                <p>
                  Our machine learning algorithms analyze the data to create a
                  personalized learning path.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Adaptive Learning</h3>
                <p>
                  Content and difficulty levels automatically adjust based on student
                  performance in real-time.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Continuous Improvement</h3>
                <p>
                  Regular assessments and feedback loops ensure constant optimization
                  of the learning experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-section values-section">
        <div className="section-content">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">💡</div>
              <h3>Innovation</h3>
              <p>
                Continuously pushing boundaries with cutting-edge technology and
                pedagogical methods.
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">🤝</div>
              <h3>Integrity</h3>
              <p>
                Maintaining transparency and ethical practices in everything we do.
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">🌍</div>
              <h3>Inclusivity</h3>
              <p>
                Ensuring education is accessible to all, regardless of background or
                location.
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">⭐</div>
              <h3>Excellence</h3>
              <p>
                Striving for the highest quality in content, technology, and student
                outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section team-section">
        <div className="section-content">
          <h2>Built by Students, For Students</h2>
          <p className="team-description">
            This platform is a student innovation project developed with passion and
            dedication to solve real challenges in education. Our team combines
            expertise in technology, pedagogy, and user experience to create a
            platform that truly serves the needs of learners.
          </p>
          <div className="team-highlights">
            <div className="highlight-item">
              <strong>Multi-disciplinary Team</strong>
              <p>Engineers, educators, and designers working together</p>
            </div>
            <div className="highlight-item">
              <strong>Student-Centric Design</strong>
              <p>Built with continuous feedback from actual users</p>
            </div>
            <div className="highlight-item">
              <strong>Academic Excellence</strong>
              <p>Backed by research and educational best practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="about-section impact-section">
        <div className="section-content">
          <h2>Our Impact</h2>
          <div className="impact-stats">
            <div className="impact-stat">
              <div className="stat-number-large">10,000+</div>
              <div className="stat-label-large">Students Enrolled</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number-large">95%</div>
              <div className="stat-label-large">Student Satisfaction</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number-large">500+</div>
              <div className="stat-label-large">Courses Available</div>
            </div>
            <div className="impact-stat">
              <div className="stat-number-large">50+</div>
              <div className="stat-label-large">Partner Institutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Join the Education Revolution</h2>
        <p>Be part of India's journey towards world-class, personalized education</p>
        <button className="cta-btn">Start Learning Today</button>
      </section>
    </div>
  );
};

export default About;
