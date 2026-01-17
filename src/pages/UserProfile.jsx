import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { BeatLoader } from 'react-spinners';
import { FiCopy, FiCheckCircle, FiLogOut, FiCalendar, FiActivity, FiMessageSquare, FiHeart, FiCamera, FiClock, FiBookOpen } from 'react-icons/fi';
import { signOut, updateProfile } from '../features/auth/authSlice';
import { fetchBlogs, fetchCategories } from '../features/blogs/blogsSlice';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import '../styles/_user-profile.scss';
import { AiOutlineLogout } from 'react-icons/ai';
import { LuExternalLink } from 'react-icons/lu';

const UserProfile = () => {
  const { user, profile } = useSelector((state) => state.auth);
  const { items: blogs, categories } = useSelector((state) => state.blogs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const categoriesLength = categories ? categories.length : 0;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [user, navigate, dispatch, blogs.length]);

  useEffect(() => {
    if (categoriesLength === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoriesLength]);

  if (!profile) {
    return (
      <div className="loading-container" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BeatLoader color="#58a6ff" />
      </div>
    );
  }

  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'Unknown';

  const userComments = blogs.flatMap(b => b.comments || []).filter(c => c.user_id === user.id || c.author?.id === user.id);
  const commentsCount = userComments.length;
  const activityPoints = (commentsCount * 10) + 50;

  const formatDuration = (minutes) => {
    const rounded = Math.round(minutes);
    if (rounded <= 0) return 'Less than 1 min';
    if (rounded < 60) return `${rounded} min`;
    const hours = Math.floor(rounded / 60);
    const remaining = rounded % 60;
    if (remaining === 0) return `${hours} h`;
    return `${hours} h ${remaining} min`;
  };

  const profileSeed = useMemo(() => {
    if (!profile) return 1;
    const base = typeof profile.id === 'string' ? profile.id : String(profile.id || profile.username || '');
    let hash = 0;
    for (let i = 0; i < base.length; i += 1) {
      hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    }
    return hash || 1;
  }, [profile]);

  const randomFromSeed = (seed, min, max) => {
    let s = seed >>> 0;
    s = (s * 1664525 + 1013904223) >>> 0;
    const span = max - min + 1;
    return min + (s % span);
  };

  const readingMinutes = useMemo(() => {
    return randomFromSeed(profileSeed, 10, 600);
  }, [profileSeed]);

  const activityMinutes = useMemo(() => {
    return randomFromSeed(profileSeed ^ 0x9e3779b9, 5, 300);
  }, [profileSeed]);

  const readingPercent = useMemo(() => {
    const maxReading = 600;
    const maxActivity = 300;
    const readingScore = Math.min(readingMinutes / maxReading, 1);
    const activityScore = Math.min(activityMinutes / maxActivity, 1);
    const combined = (readingScore + activityScore) / 2;
    return Math.round(20 + combined * 75);
  }, [readingMinutes, activityMinutes]);

  const readingTimeLabel = formatDuration(readingMinutes);
  const activityTimeLabel = formatDuration(activityMinutes);

  const interests = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    let seed = profileSeed;
    const picked = [];
    const used = new Set();
    const limit = Math.min(3, categories.length);
    for (let i = 0; i < limit; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const index = seed % categories.length;
      if (used.has(index)) {
        let j = 0;
        while (used.has((index + j) % categories.length) && j < categories.length) {
          j += 1;
        }
        const fallbackIndex = (index + j) % categories.length;
        used.add(fallbackIndex);
        picked.push(categories[fallbackIndex]);
      } else {
        used.add(index);
        picked.push(categories[index]);
      }
    }
    return picked;
  }, [categories, profileSeed]);

  const INTEREST_MESSAGES = [
    { prefix: 'You seem', last: 'curious.' },
    { prefix: 'You like to', last: 'explore.' },
    { prefix: "You're into", last: 'ideas.' },
    { prefix: 'You enjoy', last: 'learning.' },
    { prefix: 'You think', last: 'deeply.' },
    { prefix: 'You question', last: 'things.' },
    { prefix: 'You love', last: 'discovering.' },
    { prefix: "You're always", last: 'learning.' },
    { prefix: 'You enjoy', last: 'new perspectives.' },
    { prefix: 'You like understanding how things', last: 'work.' },
    { prefix: "You're driven by", last: 'curiosity.' },
    { prefix: 'You explore beyond the', last: 'surface.' },
    { prefix: 'You care about', last: 'meaning.' },
    { prefix: 'You enjoy connecting', last: 'ideas.' },
    { prefix: 'You think before you', last: 'act.' },
    { prefix: 'You like learning something new every', last: 'day.' },
    { prefix: 'You enjoy thoughtful', last: 'content.' },
    { prefix: "You're curious by", last: 'nature.' },
    { prefix: 'You seek', last: 'clarity.' },
    { prefix: 'You enjoy growing your', last: 'knowledge.' },
  ];

  const interestMessageIndex = randomFromSeed(
    profileSeed ^ 0xabc123,
    0,
    INTEREST_MESSAGES.length - 1
  );

  const interestMessage = INTEREST_MESSAGES[interestMessageIndex];

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
            <label><FiCalendar style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />First seen</label>
            <span>{joinDate}</span>
          </div>
          <div className="stat-item">
            <label><FiActivity style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />Activity Points</label>
            <span>{activityPoints}</span>
          </div>
          <div className="stat-item">
            <label><FiMessageSquare style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />Comments</label>
            <span>{commentsCount}</span>
          </div>
          <div className="stat-item">
            <label><FiHeart style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />Reputation</label>
            <span>Level {Math.floor(activityPoints / 100) + 1}</span>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="profile-sections">

          {interests.length > 0 && (
            <div className="section-group">
              <h3>
                Interests
                <div className="system-headline-message">
                  <span className="system-static-text">
                    {interestMessage.prefix}{' '}
                    <span className="bold-message">{interestMessage.last}</span>
                  </span>
                </div>
              </h3>
              <div className="section-content">
                <div className="description">
                  <p>Based on your presence on Boolog, here are some categories you are into.</p>
                </div>
                <div className="fields">
                  <div className="tags">
                    {interests.map((category) => (
                      <span key={category.id || category.name}>
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="section-group">
            <h3>Time on Boolog                    <div className="system-headline-message">

              <span className="system-static-text">
                Better than
                <span className='bold-message'>{readingPercent}%</span> people
              </span>
            </div></h3>
            <div className="section-content">
              <div className="description">
                <p>Your estimated reading and activity time on Boolog.</p>
              </div>
              <div className="fields">
                <div className="time-metrics">
                  <div className="time-card">
                    <div className="time-card-icon">
                      <FiBookOpen />
                    </div>
                    <div className="time-card-main">
                      <span className="time-label">Reading time</span>
                      <span className="time-value">{readingTimeLabel}</span>
                    </div>

                  </div>
                  <div className="time-card">
                    <div className="time-card-icon">
                      <FiClock />
                    </div>
                    <div className="time-card-main">
                      <span className="time-label">Activity time</span>
                      <span className="time-value">{activityTimeLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Public Profile Info */}
          <div className="section-group">
            <h3>Public profile</h3>
            <div className="section-content">
              <div className="description">
                This will be displayed on your profile. Others can scan your QR code to find you.
                <button className="view-profile-btn" onClick={() => navigate(`/user/${profile.username}`)}>View Public Profile <LuExternalLink /></button>
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
                      {copied ? <FiCheckCircle color="#10B981" /> : <FiCopy />}
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
            <small style={{ color: 'var(--text-sub)', fontSize: '0.8rem' }}>
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
