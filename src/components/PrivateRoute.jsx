import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
        <div className="loading-container">
            <BeatLoader color="#58a6ff" />
        </div>
    );
  }

  if (!user) {
    // Redirect to Login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
