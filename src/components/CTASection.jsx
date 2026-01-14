import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import '../styles/_cta-section.scss';
import { IoIosRocket } from 'react-icons/io';

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-card">
            {/* Background Decor */}
            <div className="glow-shape left"></div>
            <div className="glow-shape right"></div>
            
            <div className="cta-content">
                <span className="section-badge"><IoIosRocket /> Boolog Premium</span>
                <h2>Start your journey today</h2>
                <p>Unlock the full potential of your knowledge with our comprehensive blogging platform.</p>
                <Link to="/register" className="cta-btn">
                    Get Started <FiArrowRight />
                </Link>
            </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
