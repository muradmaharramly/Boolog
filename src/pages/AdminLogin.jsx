import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, clearError } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { BeatLoader } from 'react-spinners';
import { FiShield, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import '../styles/_auth.scss';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    if (isAuthenticated && user) {
       if (adminEmail && user.email !== adminEmail) {
           toast.error('You are logged in but not authorized as admin.');
       } else {
           const from = location.state?.from?.pathname || '/admin';
           navigate(from, { replace: true });
       }
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, navigate, dispatch, user, adminEmail, location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signIn(formData));
  };

  return (
    <div className="auth-container">
      <div className="auth-card admin-login-card">
        <div className="admin-badge">
            <div className="badge-icon">
                <FiShield />
            </div>
        </div>
        <h2>Admin Portal</h2>
        <p className="admin-subtitle">
          Restricted access. Authorized personnel only.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="admin@boolog.com"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <BeatLoader size={8} color="#ffffff" /> : (
                <span>
                  Access Dashboard <FiArrowRight />
                </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
