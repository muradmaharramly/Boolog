import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogs } from '../features/blogs/blogsSlice';
import { FiSearch, FiFilter, FiMail, FiCalendar, FiUser, FiMoreHorizontal, FiChevronDown, FiCheckCircle, FiShare2, FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import Avatar from '../components/Avatar';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/_users.scss';
import { RiEye2Line } from 'react-icons/ri';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('new'); // 'new', 'old', 'popular'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [activeQrUserId, setActiveQrUserId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: blogs } = useSelector((state) => state.blogs);

  useEffect(() => {
    fetchUsers();
    if (blogs.length === 0) {
      dispatch(fetchBlogs());
    }

    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Simple fetch without complex joins to ensure stability
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Transform data
      // We'll calculate points dynamically using Redux data, but set basic structure here
      const transformedUsers = data.map(user => ({
          ...user,
          points: 50 // Base points, will be overridden by real calculation
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real points based on blogs/comments
  const usersWithPoints = useMemo(() => {
    return users.map(user => {
      // Logic from PublicProfile.jsx
      const commentsCount = blogs.flatMap(b => b.comments || []).filter(c => c.user_id === user.id).length;
      const points = (commentsCount * 10) + 50;
      return { ...user, points };
    });
  }, [users, blogs]);

  // Filter and Sort Logic
  const filteredUsers = usersWithPoints
    .filter(user => {
      const query = searchQuery.toLowerCase();
      return (
        (user.username || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (filterType === 'new') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (filterType === 'old') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (filterType === 'popular') {
        return b.points - a.points;
      }
      return 0;
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getFilterLabel = (type) => {
    switch (type) {
      case 'new': return 'Newest Members';
      case 'old': return 'Oldest Members';
      case 'popular': return 'Most Popular';
      default: return 'Newest Members';
    }
  };

  const handleFilterSelect = (type) => {
    setFilterType(type);
    setIsFilterDropdownOpen(false);
  };

  const handleCopyLink = (username) => {
    const url = `${window.location.origin}/user/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedId(username);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="users-page">
      <div className="container">
        {/* Header Section */}
        <div className="users-header">
          <div className="header-text">
          <span className="users-badge"><RiEye2Line />Look at others</span>
            <h1>Discover <span className="highlight">People</span></h1>
            <p>Connect with authors, developers, and tech enthusiasts from around the world.</p>
          </div>
          
          <div className="controls">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="select-wrapper" ref={filterDropdownRef}>
              <div 
                className={`custom-select-trigger ${isFilterDropdownOpen ? 'open' : ''}`} 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              >
                <FiFilter className="select-icon" />
                <span>{getFilterLabel(filterType)}</span>
                <FiChevronDown className="chevron-icon" />
              </div>
              
              {isFilterDropdownOpen && (
                <div className="custom-select-options">
                  <div 
                    className={`option ${filterType === 'new' ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('new')}
                  >
                    Newest Members
                  </div>
                  <div 
                    className={`option ${filterType === 'old' ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('old')}
                  >
                    Oldest Members
                  </div>
                  <div 
                    className={`option ${filterType === 'popular' ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('popular')}
                  >
                    Most Popular
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid Section */}
        {loading ? (
          <LoadingScreen message="Loading community..." />
        ) : (
          <div className="users-grid">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isQrActive = activeQrUserId === user.id;
                
                return (
                <div 
                  key={user.id} 
                  className={`user-card ${isQrActive ? 'qr-active' : ''}`} 
                  onClick={() => !isQrActive && navigate(`/user/${user.username}`)}
                  style={{ cursor: isQrActive ? 'default' : 'pointer' }}
                >
                  <div className="card-header-actions">
                    <button 
                      className="more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQrUserId(isQrActive ? null : user.id);
                      }}
                      title={isQrActive ? "Close" : "Share Profile"}
                    >
                      {isQrActive ? <FiX /> : <FiShare2 />}
                    </button>
                  </div>
                  
                  <div className="user-main-info">
                    <div className="avatar-container">
                        <Avatar 
                            url={user.avatar_url} 
                            username={user.username} 
                            size="80px" 
                            className="user-avatar"
                        />
                        <span className={`status-dot ${Math.random() > 0.3 ? 'online' : 'offline'}`}></span>
                    </div>
                    
                    <span className="user-name">
                        {user.username}
                        <FiCheckCircle style={{ marginLeft: '6px', color: 'var(--accent)', fontSize: '0.9em' }} />
                    </span>
                    <span className="user-role">{user.role || 'Member'}</span>
                  </div>

                  <div className="user-details-grid">
                    <div className="detail-item">
                        <span className="label">Reputation</span>
                        <span className="value">Level {Math.floor(user.points / 100) + 1}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Joined Date</span>
                        <span className="value">{formatDate(user.created_at)}</span>
                    </div>
                  </div>

                  <div className="contact-info">
                    <div className="contact-row">
                        <FiMail />
                        <span>{user.email || 'No email provided'}</span>
                    </div>
                    <div className="contact-row">
                        <FiUser />
                        <span>{user.points} Activity Points</span>
                    </div>
                  </div>

                  {isQrActive && (
                    <div className="qr-overlay" onClick={(e) => e.stopPropagation()}>
                        <div className="qr-box">
                            <QRCodeCanvas 
                                value={`${window.location.origin}/user/${user.username}`}
                                size={140}
                                level={"M"}
                                includeMargin={true}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                            />
                            <span className="scan-text">Scan to View Profile</span>
                            
                            <div className="qr-link-section">
                                <div className="link-text">
                                    {`${window.location.origin}/user/${user.username}`}
                                </div>
                                <button 
                                    className="copy-btn"
                                    onClick={() => handleCopyLink(user.username)}
                                    title="Copy Link"
                                >
                                    {copiedId === user.username ? <FiCheck /> : <FiCopy />}
                                </button>
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              );
             })
            ) : (
              <div className="no-results">
                <h3>No users found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
