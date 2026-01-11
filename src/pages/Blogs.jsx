import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, fetchCategories } from '../features/blogs/blogsSlice';
import BlogCard from '../components/BlogCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { FiSearch, FiFilter } from 'react-icons/fi'; // Added FiFilter
import '../styles/_blogs.scss';
import { BsStars } from 'react-icons/bs';

const Blogs = () => {
  const dispatch = useDispatch();
  const { items: blogs, categories, loading, error } = useSelector((state) => state.blogs);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchBlogs());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredBlogs = blogs.filter(blog => {
    const matchCategory = selectedCategory === 'all' || blog.category_id === parseInt(selectedCategory);
    const lowerSearch = searchTerm.toLowerCase();
    const matchSearch = blog.title.toLowerCase().includes(lowerSearch) || 
                        blog.content.toLowerCase().includes(lowerSearch) ||
                        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(lowerSearch)));
    return matchCategory && matchSearch;
  });

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
        
        <div className="select-wrapper">
            <FiFilter className="select-icon" />
            <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
            >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
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
