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
  const [sortOption, setSortOption] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = React.useRef(null);

  useEffect(() => {
    dispatch(fetchBlogs());
    dispatch(fetchCategories());

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
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

  const handleSortSelect = (value) => {
    setSortOption(value);
    setIsSortDropdownOpen(false);
  };

  const getCategoryName = (id) => {
    if (id === 'all') return 'All Categories';
    const cat = categories.find(c => c.id == id);
    return cat ? cat.name : 'All Categories';
  };

  const getSortLabel = (value) => {
    switch (value) {
      case 'a-z':
        return 'A-Z';
      case 'z-a':
        return 'Z-A';
      case 'most-popular':
        return 'Most Popular';
      case 'new-old':
        return 'New to Old';
      case 'old-new':
        return 'Old to New';
      case 'most-discussed':
        return 'Most Discussed';
      case 'all':
      default:
        return 'All';
    }
  };

  const sortedBlogs = (() => {
    if (sortOption === 'all') return filteredBlogs;

    const getLikesCount = (blog) => blog?.likes?.length || 0;
    const getCommentsCount = (blog) => blog?.comments?.length || 0;
    const getCreatedAt = (blog) => {
      const ts = new Date(blog?.created_at).getTime();
      return Number.isFinite(ts) ? ts : 0;
    };
    const getTitle = (blog) => (blog?.title || '').toString();

    const list = [...filteredBlogs];

    switch (sortOption) {
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
  })();

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
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsSortDropdownOpen(false);
                }}
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

        <div className="select-wrapper" ref={sortDropdownRef}>
            <div 
                className={`custom-select-trigger ${isSortDropdownOpen ? 'open' : ''}`} 
                onClick={() => {
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                  setIsDropdownOpen(false);
                }}
            >
                <FiFilter className="select-icon" />
                <span>{getSortLabel(sortOption)}</span>
                <FiChevronDown className="chevron-icon" />
            </div>
            
            {isSortDropdownOpen && (
                <div className="custom-select-options">
                    <div 
                        className={`option ${sortOption === 'all' ? 'selected' : ''}`}
                        onClick={() => handleSortSelect('all')}
                    >
                        All
                    </div>
                    <div 
                        className={`option ${sortOption === 'a-z' ? 'selected' : ''}`}
                        onClick={() => handleSortSelect('a-z')}
                    >
                        A-Z
                    </div>
                    <div 
                        className={`option ${sortOption === 'z-a' ? 'selected' : ''}`}
                        onClick={() => handleSortSelect('z-a')}
                    >
                        Z-A
                    </div>
                    <div 
                        className={`option ${sortOption === 'most-popular' ? 'selected' : ''}`}
                        onClick={() => handleSortSelect('most-popular')}
                    >
                        Most Popular
                    </div>
                    <div 
                        className={`option ${sortOption === 'new-old' ? 'selected' : ''}`}
                        onClick={() => handleSortSelect('new-old')}
                    >
                        New to Old
                    </div>
                    <div 
                        className={`option ${sortOption === 'old-new' ? 'selected' : ''}`}
                        onClick={() => handleSortSelect('old-new')}
                    >
                        Old to New
                    </div>
                    <div 
                        className={`option ${sortOption === 'most-discussed' ? 'selected' : ''}`}
                        onClick={() => handleSortSelect('most-discussed')}
                    >
                        Most Discussed
                    </div>
                </div>
            )}
        </div>
      </div>

      {loading ? (
        <LoadingScreen message="Loading articles..." />
      ) : error ? (
        <ErrorState message={`Error loading blogs: ${error}`} onRetry={handleRetry} />
      ) : sortedBlogs.length === 0 ? (
        <EmptyState 
            title="No articles found" 
            message="Try adjusting your search or category filter." 
        />
      ) : (
        <div className="blogs-grid">
          {sortedBlogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
