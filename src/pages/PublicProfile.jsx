import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BeatLoader } from 'react-spinners';
import { QRCodeCanvas } from 'qrcode.react';
import { FiCalendar, FiActivity, FiMessageSquare, FiHeart, FiUser, FiSmartphone, FiCheckCircle } from 'react-icons/fi';
import Avatar from '../components/Avatar';
import BlogCard from '../components/BlogCard';
import '../styles/_user-profile.scss'; // Reuse styles
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, fetchCategories } from '../features/blogs/blogsSlice';

const PublicProfile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { items: blogs, categories } = useSelector((state) => state.blogs);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const categoriesLength = categories ? categories.length : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        setProfile(data);

        if (blogs.length === 0) {
          dispatch(fetchBlogs());
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('User not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, dispatch, blogs.length]);

  useEffect(() => {
    if (categoriesLength === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoriesLength]);

  const interests = useMemo(() => {
    if (!profile || !categories || categories.length === 0) return [];
    const base = typeof profile.id === 'string' ? profile.id : String(profile.id || profile.username || '');
    let hash = 0;
    for (let i = 0; i < base.length; i += 1) {
      hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    }
    let seed = hash || 1;
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
  }, [profile, categories]);

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BeatLoader color="#58a6ff" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>User not found</h2>
        <p>The user "{username}" does not exist.</p>
        <Link to="/" style={{ color: 'var(--accent)', marginTop: '1rem', display: 'inline-block' }}>Back to Home</Link>
      </div>
    );
  }

  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'Unknown';

  const commentsCount = blogs.flatMap(b => b.comments || []).filter(c => c.user_id === profile.id).length;
  const activityPoints = (commentsCount * 10) + 50;

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-banner"></div>

        <div className="profile-header">
          <div className="avatar-wrapper">
            <Avatar
              url={profile.avatar_url}
              username={profile.username}
              size="110px"
              className="profile-avatar"
            />
          </div>

          <div className="profile-qr">
            <div className="qr-box">
              <QRCodeCanvas
                value={window.location.href}
                size={120}
                level={"M"}
                includeMargin={false}
              />
              <span className="scan-text">Scan to Share</span>
            </div>
          </div>

          <div className="user-identity">
            <h1>{profile.username}
              <FiCheckCircle className="verified-badge" title="Verified User" />
            </h1>
            <p className="user-role">Community Member</p>
          </div>
        </div>

        <div className="user-stats-grid">
          <div className="stat-item">
            <label><FiCalendar style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />Joined</label>
            <span>{joinDate}</span>
          </div>
          <div className="stat-item">
            <label><FiActivity style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />Activity Points</label>
            <span>{activityPoints}</span>
          </div>
          <div className="stat-item">
            <label><FiHeart style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />Reputation</label>
            <span>Level {Math.floor(activityPoints / 100) + 1}</span>
          </div>
        </div>
        {interests.length > 0 && (
          <div className="profile-sections">
            <div className="section-group">
              <h3>Interests</h3>
              <div className="section-content">
                <div className="description">
                  <p>{profile.username} is interested in these Boolog categories.</p>
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
          </div>
        )}
      </div>


    </div>
  );
};

export default PublicProfile;
