import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from '../features/auth/authSlice';
import { fetchBlogs } from '../features/blogs/blogsSlice';
import { FiCpu, FiMenu, FiX, FiSearch, FiSun, FiMoon } from 'react-icons/fi';
import Avatar from './Avatar';
import '../styles/_header.scss';

const Header = () => {
  const { user, profile } = useSelector((state) => state.auth);
  const { items: blogs } = useSelector((state) => state.blogs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [dispatch, blogs.length]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      const results = blogs.filter(blog => 
        blog.title.toLowerCase().includes(lowerQuery) || 
        blog.content.toLowerCase().includes(lowerQuery) ||
        (blog.categories && blog.categories.name && blog.categories.name.toLowerCase().includes(lowerQuery))
      ).slice(0, 5); // Limit to 5 results
      setFilteredBlogs(results);
      setShowResults(true);
    } else {
      setFilteredBlogs([]);
      setShowResults(false);
    }
  }, [searchQuery, blogs]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(signOut());
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchResultClick = (blogId) => {
    navigate(`/blog/${blogId}`);
    setSearchQuery('');
    setShowResults(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <FiCpu /> Boolog
        </Link>
        
        {/* Search Bar */}
        <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search blogs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowResults(true)}
                    className="search-input"
                />
            </div>
            
            {showResults && searchQuery.trim() && (
                <div className="search-results-panel">
                    {filteredBlogs.length > 0 ? (
                        filteredBlogs.map(blog => (
                            <div 
                                key={blog.id} 
                                className="search-result-item"
                                onClick={() => handleSearchResultClick(blog.id)}
                            >
                                <div className="result-content">
                                    <h4>{blog.title}</h4>
                                    <span className="result-category">{blog.categories?.name}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            No blogs found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            )}
        </div>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/blogs" onClick={() => setIsMenuOpen(false)}>Blogs</Link>
          {user ? (
            <>
              {profile?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <span className="user-welcome">Welcome, {profile?.username || user.email}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
