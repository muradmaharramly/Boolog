import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  if (loading) {
    return (
        <div className="loading-container">
            <BeatLoader color="#58a6ff" />
        </div>
    );
  }

  if (!user) {
    // Redirect to Admin Login if trying to access admin route
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Simple Admin Check by Email
  if (adminEmail && user.email !== adminEmail) {
    return (
        <div className="app-container access-denied">
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>
        </div>
    );
  }

  return children;
};

export default ProtectedRoute;
