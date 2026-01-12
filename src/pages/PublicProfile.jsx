import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BeatLoader } from 'react-spinners';
import { QRCodeCanvas } from 'qrcode.react';
import { FiCalendar, FiActivity, FiMessageSquare, FiHeart, FiUser, FiSmartphone } from 'react-icons/fi';
import Avatar from '../components/Avatar';
import BlogCard from '../components/BlogCard';
import '../styles/_user-profile.scss'; // Reuse styles
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../features/blogs/blogsSlice';

const PublicProfile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { items: blogs, loading: blogsLoading } = useSelector((state) => state.blogs);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetch profile by username
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        setProfile(data);
        
        // Ensure blogs are loaded
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

  if (loading) {
    return (
      <div className="loading-container" style={{height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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

  // Filter blogs by this user
  const userBlogs = blogs.filter(b => b.author_id === profile.id);
  
  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'Unknown';

  // Stats
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
            <h1>{profile.username}</h1>
            <p className="user-role">Community Member</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <label><FiCalendar style={{marginRight: '5px', verticalAlign: 'text-bottom'}}/>Joined</label>
            <span>{joinDate}</span>
          </div>
          <div className="stat-item">
            <label><FiActivity style={{marginRight: '5px', verticalAlign: 'text-bottom'}}/>Activity Points</label>
              <span>{activityPoints}</span>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default PublicProfile;
