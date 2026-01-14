import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStats, fetchUsers, addCategory, fetchRecentComments, deleteUser, updateUser } from '../features/admin/adminSlice';
import { addBlog, fetchCategories, fetchBlogs, deleteBlog, updateBlog, deleteComment } from '../features/blogs/blogsSlice';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiBarChart2, FiUsers, FiFileText, FiActivity, FiPlus, FiX, FiTag, FiMessageSquare, FiClock, FiChevronDown, FiTrash, FiMail, FiLink, FiCopy, FiSearch, FiFilter } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import EditModal from '../components/EditModal';
import UserEditModal from '../components/UserEditModal';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/_admin-dashboard.scss';
import { GoPlus } from 'react-icons/go';
import { LuExternalLink } from 'react-icons/lu';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
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

    // State for "Edit User" modal
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    // State for "Delete User" modal
    const [isUserDeleteModalOpen, setIsUserDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // State for "Delete Comment" modal
    const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    // User Search & Filter State
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userFilterType, setUserFilterType] = useState('new');
    const [isUserFilterDropdownOpen, setIsUserFilterDropdownOpen] = useState(false);
    const userFilterDropdownRef = React.useRef(null);

    // Comment Search & Filter State
    const [commentSearchQuery, setCommentSearchQuery] = useState('');
    const [commentFilterType, setCommentFilterType] = useState('new');
    const [isCommentFilterDropdownOpen, setIsCommentFilterDropdownOpen] = useState(false);
    const commentFilterDropdownRef = React.useRef(null);

    // Blog Search & Filter State
    const [blogSearchQuery, setBlogSearchQuery] = useState('');
    const [blogFilterType, setBlogFilterType] = useState('all');
    const [isBlogFilterDropdownOpen, setIsBlogFilterDropdownOpen] = useState(false);
    const blogFilterDropdownRef = React.useRef(null);

    const [isMobile, setIsMobile] = useState(false);
    const [blogCurrentPage, setBlogCurrentPage] = useState(1);
    const [commentCurrentPage, setCommentCurrentPage] = useState(1);
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const blogPageSize = 5;
    const commentPageSize = 5;
    const userPageSize = 10;

    const usersWithPoints = React.useMemo(() => {
        return users.map(u => {
            const userCommentsCount = recentComments?.filter(c => c.user_id === u.id).length || 0;
            const points = (userCommentsCount * 10) + 50;
            return { ...u, points };
        });
    }, [users, recentComments]);

    const filteredUsers = usersWithPoints.filter(u => {
        const query = userSearchQuery.toLowerCase();
        return (
            (u.username || '').toLowerCase().includes(query) ||
            (u.email || '').toLowerCase().includes(query)
        );
    }).sort((a, b) => {
        if (userFilterType === 'new') return new Date(b.created_at) - new Date(a.created_at);
        if (userFilterType === 'old') return new Date(a.created_at) - new Date(b.created_at);
        if (userFilterType === 'popular') return b.points - a.points;
        return 0;
    });

    const getUserFilterLabel = (type) => {
        switch (type) {
            case 'new': return 'Newest';
            case 'old': return 'Oldest';
            case 'popular': return 'Most Popular';
            default: return 'Newest';
        }
    };

    const getCommentFilterLabel = (type) => {
        switch (type) {
            case 'new': return 'Newest';
            case 'old': return 'Oldest';
            default: return 'Newest';
        }
    };

    const getBlogFilterLabel = (value) => {
        switch (value) {
            case 'a-z': return 'A-Z';
            case 'z-a': return 'Z-A';
            case 'most-popular': return 'Most Popular';
            case 'new-old': return 'New to Old';
            case 'old-new': return 'Old to New';
            case 'most-discussed': return 'Most Discussed';
            case 'all': default: return 'All';
        }
    };

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

    const filteredBlogs = React.useMemo(() => {
        if (!blogs) return [];

        const lowerSearch = blogSearchQuery.toLowerCase();
        const searchedBlogs = blogs.filter(blog =>
            (blog.title || '').toLowerCase().includes(lowerSearch) ||
            (blog.content || '').toLowerCase().includes(lowerSearch) ||
            (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
        );

        const getLikesCount = (blog) => blog?.likes?.length || 0;
        const getCommentsCount = (blog) => blog?.comments?.length || 0;
        const getCreatedAt = (blog) => {
            const ts = new Date(blog?.created_at).getTime();
            return Number.isFinite(ts) ? ts : 0;
        };
        const getTitle = (blog) => (blog?.title || '').toString();

        const list = [...searchedBlogs];

        switch (blogFilterType) {
            case 'a-z':
                return list.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
            case 'z-a':
                return list.sort((a, b) => getTitle(b).localeCompare(getTitle(a)));
            case 'most-popular':
                return list.sort((a, b) => getLikesCount(b) - getLikesCount(a));
            case 'new-old':
                return list.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
            case 'old-new':
                return list.sort((a, b) => getCreatedAt(a) - getCreatedAt(b));
            case 'most-discussed':
                return list.sort((a, b) => getCommentsCount(b) - getCommentsCount(a));
            default:
                return list;
        }
    }, [blogs, blogSearchQuery, blogFilterType]);

    const filteredComments = React.useMemo(() => {
        if (!recentComments) return [];

        return recentComments.filter(c => {
            const query = commentSearchQuery.toLowerCase();
            return (
                (c.content || '').toLowerCase().includes(query) ||
                (c.profiles?.username || 'Admin').toLowerCase().includes(query)
            );
        }).sort((a, b) => {
            if (commentFilterType === 'new') return new Date(b.created_at) - new Date(a.created_at);
            if (commentFilterType === 'old') return new Date(a.created_at) - new Date(b.created_at);
            return 0;
        });
    }, [recentComments, commentSearchQuery, commentFilterType]);

    const blogTotalPages = Math.max(1, Math.ceil(filteredBlogs.length / blogPageSize));
    const paginatedBlogs = React.useMemo(() => {
        const start = (blogCurrentPage - 1) * blogPageSize;
        return filteredBlogs.slice(start, start + blogPageSize);
    }, [filteredBlogs, blogCurrentPage]);

    const commentTotalPages = Math.max(1, Math.ceil(filteredComments.length / commentPageSize));
    const paginatedComments = React.useMemo(() => {
        const start = (commentCurrentPage - 1) * commentPageSize;
        return filteredComments.slice(start, start + commentPageSize);
    }, [filteredComments, commentCurrentPage]);

    const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
    const paginatedUsers = React.useMemo(() => {
        const start = (userCurrentPage - 1) * userPageSize;
        return filteredUsers.slice(start, start + userPageSize);
    }, [filteredUsers, userCurrentPage]);

    const getPaginationItems = (currentPage, totalPages) => {
        const items = [];
        if (isMobile) {
            if (totalPages <= 3) {
                for (let i = 1; i <= totalPages; i += 1) {
                    items.push(i);
                }
                return items;
            }

            items.push(1);

            if (currentPage <= 2) {
                items.push(2, 'dots', totalPages);
                return items;
            }

            if (currentPage >= totalPages - 1) {
                items.push('dots', totalPages - 1, totalPages);
                return items;
            }

            items.push('dots', currentPage, 'dots', totalPages);
            return items;
        }

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i += 1) {
                items.push(i);
            }
            return items;
        }

        items.push(1);

        if (currentPage <= 3) {
            items.push(2, 3, 4, 'dots');
            items.push(totalPages);
            return items;
        }

        if (currentPage >= totalPages - 2) {
            items.push('dots');
            for (let i = totalPages - 3; i <= totalPages; i += 1) {
                items.push(i);
            }
            return items;
        }

        items.push('dots', currentPage, currentPage + 1, currentPage + 2, 'dots', totalPages);
        return items;
    };

    const goToBlogPage = (page) => {
        if (page < 1 || page > blogTotalPages) return;
        setBlogCurrentPage(page);
    };

    const goToCommentPage = (page) => {
        if (page < 1 || page > commentTotalPages) return;
        setCommentCurrentPage(page);
    };

    const goToUserPage = (page) => {
        if (page < 1 || page > userTotalPages) return;
        setUserCurrentPage(page);
    };

    const totalViews = blogs.reduce(
        (acc, blog) => acc + getSyntheticViews(blog?.id ?? blog?.title, blog?.created_at),
        0
    );

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
            if (userFilterDropdownRef.current && !userFilterDropdownRef.current.contains(event.target)) {
                setIsUserFilterDropdownOpen(false);
            }
            if (commentFilterDropdownRef.current && !commentFilterDropdownRef.current.contains(event.target)) {
                setIsCommentFilterDropdownOpen(false);
            }
            if (blogFilterDropdownRef.current && !blogFilterDropdownRef.current.contains(event.target)) {
                setIsBlogFilterDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dispatch]);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 640);
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    useEffect(() => {
        setBlogCurrentPage(1);
    }, [blogSearchQuery, blogFilterType]);

    useEffect(() => {
        setCommentCurrentPage(1);
    }, [commentSearchQuery, commentFilterType]);

    useEffect(() => {
        setUserCurrentPage(1);
    }, [userSearchQuery, userFilterType]);

    const handleUpdateUser = async (formData) => {
        const result = await dispatch(updateUser(formData));
        if (!result.error) {
            toast.success('User updated successfully');
            setShowUserEditModal(false);
            setUserToEdit(null);
            dispatch(fetchUsers());
        } else {
            toast.error(result.payload);
        }
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            const result = await dispatch(deleteUser(userToDelete.id));
            if (!result.error) {
                toast.success('User deleted successfully');
                dispatch(fetchUsers());
            } else {
                toast.error(result.payload);
            }
            setIsUserDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const openUserDeleteModal = (user) => {
        setUserToDelete(user);
        setIsUserDeleteModalOpen(true);
    };

    const openUserEditModal = (user) => {
        setUserToEdit(user);
        setShowUserEditModal(true);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Link copied to clipboard!');
        }, (err) => {
            toast.error('Could not copy text: ', err);
        });
    };

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

    const handleDeleteComment = async () => {
        if (commentToDelete) {
            const result = await dispatch(deleteComment({ commentId: commentToDelete.id, blogId: commentToDelete.blog_id }));
            if (!result.error) {
                toast.success('Comment removed successfully');
                dispatch(fetchStats());
                dispatch(fetchRecentComments());
            } else {
                toast.error(result.payload);
            }
            setCommentToDelete(null);
        }
    };

    const openCommentDeleteModal = (comment) => {
        setCommentToDelete(comment);
        setIsCommentDeleteModalOpen(true);
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
        return <LoadingScreen fullPage />;
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
                        <h3>{formatViews(totalViews)}</h3>
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
                        <div className="card-header-actions">
                            <h2><FiFileText /> Manage Articles</h2>

                            <div className="controls">
                                {/* Search */}
                                <div className="search-box">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search articles..."
                                        value={blogSearchQuery}
                                        onChange={(e) => setBlogSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Filter */}
                                <div className="custom-select-wrapper" ref={blogFilterDropdownRef}>
                                    <div
                                        className={`custom-select-trigger ${isBlogFilterDropdownOpen ? 'open' : ''}`}
                                        onClick={() => setIsBlogFilterDropdownOpen(!isBlogFilterDropdownOpen)}
                                    >
                                        <FiFilter className="select-icon" />
                                        <span>{getBlogFilterLabel(blogFilterType)}</span>
                                        <FiChevronDown className="chevron-icon" />
                                    </div>

                                    {isBlogFilterDropdownOpen && (
                                        <div className="custom-select-options">
                                            <div
                                                className={`option ${blogFilterType === 'all' ? 'selected' : ''}`}
                                                onClick={() => { setBlogFilterType('all'); setIsBlogFilterDropdownOpen(false); }}
                                            >
                                                All
                                            </div>
                                            <div
                                                className={`option ${blogFilterType === 'a-z' ? 'selected' : ''}`}
                                                onClick={() => { setBlogFilterType('a-z'); setIsBlogFilterDropdownOpen(false); }}
                                            >
                                                A-Z
                                            </div>
                                            <div
                                                className={`option ${blogFilterType === 'z-a' ? 'selected' : ''}`}
                                                onClick={() => { setBlogFilterType('z-a'); setIsBlogFilterDropdownOpen(false); }}
                                            >
                                                Z-A
                                            </div>
                                            <div
                                                className={`option ${blogFilterType === 'most-popular' ? 'selected' : ''}`}
                                                onClick={() => { setBlogFilterType('most-popular'); setIsBlogFilterDropdownOpen(false); }}
                                            >
                                                Most Popular
                                            </div>
                                            <div
                                                className={`option ${blogFilterType === 'new-old' ? 'selected' : ''}`}
                                                onClick={() => { setBlogFilterType('new-old'); setIsBlogFilterDropdownOpen(false); }}
                                            >
                                                New to Old
                                            </div>
                                            <div
                                                className={`option ${blogFilterType === 'old-new' ? 'selected' : ''}`}
                                                onClick={() => { setBlogFilterType('old-new'); setIsBlogFilterDropdownOpen(false); }}
                                            >
                                                Old to New
                                            </div>
                                            <div
                                                className={`option ${blogFilterType === 'most-discussed' ? 'selected' : ''}`}
                                                onClick={() => { setBlogFilterType('most-discussed'); setIsBlogFilterDropdownOpen(false); }}
                                            >
                                                Most Discussed
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="blog-list">
                            {paginatedBlogs.length > 0 ? (
                                paginatedBlogs.map(blog => (
                                    <div key={blog.id} className="blog-list-item">
                                        {blog.image_url && (
                                            <img src={blog.image_url} alt={blog.title} className="blog-thumb" />
                                        )}
                                        <div className="item-info">
                                            <h4>{blog.title}</h4>
                                            <div className="meta">
                                                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                                <span>• {blog.categories?.name}</span>
                                                <span>• {formatViews(getSyntheticViews(blog?.id ?? blog?.title, blog?.created_at))} views</span>
                                                <span>• {(blog.likes?.length || 0)} likes</span>
                                                <span>• {(blog.comments?.length || 0)} comments</span>
                                            </div>
                                        </div>
                                        <div className="item-actions">
                                            <button className="btn-visit" onClick={() => navigate(`/blog/${blog.id}`)} title="Visit article">
                                                <LuExternalLink size={14} />
                                            </button>
                                            <button className="btn-edit" onClick={() => openEditModal(blog)} title="Edit">
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button className="btn-delete" onClick={() => openDeleteModal(blog)} title="Delete">
                                                <FiTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No articles found.</p>
                            )}
                        </div>
                        {filteredBlogs.length > blogPageSize && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => goToBlogPage(blogCurrentPage - 1)}
                                    disabled={blogCurrentPage === 1}
                                >
                                    <IoIosArrowBack />
                                </button>
                                {getPaginationItems(blogCurrentPage, blogTotalPages).map((item, idx) => {
                                    if (item === 'dots') {
                                        return (
                                            <button key={`blog-dots-${idx}`} className="page-btn" disabled>
                                                ...
                                            </button>
                                        );
                                    }
                                    const page = item;
                                    return (
                                        <button
                                            key={`blog-page-${page}`}
                                            className={`page-btn ${page === blogCurrentPage ? 'active' : ''}`}
                                            onClick={() => goToBlogPage(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    className="page-btn"
                                    onClick={() => goToBlogPage(blogCurrentPage + 1)}
                                    disabled={blogCurrentPage === blogTotalPages}
                                >
                                    <IoIosArrowForward />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Recent Comments */}
                <div className="dashboard-row full-width">
                    <div className="dashboard-card">
                        <div className="card-header-actions">
                            <h2><FiMessageSquare /> Recent Comments</h2>

                            <div className="controls">
                                {/* Search */}
                                <div className="search-box">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search comments..."
                                        value={commentSearchQuery}
                                        onChange={(e) => setCommentSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Filter */}
                                <div className="custom-select-wrapper" ref={commentFilterDropdownRef}>
                                    <div
                                        className={`custom-select-trigger ${isCommentFilterDropdownOpen ? 'open' : ''}`}
                                        onClick={() => setIsCommentFilterDropdownOpen(!isCommentFilterDropdownOpen)}
                                    >
                                        <FiFilter className="select-icon" />
                                        <span>{getCommentFilterLabel(commentFilterType)}</span>
                                        <FiChevronDown className="chevron-icon" />
                                    </div>

                                    {isCommentFilterDropdownOpen && (
                                        <div className="custom-select-options">
                                            <div
                                                className={`option ${commentFilterType === 'new' ? 'selected' : ''}`}
                                                onClick={() => { setCommentFilterType('new'); setIsCommentFilterDropdownOpen(false); }}
                                            >
                                                Newest
                                            </div>
                                            <div
                                                className={`option ${commentFilterType === 'old' ? 'selected' : ''}`}
                                                onClick={() => { setCommentFilterType('old'); setIsCommentFilterDropdownOpen(false); }}
                                            >
                                                Oldest
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="comments-list">
                            {paginatedComments.length > 0 ? (
                                paginatedComments.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-header">
                                            <span className="author">{comment.profiles?.username || 'Admin'}</span>
                                            <span className="date">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="comment-text">{comment.content}</p>
                                        <div className='comment-ending'>
                                            <div className="comment-blog">
                                                <FiFileText size={12} />
                                                <span>{comment.blogs?.title}</span>
                                            </div>
                                            <button
                                                className="btn-delete"
                                                onClick={() => openCommentDeleteModal(comment)}
                                                title="Remove comment"
                                            >
                                                <FiTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No comments found.</p>
                            )}
                        </div>
                        {filteredComments.length > commentPageSize && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => goToCommentPage(commentCurrentPage - 1)}
                                    disabled={commentCurrentPage === 1}
                                >
                                    <IoIosArrowBack />
                                </button>
                                {getPaginationItems(commentCurrentPage, commentTotalPages).map((item, idx) => {
                                    if (item === 'dots') {
                                        return (
                                            <button key={`comment-dots-${idx}`} className="page-btn" disabled>
                                                ...
                                            </button>
                                        );
                                    }
                                    const page = item;
                                    return (
                                        <button
                                            key={`comment-page-${page}`}
                                            className={`page-btn ${page === commentCurrentPage ? 'active' : ''}`}
                                            onClick={() => goToCommentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    className="page-btn"
                                    onClick={() => goToCommentPage(commentCurrentPage + 1)}
                                    disabled={commentCurrentPage === commentTotalPages}
                                >
                                    <IoIosArrowForward />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Users Section */}
                <div className="dashboard-row full-width">
                    <div className="dashboard-card">
                        <div className="card-header-actions">
                            <h2><FiUsers /> Users</h2>

                            <div className="controls">
                                {/* Search */}
                                <div className="search-box">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Filter */}
                                <div className="custom-select-wrapper" ref={userFilterDropdownRef}>
                                    <div
                                        className={`custom-select-trigger ${isUserFilterDropdownOpen ? 'open' : ''}`}
                                        onClick={() => setIsUserFilterDropdownOpen(!isUserFilterDropdownOpen)}
                                    >
                                        <FiFilter className="select-icon" />
                                        <span>{getUserFilterLabel(userFilterType)}</span>
                                        <FiChevronDown className="chevron-icon" />
                                    </div>

                                    {isUserFilterDropdownOpen && (
                                        <div className="custom-select-options">
                                            <div
                                                className={`option ${userFilterType === 'new' ? 'selected' : ''}`}
                                                onClick={() => { setUserFilterType('new'); setIsUserFilterDropdownOpen(false); }}
                                            >
                                                Newest
                                            </div>
                                            <div
                                                className={`option ${userFilterType === 'old' ? 'selected' : ''}`}
                                                onClick={() => { setUserFilterType('old'); setIsUserFilterDropdownOpen(false); }}
                                            >
                                                Oldest
                                            </div>
                                            <div
                                                className={`option ${userFilterType === 'popular' ? 'selected' : ''}`}
                                                onClick={() => { setUserFilterType('popular'); setIsUserFilterDropdownOpen(false); }}
                                            >
                                                Most Popular
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Points</th>
                                        <th>Public Profile</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        paginatedUsers.map(u => {
                                            const publicProfileUrl = `${window.location.origin}/user/${u.username}`;

                                            return (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-info-cell">
                                                            <img
                                                                src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                                                                alt={u.username}
                                                                className="user-avatar-mini"
                                                            />
                                                            <span>{u.username}</span>
                                                        </div>
                                                    </td>
                                                    <td>{u.email || 'N/A'}</td>
                                                    <td>{u.points}</td>
                                                    <td>
                                                        <div className="profile-link-cell">
                                                            <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer">
                                                                {publicProfileUrl}
                                                            </a>
                                                            <button className="btn-icon-small" onClick={() => copyToClipboard(publicProfileUrl)} title="Copy Link">
                                                                <FiCopy size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <button className="btn-edit" onClick={() => openUserEditModal(u)} title="Edit">
                                                                <FiEdit2 />
                                                            </button>
                                                            <button className="btn-delete" onClick={() => openUserDeleteModal(u)} title="Delete">
                                                                <FiTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length > userPageSize && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => goToUserPage(userCurrentPage - 1)}
                                    disabled={userCurrentPage === 1}
                                >
                                    <IoIosArrowBack />
                                </button>
                                {getPaginationItems(userCurrentPage, userTotalPages).map((item, idx) => {
                                    if (item === 'dots') {
                                        return (
                                            <button key={`user-dots-${idx}`} className="page-btn" disabled>
                                                ...
                                            </button>
                                        );
                                    }
                                    const page = item;
                                    return (
                                        <button
                                            key={`user-page-${page}`}
                                            className={`page-btn ${page === userCurrentPage ? 'active' : ''}`}
                                            onClick={() => goToUserPage(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    className="page-btn"
                                    onClick={() => goToUserPage(userCurrentPage + 1)}
                                    disabled={userCurrentPage === userTotalPages}
                                >
                                    <IoIosArrowForward />
                                </button>
                            </div>
                        )}
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

            <UserEditModal
                isOpen={showUserEditModal}
                onClose={() => setShowUserEditModal(false)}
                initialData={userToEdit}
                onSave={handleUpdateUser}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteBlog}
                title="Delete Blog"
                message="Are you sure you want to delete this blog post? This action cannot be undone."
            />

            <ConfirmModal
                isOpen={isUserDeleteModalOpen}
                onClose={() => setIsUserDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`}
            />

            <ConfirmModal
                isOpen={isCommentDeleteModalOpen}
                onClose={() => setIsCommentDeleteModalOpen(false)}
                onConfirm={handleDeleteComment}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
            />
        </div>
    );
};

export default AdminDashboard;
