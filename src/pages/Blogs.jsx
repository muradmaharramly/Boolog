import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, fetchCategories } from '../features/blogs/blogsSlice';
import BlogCard from '../components/BlogCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi'; // Added FiFilter
import '../styles/_blogs.scss';
import { BsStars } from 'react-icons/bs';

const Blogs = () => {
  const dispatch = useDispatch();
  const { items: blogs, categories, loading, error } = useSelector((state) => state.blogs);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    dispatch(fetchBlogs());
    dispatch(fetchCategories());

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const filteredBlogs = blogs.filter(blog => {
    const matchCategory = selectedCategory === 'all' || blog.category_id === parseInt(selectedCategory);
    const lowerSearch = searchTerm.toLowerCase();
    const matchSearch = blog.title.toLowerCase().includes(lowerSearch) || 
                        blog.content.toLowerCase().includes(lowerSearch) ||
                        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(lowerSearch)));
    return matchCategory && matchSearch;
  });

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsDropdownOpen(false);
  };

  const getCategoryName = (id) => {
    if (id === 'all') return 'All Categories';
    const cat = categories.find(c => c.id == id);
    return cat ? cat.name : 'All Categories';
  };

  const handleRetry = () => {
    dispatch(fetchBlogs());
    dispatch(fetchCategories());
  };

  return (
    <div className="blogs-container">
      <div className="header-section">
      <span className="blogs-badge"><BsStars />Our blogs page</span>
        <h1>
            Look at our <span className="highlight">Blogs</span> <br />
          </h1>
        <p>Discover articles, tutorials, and insights from the developer community.</p>
      </div>

      <div className="filters">
        <div className="search-wrapper">
            <FiSearch />
            <input 
                type="text" 
                placeholder="Search articles, topics..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="select-wrapper" ref={dropdownRef}>
            <div 
                className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <FiFilter className="select-icon" />
                <span>{getCategoryName(selectedCategory)}</span>
                <FiChevronDown className="chevron-icon" />
            </div>
            
            {isDropdownOpen && (
                <div className="custom-select-options">
                    <div 
                        className={`option ${selectedCategory === 'all' ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect('all')}
                    >
                        All Categories
                    </div>
                    {categories.map(cat => (
                        <div 
                            key={cat.id} 
                            className={`option ${selectedCategory == cat.id ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect(cat.id)}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {loading ? (
        <LoadingScreen message="Loading articles..." />
      ) : error ? (
        <ErrorState message={`Error loading blogs: ${error}`} onRetry={handleRetry} />
      ) : filteredBlogs.length === 0 ? (
        <EmptyState 
            title="No articles found" 
            message="Try adjusting your search or category filter." 
        />
      ) : (
        <div className="blogs-grid">
          {filteredBlogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
