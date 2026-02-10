import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const metrics = [
  { label: 'Learners supported', value: '10K+' },
  { label: 'Courses & tracks', value: '750+' },
  { label: 'AI answered doubts', value: '120K+' },
  { label: 'Mentor network', value: '250+' }
];

const featureHighlights = [
  {
    icon: '🎯',
    title: 'Adaptive journeys',
    description:
      'Personalised study plans that respond to every quiz, assessment and goal you set.'
  },
  {
    icon: '🤖',
    title: 'AI doubt solver',
    description:
      'Instant, context-aware answers powered by your material and trusted references.'
  },
  {
    icon: '📊',
    title: 'Progress radar',
    description:
      'Visual dashboards that highlight strengths, risks and weekly improvements at a glance.'
  }
];

const personas = [
  {
    title: 'Students',
    description:
      'Stay on top of classes with revision playlists, goal reminders and AI-assisted notes.',
    badge: 'Most loved'
  },
  {
    title: 'Teachers',
    description:
      'Automate grading, share curated resources and monitor cohort momentum in real-time.',
    badge: 'Faculty ready'
  },
  {
    title: 'Institutions',
    description:
      'Deploy branded learning hubs with analytics, compliance tracking and secure data.'
  }
];

const testimonies = [
  {
    quote:
      'Smart Education ensures I never feel stuck. The AI mentor understands my syllabus better than any chatbot I have tried.',
    name: 'Srishti M.',
    role: 'Class 12 Aspirant'
  },
  {
    quote:
      'Weekly insight reports highlight where my students slip. It helped us increase assignment completion by 30%.',
    name: 'Vikram I.',
    role: 'Physics Faculty'
  },
  {
    quote:
      'The migration was seamless and our administrators finally have one source of truth for learner progress.',
    name: 'Chaitanya Institute',
    role: 'Academic Director'
  }
];

const brandBadges = ['Duolingo', 'Codecov', 'UserTesting', 'Magic Leap'];

const Home = () => {
  return (
    <div className="landing-container">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-label">AI-native learning cloud</div>
          <h1>
            Up-skill faster with
            <span> Smart Education</span>
          </h1>
          <p>
            A unified learning experience for students, mentors and institutions.
            Launch curated journeys, resolve doubts instantly and keep every
            learner engaged until mastery.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="action primary">
              Get started
            </Link>
            <Link to="/features" className="action secondary">
              See how it works
            </Link>
          </div>
          <div className="hero-metrics">
            {metrics.map((item) => (
              <div className="metric" key={item.label}>
                <span className="metric-value">{item.value}</span>
                <span className="metric-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-header">
              <span className="indicator live" />
              Live cohort pulse
            </div>
            <div className="visual-body">
              <div className="chart-ring">
                <div className="chart-value">92%</div>
                <span>Goal completion</span>
              </div>
              <div className="chart-list">
                <div className="chart-row">
                  <span>Weekly streak</span>
                  <strong>+18%</strong>
                </div>
                <div className="chart-row">
                  <span>Doubts resolved</span>
                  <strong>348</strong>
                </div>
                <div className="chart-row">
                  <span>Mentor feedback</span>
                  <strong>4.9 / 5</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-strip">
        <span>Trusted by forward-thinking teams</span>
        <div className="brand-logos">
          {brandBadges.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <h2>Everything learners need. Nothing they do not.</h2>
          <p>
            Build personalised roadmaps, collaborative classrooms and rich resource
            libraries in minutes. Smart Education handles the heavy lifting behind
            the scenes so you can focus on outcomes.
          </p>
        </div>
        <div className="feature-grid">
          {featureHighlights.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to="/features" className="feature-link">
                Explore feature
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="personas-section">
        <div className="section-heading">
          <h2>Built for every learning journey</h2>
          <p>
            Equip students, teachers and administrators with tailored workspaces
            that stay in sync. Switch contexts without losing progress or control.
          </p>
        </div>
        <div className="persona-grid">
          {personas.map((persona) => (
            <article className="persona-card" key={persona.title}>
              {persona.badge && <span className="persona-badge">{persona.badge}</span>}
              <h3>{persona.title}</h3>
              <p>{persona.description}</p>
              <Link to="/features" className="persona-cta">
                View tailored tools
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonial-section">
        <div className="section-heading">
          <h2>Impact you can measure</h2>
          <p>
            Teams across schools, universities and coaching centres rely on Smart
            Education to unlock new growth.
          </p>
        </div>
        <div className="testimonial-grid">
          {testimonies.map((item) => (
            <article className="testimonial-card" key={item.name}>
              <p className="quote">“{item.quote}”</p>
              <div className="author">
                <span className="name">{item.name}</span>
                <span className="role">{item.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to power your learners?</h2>
          <p>
            Launch a free pilot in minutes, invite your team and see personalised
            learning in action.
          </p>
        </div>
        <div className="cta-actions">
          <Link to="/contact" className="cta-button primary">
            Book a walkthrough
          </Link>
          <Link to="/about" className="cta-button secondary">
            Download brochure
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
