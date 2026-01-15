import React from 'react';
import { FiUsers, FiTarget, FiGlobe, FiGithub, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';
import '../styles/_about.scss';
import { BsStars } from 'react-icons/bs';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <span className="section-badge"><BsStars /> About the Boolog</span>
          <h1>Empowering the Developer <span className="highlight">Community</span></h1>
          <p>Boolog is more than just a blog—it's a hub for knowledge, collaboration, and growth.</p>
        </div>
      </section>

      <div className="about-content">
        {/* Mission Section */}
        <section className="mission-section">
          <div className="mission-card">
            <div className="glow-shape left"></div>
            <div className="glow-shape right"></div>
            <div className="icon-box">
              <FiTarget />
            </div>
            <h2>Our Mission</h2>
            <p>
              At Boolog, our mission is to democratize technical knowledge. We believe that everyone, from self-taught beginners to senior architects, deserves a high-quality platform to share their insights and learn from others.
            </p>
            <p>
              We are building a space where complex ideas are broken down into accessible guides, where questions are encouraged, and where the next generation of developers can find their footing.
            </p>
          </div>

          <div className="mission-stats">
            <div className="stat-item">
              <div className="glow-shape left"></div>
              <div className="glow-shape right"></div>
              <FiUsers className="stat-icon" />
              <h3>Community Driven</h3>
              <p>Powered by thousands of developers sharing their expertise.</p>
            </div>
            <div className="stat-item">
              <div className="glow-shape left"></div>
              <div className="glow-shape right"></div>
              <FiGlobe className="stat-icon" />
              <h3>Global Impact</h3>
              <p>Connecting minds from every corner of the world.</p>
            </div>
            <div className="stat-item">
              <div className="glow-shape left"></div>
              <div className="glow-shape right"></div>
              <FiGithub className="stat-icon" />
              <h3>Open & Transparent</h3>
              <p>Built on the principles of open source and collaboration.</p>
            </div>
          </div>
        </section>

        {/* Vision / Values Section */}
        <section className="values-section">
          <h2>Why Boolog?</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="glow-shape left"></div>
              <div className="glow-shape right"></div>
              <div className="value-icon"><FiMessageSquare /></div>
              <h3>Meaningful Discussions</h3>
              <p>Move beyond simple comments. Engage in deep technical discussions, code reviews, and architectural debates that foster real learning.</p>
            </div>
            <div className="value-card">
              <div className="glow-shape left"></div>
              <div className="glow-shape right"></div>
              <div className="value-icon"><FiTrendingUp /></div>
              <h3>Continuous Growth</h3>
              <p>Technology never stops evolving, and neither do we. Boolog is designed to keep you ahead of the curve with the latest trends and best practices.</p>
            </div>
            <div className="value-card">
              <div className="glow-shape left"></div>
              <div className="glow-shape right"></div>
              <div className="value-icon"><FiUsers /></div>
              <h3>Mentorship</h3>
              <p>Find mentors, guide peers, and build lasting professional relationships that extend beyond the screen.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
