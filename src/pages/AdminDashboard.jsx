import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats, fetchUsers, addCategory, fetchRecentComments } from '../features/admin/adminSlice';
import { addBlog, fetchCategories, fetchBlogs, deleteBlog, updateBlog } from '../features/blogs/blogsSlice';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiBarChart2, FiUsers, FiFileText, FiActivity, FiPlus, FiX, FiTag, FiMessageSquare, FiClock, FiChevronDown } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import EditModal from '../components/EditModal';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/_admin-dashboard.scss';
import { GoPlus } from 'react-icons/go';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, users, recentComments, loading } = useSelector((state) => state.admin);
  const { categories, items: blogs } = useSelector((state) => state.blogs);
  const { user } = useSelector((state) => state.auth);
  
  const [categoryName, setCategoryName] = useState('');
  
  // State for "Publish New Blog" form
  const [newBlogData, setNewBlogData] = useState({ title: '', content: '', image_url: '', category_id: '', tags: [] });
  const [newBlogTag, setNewBlogTag] = useState('');
  
  // Custom Dropdown State
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = React.useRef(null);

  // State for "Edit Blog" modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);

  // State for "Delete Blog" modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const totalViews = blogs.reduce((acc, blog) => acc + (blog.views || 0), 0);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchUsers());
    dispatch(fetchCategories());
    dispatch(fetchBlogs());
    dispatch(fetchRecentComments());

    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    
    const result = await dispatch(addCategory(categoryName));
    if (!result.error) {
      toast.success('Category added successfully');
      setCategoryName('');
      dispatch(fetchCategories());
    } else {
      toast.error(result.payload);
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlogData.title || !newBlogData.content || !user?.id) {
        toast.error('Please fill in required fields');
        return;
    }

    const result = await dispatch(addBlog({ 
        ...newBlogData, 
        author_id: user.id
    }));

    if (!result.error) {
      toast.success('Blog published successfully');
      setNewBlogData({ title: '', content: '', image_url: '', category_id: '', tags: [] });
      dispatch(fetchStats());
      dispatch(fetchBlogs());
    } else {
      toast.error(result.payload);
    }
  };

  const handleUpdateBlog = async (formData) => {
    const result = await dispatch(updateBlog(formData));

    if (!result.error) {
        toast.success('Blog updated successfully');
        setShowEditModal(false);
        setBlogToEdit(null);
        dispatch(fetchStats());
        dispatch(fetchBlogs());
    } else {
        toast.error(result.payload);
    }
  };

  const handleDeleteBlog = async () => {
    if (blogToDelete) {
      const result = await dispatch(deleteBlog(blogToDelete.id));
      if (!result.error) {
        toast.success('Blog deleted successfully');
        dispatch(fetchStats());
        dispatch(fetchBlogs());
      } else {
        toast.error(result.payload);
      }
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const openDeleteModal = (blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (blog) => {
    setBlogToEdit(blog);
    setShowEditModal(true);
  };

  const handleCategorySelect = (categoryId) => {
    setNewBlogData({ ...newBlogData, category_id: categoryId });
    setIsCategoryDropdownOpen(false);
  };

  const getSelectedCategoryName = () => {
    if (!newBlogData.category_id) return 'Select Category';
    const cat = categories.find(c => c.id == newBlogData.category_id);
    return cat ? cat.name : 'Select Category';
  };

  const handleAddTag = (e) => {
      e.preventDefault();
      if (newBlogTag.trim() && !newBlogData.tags.includes(newBlogTag.trim())) {
          setNewBlogData({ ...newBlogData, tags: [...newBlogData.tags, newBlogTag.trim()] });
          setNewBlogTag('');
      }
  };

  const removeTag = (tagToRemove) => {
      setNewBlogData({ ...newBlogData, tags: newBlogData.tags.filter(t => t !== tagToRemove) });
  };


  if (loading && users.length === 0) {
    return <LoadingScreen fullPage message="Loading Dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.username || 'Admin'}</p>
        </div>
        <div className="date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
            <div className="stat-icon purple"><FiBarChart2 /></div>
            <div className="stat-info">
                <h3>{totalViews}</h3>
                <p>Total Views</p>
            </div>
        </div>
        <div className="stat-card blue">
            <div className="stat-icon blue"><FiFileText /></div>
            <div className="stat-info">
                <h3>{stats.blogsCount || 0}</h3>
                <p>Published Blogs</p>
            </div>
        </div>
        <div className="stat-card green">
            <div className="stat-icon green"><FiUsers /></div>
            <div className="stat-info">
                <h3>{users.length || 0}</h3>
                <p>Active Users</p>
            </div>
        </div>
        <div className="stat-card orange">
            <div className="stat-icon orange"><FiActivity /></div>
            <div className="stat-info">
                <h3>{stats.commentsCount || 0}</h3>
                <p>Total Comments</p>
            </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Top Row: Add Category & Publish Blog */}
        <div className="dashboard-row top-row">
            {/* Add Category */}
            <div className="dashboard-card small-card">
                <h2><FiPlus /> Add Category</h2>
                <form onSubmit={handleAddCategory}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Category Name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </div>
                    <button type="submit">Add Category</button>
                </form>

                <div className="categories-list-preview">
                  <h3>Existing Categories</h3>
                  <div className="tags-list">
                    {categories.map(cat => (
                      <span key={cat.id} className="tag-badge">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
            </div>

            {/* Publish Blog */}
            <div className="dashboard-card large-card">
                <h2><FiEdit2 /> Publish Article</h2>
                <form onSubmit={handleAddBlog}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={newBlogData.title}
                            onChange={(e) => setNewBlogData({ ...newBlogData, title: e.target.value })}
                            placeholder="Enter blog title"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Category</label>
                        <div className="custom-select-wrapper" ref={categoryDropdownRef}>
                            <div 
                                className={`custom-select-trigger ${isCategoryDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            >
                                <span>{getSelectedCategoryName()}</span>
                                <FiChevronDown className="chevron-icon" />
                            </div>
                            
                            {isCategoryDropdownOpen && (
                                <div className="custom-select-options">
                                    <div 
                                        className={`option ${newBlogData.category_id === '' ? 'selected' : ''}`}
                                        onClick={() => handleCategorySelect('')}
                                    >
                                        Select Category
                                    </div>
                                    {categories.map(cat => (
                                        <div 
                                            key={cat.id} 
                                            className={`option ${newBlogData.category_id === cat.id ? 'selected' : ''}`}
                                            onClick={() => handleCategorySelect(cat.id)}
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            value={newBlogData.content}
                            onChange={(e) => setNewBlogData({ ...newBlogData, content: e.target.value })}
                            placeholder="Write your story..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Cover Image URL</label>
                        <input
                            type="text"
                            value={newBlogData.image_url}
                            onChange={(e) => setNewBlogData({ ...newBlogData, image_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Tags</label>
                        <div className="tags-input-container">
                            <input
                                type="text"
                                value={newBlogTag}
                                onChange={(e) => setNewBlogTag(e.target.value)}
                                placeholder="Add tag"
                            />
                            <button onClick={handleAddTag}><GoPlus /></button>
                        </div>
                        <div className="tags-list">
                            {newBlogData.tags.map(tag => (
                                <span key={tag} className="tag-badge">
                                    {tag} <button type="button" onClick={() => removeTag(tag)}><FiX /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button type="submit">Publish Now</button>
                </form>
            </div>
        </div>

        {/* Middle Row: Manage Articles */}
        <div className="dashboard-row full-width">
            <div className="dashboard-card">
                <h2><FiFileText /> Manage Articles</h2>
                <div className="blog-list">
                    {blogs.map(blog => (
                        <div key={blog.id} className="blog-list-item">
                            {blog.image_url && (
                                <img src={blog.image_url} alt={blog.title} className="blog-thumb" />
                            )}
                            <div className="item-info">
                                <h4>{blog.title}</h4>
                                <div className="meta">
                                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                    <span>• {blog.categories?.name}</span>
                                </div>
                            </div>
                            <div className="item-actions">
                                <button className="btn-edit" onClick={() => openEditModal(blog)} title="Edit">
                                    <FiEdit2 size={14} />
                                </button>
                                <button className="btn-delete" onClick={() => openDeleteModal(blog)} title="Delete">
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Bottom Row: Recent Comments */}
        <div className="dashboard-row full-width">
            <div className="dashboard-card">
              <h2><FiMessageSquare /> Recent Comments</h2>
              <div className="comments-list">
                {recentComments?.length > 0 ? (
                  recentComments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="author">{comment.profiles?.username || 'Admin'}</span>
                        <span className="date">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-blog">
                        <FiFileText size={12} />
                        <span>{comment.blogs?.title}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No comments yet.</p>
                )}
              </div>
            </div>
        </div>
      </div>

      <EditModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={blogToEdit}
        onSave={handleUpdateBlog}
        categories={categories}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBlog}
        title="Delete Blog"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
      />
    </div>
  );
};

export default AdminDashboard;
