import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, fetchComments, addComment, deleteComment, toggleLike } from '../features/blogs/blogsSlice';
import { BeatLoader } from 'react-spinners';
import { FiHeart, FiCalendar, FiUser, FiTag, FiSend, FiTrash2, FiAward, FiShare2, FiBookmark } from 'react-icons/fi';
import { toast } from 'react-toastify';
import BlogCard from '../components/BlogCard';
import ShareModal from '../components/ShareModal';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/_blog-details.scss';
import Avatar from '../components/Avatar';

const BlogDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items: blogs, loading } = useSelector((state) => state.blogs);
  const { user } = useSelector((state) => state.auth);
  
  const [commentText, setCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [dispatch, blogs.length]);

  const blog = blogs.find(b => b.id === parseInt(id));

  useEffect(() => {
    if (blog && (!blog.comments || (blog.comments.length > 0 && !blog.comments[0].content))) {
      dispatch(fetchComments(blog.id));
    }
  }, [dispatch, blog]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <BeatLoader color="#58a6ff" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-details-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Blog not found</h2>
        <Link to="/" style={{ color: '#58a6ff', marginTop: '1rem', display: 'inline-block' }}>Back to Home</Link>
      </div>
    );
  }

  const isLiked = blog.likes?.some(l => l.user_id === user?.id);
  const likesCount = blog.likes?.length || 0;

  const handleLike = () => {
    if (!user) {
      toast.info('Please login to like');
      return;
    }
    dispatch(toggleLike({ blogId: blog.id, userId: user.id }));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
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

  const handleDeleteClick = (commentId) => {
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

  // Sort comments by date ascending to find the "First"
  const sortedComments = blog.comments ? [...blog.comments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];

  const otherBlogs = blogs.filter(b => b.id !== blog.id).slice(0, 3);

  return (
    <div className="blog-details-container">
      
      <div className="blog-layout">
        <aside className="floating-actions">
            <button 
                onClick={handleLike} 
                className={`action-btn ${isLiked ? 'liked' : ''}`}
                title="Like"
            >
                <FiHeart style={{ fill: isLiked ? 'currentColor' : 'none' }} />
                <span className="count">{likesCount}</span>
            </button>
            <button 
                onClick={() => setIsShareModalOpen(true)}
                className="action-btn" 
                title="Share"
            >
                <FiShare2 />
            </button>
        </aside>

        <article className="blog-main-content">
          <div className="blog-details-card">
            {blog.image_url && (
            <img src={blog.image_url} alt={blog.title} className="blog-hero-image" />
            )}
            
            <div className="blog-content-wrapper">
                <div className="meta-info">
                    <span>
                        <FiCalendar /> {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                    <span>
                        <FiUser /> {blog.profiles?.username || 'Admin'}
                    </span>
                    {blog.categories && (
                        <span className="category-badge">
                            {blog.categories.name}
                        </span>
                    )}
                </div>

                <h1>{blog.title}</h1>
                
                <div className="blog-content">
                    {blog.content}
                </div>

                <div className="tags">
                    {blog.tags && blog.tags.map((tag, idx) => (
                        <span key={idx}>
                            <FiTag size={12} /> {tag}
                        </span>
                    ))}
                </div>

                {/* Author Bio Section - Defaults to Admin since only admins post */}
                <div className="author-bio-section">
                    <div className="bio-avatar">
                        <Avatar 
                            url={blog.profiles?.avatar_url} 
                            username={blog.profiles?.username || 'Admin'} 
                            size="60px"
                        />
                    </div>
                    <div className="bio-content">
                        <h3>Written by {blog.profiles?.username || 'Admin'}</h3>
                        <p>Passionate writer and contributor to Boolog. Sharing insights on technology, lifestyle, and more.</p>
                    </div>
                </div>


                <div className="comments-section">
                    <h3>Comments ({blog.comments?.length || 0})</h3>
                    
                    <form onSubmit={handleAddComment} className="comment-form">
                        <textarea 
                            placeholder="Write a comment..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="form-actions">
                            <button type="submit">
                                <FiSend /> Post Comment
                            </button>
                        </div>
                    </form>

                    <div className="comments-list">
                        {sortedComments.map((comment, index) => (
                            comment.content ? (
                                <div key={comment.id} className={`comment-item ${index === 0 ? 'first' : ''}`}>
                                    {index === 0 && (
                                        <div className="first-badge">
                                            <FiAward /> First!
                                        </div>
                                    )}
                                    <div className="comment-header">
                                        <div className="user-info">
                                            {comment.profiles?.avatar_url ? (
                                                <img src={comment.profiles.avatar_url} alt="avatar" className="avatar" />
                                            ) : (
                                                <div className="avatar" />
                                            )}
                                            <div>
                                                <div className="username">{comment.profiles?.username || 'Unknown'}</div>
                                                <div className="date">{new Date(comment.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        {user?.id === comment.user_id && (
                                            <button onClick={() => handleDeleteClick(comment.id)} className="delete-btn">
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            ) : null
                        ))}
                        {sortedComments.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#8b949e' }}>No comments yet. Be the first!</p>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </article>
    </div>

      <div className="back-link">
        <Link to="/">Back to Blogs</Link>
      </div>

      <div className="other-blogs">
        <h2>Other Blogs You Might Like</h2>
        <div className="blogs-grid">
            {otherBlogs.map(b => (
                <BlogCard key={b.id} blog={b} />
            ))}
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={window.location.href}
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

export default BlogDetails;
