import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/_active-users.scss';

const getRandomColor = (seed) => {
    if (!seed) return '#999';
    const colors = [
        '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
        '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', 
        '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722',
        '#795548', '#607D8B'
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(/[\s_-]+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

const ActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, count, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url', { count: 'exact' })
          .limit(15);

        if (error) throw error;
        
        const realUsers = data || [];
        const targetCount = 12;
        const needed = targetCount - realUsers.length;
        
        const mocks = Array.from({ length: Math.max(0, needed) }).map((_, i) => ({
            id: `mock-${i}`,
            username: `User ${i+1}`,
            avatar_url: null 
        }));

        const allUsers = [...realUsers, ...mocks].slice(0, targetCount);
        
        // Process users according to specific rules:
        // 1. First 2 users: Show REAL identity (avatar image OR initials with color)
        // 2. Others: Show ONLY random color (no text, no image)
        
        const finalUsers = allUsers.map((u, index) => {
            const isRealDisplay = index < 2;
            const seed = u.username || u.id || Math.random().toString();
            
            return {
                ...u,
                isRealDisplay, // Flag for render
                initials: isRealDisplay ? getInitials(u.username) : '', // Only calculate initials if needed
                color: getRandomColor(seed)
            };
        });

        setUsers(finalUsers);
        setTotalCount(count || 120 + Math.floor(Math.random() * 50)); 
        
      } catch (err) {
        console.error('Error fetching active users:', err);
        // Fallback
        const mocks = Array.from({ length: 12 }).map((_, i) => ({
            id: `mock-${i}`,
            username: `User ${i+1}`,
            isRealDisplay: i < 2,
            initials: i < 2 ? `U${i+1}` : '',
            color: getRandomColor(`User ${i+1}`)
        }));
        setUsers(mocks);
        setTotalCount(120);
      }
    };

    fetchUsers();
  }, []);

  const handlePlusClick = () => {
    if (!user) {
      navigate('/register');
    }
  };

  if (users.length === 0) return null;

  return (
    <div className="active-users-container">
        <div className="avatars-scroll-wrapper">
            {users.map((u, index) => (
                <div 
                    key={u.id} 
                    className="avatar-item" 
                    style={{ zIndex: users.length - index }}
                    title={u.isRealDisplay ? u.username : ''} // Only show tooltip for real ones
                >
                    {u.isRealDisplay && u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.username} />
                    ) : (
                        <div 
                            className="avatar-content"
                            style={{ backgroundColor: u.color }}
                        >
                            {u.isRealDisplay ? u.initials : ''}
                        </div>
                    )}
                </div>
            ))}
            
            {/* Plus Button at the end */}
            <div className="avatar-item plus-item" onClick={handlePlusClick} title="Join Community">
                <FiPlus />
            </div>
        </div>
        
        <div className="join-text">
            Join {totalCount > 100 ? totalCount : '100+'} others
        </div>
    </div>
  );
};

export default ActiveUsers;