import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from '../features/auth/authSlice';
import { fetchBlogs } from '../features/blogs/blogsSlice';
import { FiMenu, FiX, FiSearch, FiSun, FiMoon, FiUser } from 'react-icons/fi';
import Avatar from './Avatar';
import '../styles/_header.scss';
import { AiOutlineLogout } from 'react-icons/ai';
import logoImg from '../assets/images/boolog-logo.png';

const Header = () => {
  const { user, profile } = useSelector((state) => state.auth);
  const { items: blogs } = useSelector((state) => state.blogs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const searchRef = useRef(null);

  // Theme Logic
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fetch Blogs for Search
  useEffect(() => {
    if (blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [dispatch, blogs.length]);

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      const results = blogs.filter(blog => 
        blog.title.toLowerCase().includes(lowerQuery) || 
        blog.content.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      setFilteredBlogs(results);
      setShowResults(true);
    } else {
      setFilteredBlogs([]);
      setShowResults(false);
    }
  }, [searchQuery, blogs]);

  // Click Outside Search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(signOut());
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleSearchResultClick = (blogId) => {
    navigate(`/blog/${blogId}`);
    setSearchQuery('');
    setShowResults(false);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
            <img src={logoImg} alt="Boolog" />
            <span>Boolog</span>
          </Link>

          {/* Desktop Search */}
          <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowResults(true)}
              />
            </div>

            {showResults && (
              <div className="search-results">
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map(blog => (
                    <div 
                      key={blog.id} 
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(blog.id)}
                    >
                      <h4>{blog.title}</h4>
                      <p>{blog.content.substring(0, 50)}...</p>
                    </div>
                  ))
                ) : (
                  <div className="search-result-item">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/blogs" className={`nav-link ${location.pathname === '/blogs' ? 'active' : ''}`}>Blogs</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            
            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="logged-in-actions">
                <button className="logout-btn-desktop" onClick={handleLogout} title="Logout">
                   Logout<AiOutlineLogout />
                </button>
                <div 
                  className="user-menu" 
                  onClick={() => profile?.role === 'admin' ? navigate('/admin') : navigate('/profile')} 
                  title={profile?.role === 'admin' ? "Dashboard" : "Profile"}
                >
                  <Avatar 
                    url={profile?.avatar_url} 
                    username={profile?.username} 
                    size="36px"
                  />
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">Log In</Link>
                <Link to="/register" className="btn-register">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/blogs" className="nav-link" onClick={() => setIsMenuOpen(false)}>Blogs</Link>
        <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</Link>
        {user ? (
           <>
             <Link 
               to={profile?.role === 'admin' ? "/admin" : "/profile"} 
               className="nav-link" 
               onClick={() => setIsMenuOpen(false)}
             >
               {profile?.role === 'admin' ? "Dashboard" : "Profile"}
             </Link>
             <button className="mobile-logout-btn" onClick={handleLogout}>
               Logout <AiOutlineLogout />
             </button>
           </>
        ) : (
           <div className="mobile-auth-buttons">
             <Link to="/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
             <Link to="/register" className="btn-register" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
           </div>
        )}
      </div>
    </>
  );
};

export default Header;
