import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, fetchCategories } from '../features/blogs/blogsSlice';
import BlogCard from '../components/BlogCard';
import { BeatLoader } from 'react-spinners';
import { FiSearch } from 'react-icons/fi';
import '../styles/_blogs.scss';

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

  return (
    <div className="blogs-container">
      <div className="header-section">
        <h1>All Blogs</h1>
        <p>Explore our collection of articles, tutorials, and insights.</p>
      </div>

      <div className="filters">
        <div className="search-wrapper">
            <FiSearch />
            <input 
                type="text" 
                placeholder="Search blogs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
        >
            <option value="all">All Categories</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <BeatLoader color="#58a6ff" />
        </div>
      ) : (
        <div className="blogs-grid">
          {filteredBlogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
          {filteredBlogs.length === 0 && (
             <p className="no-blogs">No blogs found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;
