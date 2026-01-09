import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats, fetchUsers, addCategory } from '../features/admin/adminSlice';
import { addBlog, fetchCategories, fetchBlogs, deleteBlog, updateBlog, fetchComments } from '../features/blogs/blogsSlice';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiMessageSquare, FiHeart, FiX } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import Avatar from '../components/Avatar';
import '../styles/_admin-dashboard.scss';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, users } = useSelector((state) => state.admin);
  const { categories, items: blogs } = useSelector((state) => state.blogs);
  const { user } = useSelector((state) => state.auth);
  
  const [categoryName, setCategoryName] = useState('');
  
  // State for "Publish New Blog" form
  const [newBlogData, setNewBlogData] = useState({ title: '', content: '', image_url: '', category_id: '', tags: [] });
  const [newBlogTag, setNewBlogTag] = useState('');

  // State for "Edit Blog" modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: null, title: '', content: '', image_url: '', category_id: '', tags: [] });
  const [editBlogTag, setEditBlogTag] = useState('');

  // State for "View Comments" modal
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedBlogForComments, setSelectedBlogForComments] = useState(null);

  // State for "Delete Blog" modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchUsers());
    dispatch(fetchCategories());
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    
    const result = await dispatch(addCategory(categoryName));
    if (!result.error) {
      toast.success('Category added successfully');
      setCategoryName('');
      dispatch(fetchCategories()); // Refresh categories
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
      dispatch(fetchStats()); // Refresh stats
      dispatch(fetchBlogs()); // Refresh list
    } else {
      toast.error(result.payload);
    }
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.content) {
        toast.error('Please fill in required fields');
        return;
    }

    const result = await dispatch(updateBlog({
        id: editFormData.id,
        title: editFormData.title,
        content: editFormData.content,
        image_url: editFormData.image_url,
        category_id: editFormData.category_id,
        tags: editFormData.tags
    }));

    if (!result.error) {
        toast.success('Blog updated successfully');
        setShowEditModal(false);
        dispatch(fetchStats());
        dispatch(fetchBlogs());
    } else {
        toast.error(result.payload);
    }
  };

  const handleEditClick = (blog) => {
    setEditFormData({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        image_url: blog.image_url || '',
        category_id: blog.category_id || '',
        tags: blog.tags || []
    });
    setShowEditModal(true);
  };

  const handleViewComments = (blog) => {
      setSelectedBlogForComments(blog);
      setShowCommentsModal(true);
      // Fetch full comments to ensure we have content
      dispatch(fetchComments(blog.id));
  };

  const handleDeleteClick = (blogId) => {
      setBlogToDelete(blogId);
      setIsDeleteModalOpen(true);
  };

  const confirmDeleteBlog = async () => {
      if (blogToDelete) {
          const result = await dispatch(deleteBlog(blogToDelete));
          if (!result.error) {
              toast.success('Blog deleted successfully');
              dispatch(fetchStats());
          } else {
              toast.error(result.payload);
          }
          setBlogToDelete(null);
      }
  };

  const handleCancelEdit = () => {
      setNewBlogData({ title: '', content: '', image_url: '', category_id: '', tags: [] });
  };

  const handleAddTag = (e, isEdit = false) => {
    e.preventDefault(); 
    const tagInput = isEdit ? editBlogTag : newBlogTag;
    const setTagInput = isEdit ? setEditBlogTag : setNewBlogTag;
    const data = isEdit ? editFormData : newBlogData;
    const setData = isEdit ? setEditFormData : setNewBlogData;

    if (!tagInput.trim()) return;
    if (data.tags.includes(tagInput.trim())) {
        toast.warning('Tag already added');
        return;
    }
    setData({
        ...data,
        tags: [...data.tags, tagInput.trim()]
    });
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove, isEdit = false) => {
    const data = isEdit ? editFormData : newBlogData;
    const setData = isEdit ? setEditFormData : setNewBlogData;
    setData({
        ...data,
        tags: data.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="app-container admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.usersCount}</h3>
          <p>Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats.blogsCount}</h3>
          <p>Blogs</p>
        </div>
        <div className="stat-card">
          <h3>{stats.commentsCount}</h3>
          <p>Comments</p>
        </div>
      </div>

      <div className="admin-section">
        <h2>Add Category</h2>
        <form onSubmit={handleAddCategory}>
          <div className="form-row">
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Category Name" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="admin-input"
              />
            </div>
            <button type="submit" className="btn-primary">Add Category</button>
          </div>
        </form>
      </div>

      <div className="admin-section">
        <div className="section-header">
            <h2>Publish New Blog</h2>
        </div>
        <form onSubmit={handleAddBlog} className="admin-form">
          <input 
            className="admin-input"
            type="text" 
            placeholder="Blog Title" 
            value={newBlogData.title}
            onChange={(e) => setNewBlogData({ ...newBlogData, title: e.target.value })}
            required
          />
          <textarea 
            className="admin-textarea"
            placeholder="Content" 
            value={newBlogData.content}
            onChange={(e) => setNewBlogData({ ...newBlogData, content: e.target.value })}
            required
          />
          <input 
            className="admin-input"
            type="text" 
            placeholder="Image URL" 
            value={newBlogData.image_url}
            onChange={(e) => setNewBlogData({ ...newBlogData, image_url: e.target.value })}
          />
          <select
            className="admin-select"
            value={newBlogData.category_id}
            onChange={(e) => setNewBlogData({ ...newBlogData, category_id: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="tag-input-group">
            <input 
              className="admin-input"
              type="text" 
              placeholder="Add Hashtag" 
              value={newBlogTag}
              onChange={(e) => setNewBlogTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e, false);
                }
              }}
            />
            <button 
                type="button" 
                onClick={(e) => handleAddTag(e, false)}
                className="btn-add-tag"
            >
                +
            </button>
          </div>
          
          <div className="tags-list">
            {newBlogData.tags.map((tag, index) => (
                <span key={index} className="tag-item">
                    #{tag}
                    <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag, false)}
                        className="tag-remove-btn"
                    >
                        ✕
                    </button>
                </span>
            ))}
          </div>

          <button type="submit" className="btn-publish">
            Publish Blog
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h2>Manage Blogs</h2>
        <div className="table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Stats</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {blogs.map(blog => (
                        <tr key={blog.id}>
                            <td className="blog-title-cell" title={blog.title}>
                                {blog.title}
                            </td>
                            <td>{blog.categories?.name || 'Uncategorized'}</td>
                            <td>
                                <div className="stats-cell">
                                    <span className="stat-item" title="Likes">
                                        <FiHeart className="icon-heart" /> {blog.likes?.length || 0}
                                    </span>
                                    <button 
                                        onClick={() => handleViewComments(blog)}
                                        className="btn-view-comments"
                                        title="View Comments"
                                    >
                                        <FiMessageSquare className="icon-comment" /> {blog.comments?.length || 0}
                                    </button>
                                </div>
                            </td>
                            <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                            <td>
                                <div className="actions-cell">
                                    <button 
                                        onClick={() => handleEditClick(blog)}
                                        className="btn-icon btn-edit"
                                        title="Edit"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(blog.id)}
                                        className="btn-icon btn-delete"
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {blogs.length === 0 && (
                        <tr>
                            <td colSpan="5" className="empty-state">No blogs found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <div className="admin-section">
        <h2>Users</h2>
        <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(user => user.role !== 'admin').map(user => (
                  <tr key={user.id}>
                    <td>{user.username || 'N/A'}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Edit Blog Modal */}
      {showEditModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Blog</h2>
                    <button onClick={() => setShowEditModal(false)} className="btn-close">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleUpdateBlog} className="admin-form">
                    <input 
                        className="admin-input"
                        type="text" 
                        placeholder="Blog Title" 
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        required
                    />
                    <textarea 
                        className="admin-textarea"
                        placeholder="Content" 
                        value={editFormData.content}
                        onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                        required
                    />
                    <input 
                        className="admin-input"
                        type="text" 
                        placeholder="Image URL" 
                        value={editFormData.image_url}
                        onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                    />
                    <select
                        className="admin-select"
                        value={editFormData.category_id}
                        onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    
                    <div className="tag-input-group">
                        <input 
                            className="admin-input"
                            type="text" 
                            placeholder="Add Hashtag" 
                            value={editBlogTag}
                            onChange={(e) => setEditBlogTag(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(e, true);
                                }
                            }}
                        />
                        <button 
                            type="button" 
                            onClick={(e) => handleAddTag(e, true)}
                            className="btn-add-tag"
                        >
                            +
                        </button>
                    </div>

                    <div className="tags-list">
                        {editFormData.tags.map((tag, index) => (
                            <span key={index} className="tag-item">
                                #{tag}
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveTag(tag, true)}
                                    className="tag-remove-btn"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">
                            Update Blog
                        </button>
                        <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedBlogForComments && (
        <div className="modal-overlay">
             <div className="modal-content small-modal">
                <div className="modal-header">
                    <h2>Comments for "{selectedBlogForComments.title}"</h2>
                    <button onClick={() => setShowCommentsModal(false)} className="btn-close">
                        <FiX />
                    </button>
                </div>
                
                <div className="comments-list">
                    {blogs.find(b => b.id === selectedBlogForComments.id)?.comments?.map(comment => (
                        comment.content ? (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.profiles?.username || 'Unknown'}</span>
                                    <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="comment-text">{comment.content}</p>
                            </div>
                        ) : null
                    ))}
                    {(!blogs.find(b => b.id === selectedBlogForComments.id)?.comments || blogs.find(b => b.id === selectedBlogForComments.id)?.comments.length === 0) && (
                        <p className="no-comments">No comments found.</p>
                    )}
                </div>
             </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteBlog}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
      />
    </div>
  );
};

export default AdminDashboard;
