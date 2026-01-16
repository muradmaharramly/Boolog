import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { BeatLoader } from 'react-spinners';
import { FiCopy, FiCheckCircle, FiLogOut, FiCalendar, FiActivity, FiMessageSquare, FiHeart, FiCamera } from 'react-icons/fi';
import { signOut, updateProfile } from '../features/auth/authSlice';
import { fetchBlogs } from '../features/blogs/blogsSlice';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import '../styles/_user-profile.scss';
import { AiOutlineLogout } from 'react-icons/ai';

const UserProfile = () => {
  const { user, profile } = useSelector((state) => state.auth);
  const { items: blogs } = useSelector((state) => state.blogs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [user, navigate, dispatch, blogs.length]);

  if (!profile) {
    return (
        <div className="loading-container" style={{height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <BeatLoader color="#58a6ff" />
        </div>
    );
  }

  // Calculate stats (Mock logic for demonstration if backend doesn't provide these)
  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'Unknown';

  // Calculate activity based on loaded blogs (client-side calculation)
  // This is a rough estimate since we only have loaded blogs
  const userComments = blogs.flatMap(b => b.comments || []).filter(c => c.user_id === user.id || c.author?.id === user.id);
  const commentsCount = userComments.length;
  // Likes count is harder as we don't usually store who liked what in a simple array on the blog object in this simple app, 
  // but let's assume we can't easily get it without a specific query. We'll skip or mock.
  const activityPoints = (commentsCount * 10) + 50; // 50 base points + 10 per comment

  const profileUrl = `${window.location.origin}/user/${profile.username}`; // Hypothetical public profile URL

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await dispatch(signOut());
    navigate('/login');
  };

  const handleAvatarClick = () => {
    setNewAvatarUrl(profile.avatar_url || '');
    setIsEditingAvatar(true);
  };

  const handleSaveAvatar = async (e) => {
    e.preventDefault();
    try {
        await dispatch(updateProfile({ 
            id: profile.id, 
            updates: { avatar_url: newAvatarUrl } 
        })).unwrap();
        toast.success('Avatar updated successfully!');
        setIsEditingAvatar(false);
    } catch (error) {
        toast.error('Failed to update avatar: ' + error);
    }
  };

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        {/* Banner */}
        <div className="profile-banner"></div>

        {/* Header with Avatar */}
        <div className="profile-header">
          <div className="avatar-wrapper" onClick={handleAvatarClick} title="Click to edit avatar">
             <Avatar 
                url={profile.avatar_url} 
                username={profile.username} 
                size="110px"
                className="profile-avatar"
              />
              <div className="avatar-hover-overlay">
                  <FiCamera size={30} />
              </div>
               <div className="avatar-edit-badge">
                   <span>Click to change</span>
               </div>
          </div>

          <div className="profile-qr">
             <div className="qr-box">
                <QRCodeCanvas 
                  value={`${window.location.origin}/user/${profile.username}`}
                  size={120}
                  level={"M"}
                  includeMargin={false}
                />
                <span className="scan-text">Scan to Share</span>
             </div>
          </div>

          <div className="user-identity">
            <h1>
              {profile.username} 
              <FiCheckCircle className="verified-badge" title="Verified User" />
            </h1>
            <p className="user-email">{profile.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="user-stats-grid">
          <div className="stat-item">
            <label><FiCalendar style={{marginRight: '5px', verticalAlign: 'text-bottom'}}/>First seen</label>
            <span>{joinDate}</span>
          </div>
          <div className="stat-item">
            <label><FiActivity style={{marginRight: '5px', verticalAlign: 'text-bottom'}}/>Activity Points</label>
            <span>{activityPoints}</span>
          </div>
          <div className="stat-item">
            <label><FiMessageSquare style={{marginRight: '5px', verticalAlign: 'text-bottom'}}/>Comments</label>
            <span>{commentsCount}</span>
          </div>
          <div className="stat-item">
            <label><FiHeart style={{marginRight: '5px', verticalAlign: 'text-bottom'}}/>Reputation</label>
            <span>Level {Math.floor(activityPoints / 100) + 1}</span>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="profile-sections">
          
          {/* Public Profile Info */}
          <div className="section-group">
            <h3>Public profile</h3>
            <div className="section-content">
              <div className="description">
                This will be displayed on your profile. Others can scan your QR code to find you.
                <button className="view-profile-btn" onClick={() => navigate(`/user/${profile.username}`)}>View Public Profile</button>
              </div>
              <div className="fields">
                <div className="input-group">
                    <label>Username</label>
                    <input type="text" value={profile.username} readOnly />
                </div>
                <div className="input-group">
                    <label>Profile Link</label>
                    <div className="input-with-copy">
                        <input type="text" value={profileUrl} readOnly />
                        <button onClick={handleCopyLink} title="Copy Link">
                            {copied ? <FiCheckCircle color="#10B981"/> : <FiCopy />}
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="logout-section">
            <div className="logout-info">
              <h4>Log out of this session</h4>
              <p>Log out of your active session on this device.</p>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
                               Logout<AiOutlineLogout />
                            </button>
          </div>

        </div>
      </div>
      
      {/* Avatar Update Modal */}
      <Modal
        isOpen={isEditingAvatar}
        onClose={() => setIsEditingAvatar(false)}
        title="Update Avatar"
      >
        <form onSubmit={handleSaveAvatar} className="avatar-update-form">
            <div className="form-group">
                <label>Avatar URL</label>
                <input 
                    type="text" 
                    value={newAvatarUrl} 
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    autoFocus
                />
                <small style={{color: 'var(--text-sub)', fontSize: '0.8rem'}}>
                    Paste a direct link to an image (JPG, PNG, GIF)
                </small>
            </div>
            <div className="modal-actions">
                <button type="button" onClick={() => setIsEditingAvatar(false)} className="btn-cancel">
                    Cancel
                </button>
                <button type="submit" className="btn-save">
                    Update Avatar
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserProfile;
