import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike, addComment, fetchComments, deleteComment } from '../features/blogs/blogsSlice';
import { FiHeart, FiMessageSquare, FiShare2, FiSend, FiTrash2, FiAward } from 'react-icons/fi';
import ShareModal from './ShareModal';
import ConfirmModal from './ConfirmModal';
import Avatar from './Avatar';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const isLiked = blog.likes?.some(l => l.user_id === user?.id);
  const likesCount = blog.likes?.length || 0;
  const commentsCount = blog.comments?.length || 0;

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please login to like blogs');
      return;
    }
    dispatch(toggleLike({ blogId: blog.id, userId: user.id }));
  };

  const handleShareClick = (e) => {
      e.stopPropagation();
      setIsShareModalOpen(true);
  }
  
  const toggleComments = (e) => {
    e.stopPropagation();
    if (!showComments) {
        // Check if we need to fetch full comments (if we only have IDs or nothing)
        const hasContent = blog.comments?.length > 0 && blog.comments[0].content;
        if (!hasContent && blog.comments?.length > 0) {
            dispatch(fetchComments(blog.id));
        }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        toast.info('Please login to comment');
        return;
    }
    if (!commentText.trim()) return;

    const result = await dispatch(addComment({ blogId: blog.id, userId: user.id, content: commentText }));
    if (!result.error) {
        setCommentText('');
        toast.success('Comment added');
    } else {
        toast.error(result.payload);
    }
  };
  
  const handleDeleteClick = (commentId, e) => {
      e.stopPropagation();
      setCommentToDelete(commentId);
      setIsDeleteModalOpen(true);
  };

  const confirmDeleteComment = async () => {
      if (commentToDelete) {
          const result = await dispatch(deleteComment({ commentId: commentToDelete, blogId: blog.id }));
          if (!result.error) {
              toast.success('Comment deleted');
          } else {
              toast.error(result.payload);
          }
          setCommentToDelete(null);
      }
  };

  const handleCardClick = (e) => {
      // Prevent navigation if clicking on interactive elements
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('form')) {
          return;
      }
      navigate(`/blog/${blog.id}`);
  };

  const blogUrl = `${window.location.origin}/blog/${blog.id}`;

  return (
    <div className="blog-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {blog.image_url && (
        <img src={blog.image_url} alt={blog.title} className="blog-image" />
      )}
      <div className="blog-content">
        <div className="blog-header">
          <span className="category-tag">{blog.categories?.name || 'Uncategorized'}</span>
          <div className="tags-container">
            {blog.tags && blog.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          <span className="blog-date">{new Date(blog.created_at).toLocaleDateString()}</span>
        </div>
        
        <h3>{blog.title}</h3>
        <p className="excerpt">{blog.content}</p>

        <div className="blog-footer">
          <div className="author">
             <Avatar 
               url={blog.profiles?.avatar_url} 
               username={blog.profiles?.username || 'Admin'} 
               size="24px"
               className="avatar"
             />
             {/* If no profile relation, it's likely Admin or decoupled user. Default to Admin if undefined. */}
             <span>{blog.profiles?.username || 'Admin'}</span>
          </div>

          <div className="actions">
            <button onClick={handleLike} className={isLiked ? 'liked' : ''}>
              <FiHeart style={{ fill: isLiked ? 'currentColor' : 'none' }} />
              {likesCount}
            </button>
            <button onClick={toggleComments}>
              <FiMessageSquare />
              {commentsCount}
            </button>
            <button onClick={handleShareClick}>
              <FiShare2 />
            </button>
          </div>
        </div>

        {showComments && (
            <div className="comments-section" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleAddComment} className="comment-form">
                    <input 
                        type="text" 
                        placeholder="Write a comment..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onClick={e => e.stopPropagation()}
                    />
                    <button type="submit">
                        <FiSend />
                    </button>
                </form>
                
                {commentsCount === 0 ? (
                    <div className="no-comments">
                        <p>No comments yet.</p>
                        <p className="sub-text">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div className="comments-list">
                        {blog.comments && [...blog.comments]
                            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                            .map((comment, index) => (
                            comment.content ? (
                                <div key={comment.id} className={`comment-item ${index === 0 ? 'first' : ''}`}>
                                    {index === 0 && (
                                        <div className="first-badge">
                                            <FiAward /> First!
                                        </div>
                                    )}
                                    <div className="comment-header">
                                        <div className="comment-user-info">
                                            <Avatar 
                                              url={comment.profiles?.avatar_url} 
                                              username={comment.profiles?.username || 'Unknown'} 
                                              size="20px"
                                              className="comment-avatar"
                                            />
                                            <span className="comment-username">{comment.profiles?.username || 'Unknown'}</span>
                                            <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {user?.id === comment.user_id && (
                                            <button 
                                                onClick={(e) => handleDeleteClick(comment.id, e)}
                                                className="delete-comment-btn"
                                                title="Delete comment"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                    <p className="comment-content">{comment.content}</p>
                                </div>
                            ) : null
                        ))}
                        {(!blog.comments || (blog.comments.length > 0 && !blog.comments[0].content)) && (
                             <div className="loading-container">
                                <div className="loading-spinner"></div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>
      
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={blogUrl}
        title={blog.title}
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </div>
  );
};

export default BlogCard;
