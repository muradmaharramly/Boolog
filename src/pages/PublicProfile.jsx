import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BeatLoader } from 'react-spinners';
import { QRCodeCanvas } from 'qrcode.react';
import { FiCalendar, FiActivity, FiMessageSquare, FiHeart, FiUser, FiSmartphone, FiCheckCircle, FiClock, FiBookOpen } from 'react-icons/fi';
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

  const interests = (() => {
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
  })();

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
        <p>The user {username} does not exist.</p>
        <Link to="/" style={{ color: 'var(--accent)', marginTop: '1rem', display: 'inline-block' }}>Back to Home</Link>
      </div>
    );
  }

  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'Unknown';

  const commentsCount = blogs.flatMap(b => b.comments || []).filter(c => c.user_id === profile.id).length;
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

  const profileSeed = (() => {
    if (!profile) return 1;
    const base = typeof profile.id === 'string' ? profile.id : String(profile.id || profile.username || '');
    let hash = 0;
    for (let i = 0; i < base.length; i += 1) {
      hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    }
    return hash || 1;
  })();

  const randomFromSeed = (seed, min, max) => {
    let s = seed >>> 0;
    s = (s * 1664525 + 1013904223) >>> 0;
    const span = max - min + 1;
    return min + (s % span);
  };

  const readingMinutes = randomFromSeed(profileSeed, 10, 600);

  const activityMinutes = randomFromSeed(profileSeed ^ 0x9e3779b9, 5, 300);

  const maxReading = 600;
  const maxActivity = 300;
  const readingScore = Math.min(readingMinutes / maxReading, 1);
  const activityScore = Math.min(activityMinutes / maxActivity, 1);
  const combinedScore = (readingScore + activityScore) / 2;
  const readingPercent = Math.round(20 + combinedScore * 75);

  const readingTimeLabel = formatDuration(readingMinutes);
  const activityTimeLabel = formatDuration(activityMinutes);

  const INTEREST_MESSAGES = [
    { prefix: '{username} seems', last: 'curious.' },
    { prefix: '{username} likes to', last: 'explore.' },
    { prefix: '{username} is into', last: 'ideas.' },
    { prefix: '{username} enjoys', last: 'learning.' },
    { prefix: '{username} thinks', last: 'deeply.' },
    { prefix: '{username} questions', last: 'things.' },
    { prefix: '{username} loves', last: 'discovering.' },
    { prefix: '{username} is always', last: 'learning.' },
    { prefix: '{username} enjoys', last: 'new perspectives.' },
    { prefix: '{username} likes understanding how things', last: 'work.' },
    { prefix: '{username} is driven by', last: 'curiosity.' },
    { prefix: '{username} explores beyond the', last: 'surface.' },
    { prefix: '{username} cares about', last: 'meaning.' },
    { prefix: '{username} enjoys connecting', last: 'ideas.' },
    { prefix: '{username} thinks before', last: 'acting.' },
    { prefix: '{username} likes learning something new every', last: 'day.' },
    { prefix: '{username} enjoys thoughtful', last: 'content.' },
    { prefix: '{username} is curious by', last: 'nature.' },
    { prefix: '{username} seeks', last: 'clarity.' },
    { prefix: '{username} enjoys growing their', last: 'knowledge.' },
  ];

  const interestMessageIndex = randomFromSeed(
    profileSeed ^ 0xabc123,
    0,
    INTEREST_MESSAGES.length - 1
  );

  const interestMessage = INTEREST_MESSAGES[interestMessageIndex];
  const interestMessagePrefix = interestMessage.prefix.replace(
    '{username}',
    profile.username
  );

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
        <div className="profile-sections">
          {interests.length > 0 && (
            <div className="section-group">
              <h3>
                Interests
                <div className="system-headline-message">
                  <span className="system-static-text">
                    {interestMessagePrefix}{' '}
                    <span className="bold-message">{interestMessage.last}</span>
                  </span>
                </div>
              </h3>
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
        </div>
      </div>


    </div>
  );
};

export default PublicProfile;
