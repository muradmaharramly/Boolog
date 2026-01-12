import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, fetchComments, addComment, deleteComment, toggleLike } from '../features/blogs/blogsSlice';
import { BeatLoader } from 'react-spinners';
import { FiHeart, FiCalendar, FiUser, FiTag, FiSend, FiTrash2, FiAward, FiShare2, FiMessageSquare, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import BlogCard from '../components/BlogCard';
import ShareModal from '../components/ShareModal';
import ConfirmModal from '../components/ConfirmModal';
import CommentModal from '../components/CommentModal';
import '../styles/_blog-details.scss';
import Avatar from '../components/Avatar';

const BlogDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items: blogs, loading } = useSelector((state) => state.blogs);
  const { user, profile } = useSelector((state) => state.auth);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('recent'); // 'recent' | 'popular'

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
      <div className="loading-container">
        <BeatLoader color="#6366F1" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="not-found-container">
        <h2>Blog not found</h2>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    );
  }

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

  const isLiked = blog.likes?.some(l => l.user_id === user?.id);
  const likesCount = blog.likes?.length || 0;
  const viewsCount = getSyntheticViews(blog?.id ?? blog?.title, blog?.created_at);

  const handleLike = () => {
    if (!user) {
      toast.info('Please login to like');
      return;
    }
    dispatch(toggleLike({ blogId: blog.id, userId: user.id }));
  };

  const handleAddComment = async (content) => {
    if (!user) {
        toast.info('Please login to comment');
        return;
    }
    if (!content.trim()) return;

    const result = await dispatch(addComment({ blogId: blog.id, userId: user.id, content }));
    if (!result.error) {
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

  // Process comments: Find "First" (oldest), pin it to top, sort rest Newest -> Oldest
  const sortedComments = (() => {
    if (!blog.comments || blog.comments.length === 0) return [];
    
    // Sort all by date ascending (oldest first)
    const chronological = [...blog.comments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    // Identify the first comment
    const firstComment = { ...chronological[0], isFirst: true };
    
    if (chronological.length === 1) return [firstComment];
    
    // Get the rest and sort them by date descending (newest first)
    const rest = chronological.slice(1).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return [firstComment, ...rest];
  })();

  const otherBlogs = blogs
    .filter(b => b.id !== blog.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  const popularBlogs = blogs
    .filter(b => b.id !== blog.id)
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 4);

  const sidebarBlogs = sidebarTab === 'recent' ? otherBlogs : popularBlogs;

  return (
    <div className="blog-details-container">
      
      <div className="blog-layout">
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
                        <FiEye /> {new Intl.NumberFormat().format(viewsCount)} views
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

                {/* Interaction Actions Bar */}
                <div className="blog-actions-bar">
                    <button 
                        onClick={handleLike} 
                        className={`action-btn ${isLiked ? 'liked' : ''}`}
                    >
                        <FiHeart className={isLiked ? 'fill-current' : ''} /> 
                        <span>{isLiked ? 'Liked' : 'Like'} ({likesCount})</span>
                    </button>
                    <button 
                        onClick={() => setIsCommentModalOpen(true)}
                        className="action-btn"
                    >
                        <FiMessageSquare /> 
                        <span>Comment ({blog.comments?.length || 0})</span>
                    </button>
                    <button 
                        onClick={() => setIsShareModalOpen(true)}
                        className="action-btn"
                    >
                        <FiShare2 /> 
                        <span>Share</span>
                    </button>
                </div>

                {/* Author Bio Section */}
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


                <div className="comments-preview-section" onClick={() => setIsCommentModalOpen(true)}>
                    <h3>Comments ({blog.comments?.length || 0})</h3>
                    <p>Tap to view and add comments...</p>
                </div>
            </div>
          </div>
        </article>

        <aside className="blog-sidebar">
            <div className="sidebar-section">
                <div className="sidebar-tabs">
                    <button 
                        className={`tab-btn ${sidebarTab === 'recent' ? 'active' : ''}`}
                        onClick={() => setSidebarTab('recent')}
                    >
                        Recent
                    </button>
                    <button 
                        className={`tab-btn ${sidebarTab === 'popular' ? 'active' : ''}`}
                        onClick={() => setSidebarTab('popular')}
                    >
                        Popular
                    </button>
                </div>

                <div className="sidebar-blogs-list">
                    {sidebarBlogs.map(b => (
                        <Link to={`/blog/${b.id}`} key={b.id} className="sidebar-blog-card">
                            <div className="sidebar-blog-image">
                                <img src={b.image_url || 'https://via.placeholder.com/150'} alt={b.title} />
                                {b.categories && <span className="category-tag">{b.categories.name}</span>}
                            </div>
                            <div className="sidebar-blog-info">
                                <h4>{b.title}</h4>
                                <div className="blog-meta-mini">
                                    <span className="date">{new Date(b.created_at).toLocaleDateString()}</span>
                                    <span className="dot">•</span>
                                    <span className="read-time">5 min read</span>
                                </div>
                                <div className="blog-stats-mini">
                                    <span><FiHeart size={12}/> {b.likes?.length || 0}</span>
                                    <span><FiMessageSquare size={12}/> {b.comments?.length || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    </div>

      <div className="back-link">
        <Link to="/">Back to Blogs</Link>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={window.location.href}
        title={blog.title}
      />

              <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                comments={sortedComments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteClick}
                currentUser={profile || user}
                loading={loading}
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
