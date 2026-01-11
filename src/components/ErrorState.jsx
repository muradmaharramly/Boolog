import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import '../styles/_states.scss';

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again later.",
  onRetry 
}) => {
  return (
    <div className="error-page" style={{ minHeight: '400px' }}>
      <div className="error-card">
        <FiAlertTriangle className="error-icon" />
        <h1>{title}</h1>
        <p>{message}</p>
        
        {onRetry && (
          <div className="actions">
            <button onClick={onRetry} className="btn-primary">
              <FiRefreshCw style={{ marginRight: '0.5rem' }} /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
