import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { toggleLike } from '../features/blogs/blogsSlice';
import { toast } from 'react-toastify';
import ShareModal from './ShareModal';
import '../styles/_blogcard.scss';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Handle potentially missing data safely
  const title = blog?.title || 'Untitled Post';
  const content = blog?.content || 'No content available.';
  const category = blog?.categories?.name || 'Uncategorized';
  const date = blog?.created_at ? formatDistanceToNow(new Date(blog.created_at), { addSuffix: true }) : 'Unknown date';
  const authorName = blog?.profiles?.username || 'Anonymous';
  const likesCount = blog?.likes?.length || 0;
  const commentsCount = blog?.comments?.length || 0;
  const isLiked = user && blog?.likes?.some(like => like.user_id === user.id);
  
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
      <div className="blog-card" onClick={() => navigate(`/blog/${blog.id}`)}>
        <div className="blog-image">
        <img src={imageUrl} alt={title} loading="lazy" />
        <span className="category-badge">{category}</span>
      </div>
      
      <div className="blog-content">
        <div className="blog-date">
          <FiClock size={14} />
          <span>{date}</span>
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
