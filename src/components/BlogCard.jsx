import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiEye, FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { toggleLike } from '../features/blogs/blogsSlice';
import { toast } from 'react-toastify';
import ShareModal from './ShareModal';
import '../styles/_blogcard.scss';

const BlogCard = ({ blog, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const hashString = (value) => {
    const str = String(value ?? '');
    let hash = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const getDayIndex = (d) => {
    const dateObj = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dateObj.getTime())) return null;
    const utcMidnight = Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate());
    return Math.floor(utcMidnight / 86400000);
  };

  const getSyntheticViews = (blogId, createdAt) => {
    const todayIndex = getDayIndex(new Date());
    const createdIndex = getDayIndex(createdAt) ?? todayIndex;
    const daysElapsed = Math.max(0, (todayIndex ?? 0) - (createdIndex ?? 0));

    const base = 60 + (hashString(`${blogId}:base`) % 441);
    const increments = [3, 5, 10];

    let total = base;
    for (let i = 1; i <= daysElapsed; i += 1) {
      const stepSeed = `${blogId}:${createdIndex + i}`;
      total += increments[hashString(stepSeed) % increments.length];
    }
    return total;
  };

  const formatViews = (value) => {
    const n = Number(value) || 0;
    if (n >= 1000000) {
      const v = (n / 1000000).toFixed(1);
      return `${v.endsWith('.0') ? v.slice(0, -2) : v}M`;
    }
    if (n >= 1000) {
      const v = (n / 1000).toFixed(1);
      return `${v.endsWith('.0') ? v.slice(0, -2) : v}K`;
    }
    return String(n);
  };

  // Handle potentially missing data safely
  const title = blog?.title || 'Untitled Post';
  const content = blog?.content || 'No content available.';
  const category = blog?.categories?.name || 'Uncategorized';
  const date = blog?.created_at ? formatDistanceToNow(new Date(blog.created_at), { addSuffix: true }) : 'Unknown date';
  const authorName = blog?.profiles?.username || 'Anonymous';
  const likesCount = blog?.likes?.length || 0;
  const commentsCount = blog?.comments?.length || 0;
  const isLiked = user && blog?.likes?.some(like => like.user_id === user.id);
  const viewsCount = getSyntheticViews(blog?.id ?? title, blog?.created_at);
  
  // Placeholder image if none provided
  const imageUrl = blog?.image_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please login to like posts');
      return;
    }
    dispatch(toggleLike({ blogId: blog.id, userId: user.id }));
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/blog/${blog.id}`);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div
        className={`blog-card ${viewMode === 'list' ? 'list' : 'grid'}`}
        onClick={() => navigate(`/blog/${blog.id}`)}
      >
        <div className="blog-image">
          <img src={imageUrl} alt={title} loading="lazy" />
          <span className="category-badge">{category}</span>
        </div>
        
        <div className="blog-content">
          <div className="blog-meta-row">
            <div className="blog-date">
              <FiClock size={14} />
              <span>{date}</span>
            </div>
            <div className="blog-views">
              <FiEye size={14} />
              <span>{formatViews(viewsCount)} views</span>
            </div>
          </div>
          
          <h3>{title}</h3>
          <p>{content}</p>
          
          <div className="blog-footer">
            <div className="author">
              <div className="avatar-small">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <span>{authorName}</span>
            </div>
            
            <div className="actions">
              <button 
                className={`action-btn like-btn ${isLiked ? 'active' : ''}`} 
                onClick={handleLike}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{likesCount}</span>
              </button>
              <button 
                className="action-btn comment-btn" 
                onClick={handleCommentClick}
                title="Comments"
              >
                <FiMessageSquare size={16} />
                <span>{commentsCount}</span>
              </button>
              <button 
                className="action-btn share-btn" 
                onClick={handleShareClick}
                title="Share"
              >
                <FiShare2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

    <ShareModal 
      isOpen={isShareModalOpen} 
      onClose={() => setIsShareModalOpen(false)} 
      url={`${window.location.origin}/blog/${blog.id}`}
      title={title}
    />
    </>
  );
};

export default BlogCard;
