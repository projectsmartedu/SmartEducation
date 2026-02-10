import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Personalized Learning Paths',
      description:
        'Our AI analyzes your learning style, pace, and preferences to create customized learning paths that adapt in real-time to your progress.',
      benefits: [
        'Adaptive content delivery',
        'Skill-based recommendations',
        'Custom pace learning',
        'Individual progress tracking',
      ],
    },
    {
      icon: '🤖',
      title: 'AI-Powered Analytics',
      description:
        'Advanced machine learning algorithms continuously analyze your performance to identify patterns, predict challenges, and suggest improvements.',
      benefits: [
        'Predictive performance analysis',
        'Strength & weakness identification',
        'Learning pattern recognition',
        'Personalized study recommendations',
      ],
    },
    {
      icon: '📊',
      title: 'Interactive Dashboard',
      description:
        'A comprehensive visual dashboard provides real-time insights into your learning journey with detailed analytics and progress metrics.',
      benefits: [
        'Real-time progress tracking',
        'Visual performance metrics',
        'Goal setting & monitoring',
        'Achievement milestones',
      ],
    },
    {
      icon: '🎓',
      title: 'Expert-Curated Content',
      description:
        'Access high-quality educational content created by subject matter experts and industry professionals.',
      benefits: [
        'Industry-relevant curriculum',
        'Regularly updated materials',
        'Multi-format content (video, text, interactive)',
        'Practical assignments & projects',
      ],
    },
    {
      icon: '👥',
      title: 'Collaborative Learning',
      description:
        'Connect with peers, form study groups, and engage in discussions to enhance your learning through collaboration.',
      benefits: [
        'Peer-to-peer learning',
        'Discussion forums',
        'Group projects',
        'Mentor connections',
      ],
    },
    {
      icon: '🔒',
      title: 'Data Security & Privacy',
      description:
        'Built with indigenous Swadeshi technology ensuring your data remains secure and private with complete control.',
      benefits: [
        'End-to-end encryption',
        'GDPR compliant',
        'Local data storage',
        'User data ownership',
      ],
    },
    {
      icon: '📱',
      title: 'Multi-Platform Access',
      description:
        'Learn seamlessly across all your devices with our responsive design and dedicated mobile applications.',
      benefits: [
        'Cross-device synchronization',
        'Offline learning capability',
        'Mobile-first design',
        'Progressive web app',
      ],
    },
    {
      icon: '🏆',
      title: 'Gamification & Rewards',
      description:
        'Stay motivated with achievements, badges, leaderboards, and rewards as you progress through your learning journey.',
      benefits: [
        'Achievement badges',
        'Points & leaderboards',
        'Streak tracking',
        'Certificates of completion',
      ],
    },
    {
      icon: '⚡',
      title: 'Instant Doubt Resolution',
      description:
        'Get your questions answered instantly through AI-powered chatbots or connect with mentors for complex queries.',
      benefits: [
        '24/7 AI assistant',
        'Expert mentor support',
        'Community Q&A',
        'Video call sessions',
      ],
    },
    {
      icon: '📈',
      title: 'Career Guidance',
      description:
        'Receive personalized career recommendations and skill development suggestions based on industry trends and your interests.',
      benefits: [
        'Career path suggestions',
        'Skill gap analysis',
        'Industry insights',
        'Job market trends',
      ],
    },
  ];

  return (
    <div className="features-container">
      {/* Header */}
      <section className="features-header">
        <h1>Platform Features</h1>
        <p>
          Discover the powerful capabilities that make Smart Education the most
          advanced learning platform
        </p>
      </section>

      {/* Main Features Grid */}
      <section className="features-main">
        <div className="features-grid-detailed">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-detailed-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-detailed-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-benefits">
                <h4>Key Benefits:</h4>
                <ul>
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <span className="checkmark">✓</span> {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <h2>Powered by Advanced Technology</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <h3>🧠 Machine Learning</h3>
            <p>Advanced algorithms for personalized recommendations</p>
          </div>
          <div className="tech-card">
            <h3>☁️ Cloud Infrastructure</h3>
            <p>Scalable and reliable cloud-based architecture</p>
          </div>
          <div className="tech-card">
            <h3>🔐 Blockchain</h3>
            <p>Secure credential verification and certificates</p>
          </div>
          <div className="tech-card">
            <h3>📡 Real-time Sync</h3>
            <p>Instant synchronization across all devices</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="features-cta">
        <h2>Ready to Experience These Features?</h2>
        <p>Join thousands of learners transforming their education</p>
        <button className="cta-button">Start Learning Now</button>
      </section>
    </div>
  );
};

export default Features;
