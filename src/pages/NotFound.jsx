import React from 'react';
import { Link } from 'react-router-dom';
import { FiCompass, FiArrowLeft, FiHome } from 'react-icons/fi';
import '../styles/_states.scss';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="error-card">
        <FiCompass className="error-icon" />
        <h1>404</h1>
        <h3>Page Not Found</h3>
        <p>The page you are looking for doesn't exist or has been moved. Let's get you back on track.</p>
        
        <div className="actions">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <FiArrowLeft style={{ marginRight: '0.5rem' }} /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <FiHome style={{ marginRight: '0.5rem' }} /> Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
