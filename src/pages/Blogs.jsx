import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, fetchCategories } from '../features/blogs/blogsSlice';
import BlogCard from '../components/BlogCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { FiSearch, FiFilter, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import '../styles/_blogs.scss';
import { BsStars } from 'react-icons/bs';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const Blogs = () => {
  const dispatch = useDispatch();
  const { items: blogs, categories, loading, error } = useSelector((state) => state.blogs);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = React.useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const pageSize = 6;

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

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 640);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const totalPages = Math.max(1, Math.ceil(sortedBlogs.length / pageSize));
  const paginatedBlogs = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBlogs.slice(start, start + pageSize);
  }, [sortedBlogs, currentPage]);

  const getPaginationItems = () => {
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
    } else {
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
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleRetry = () => {
    dispatch(fetchBlogs());
    dispatch(fetchCategories());
  };

  return (
    <div className="blogs-container">
      <div className="header-section">
      <span className="section-badge"><BsStars />Our blogs page</span>
        <h1>
            Look at our <span className="highlight">Blogs</span> <br />
          </h1>
        <p>Discover articles, tutorials, and insights from the developer community.</p>
      </div>

      <div className="filters">
        <div className="search-box">
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

        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <FiGrid />
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
            aria-pressed={viewMode === 'list'}
          >
            <FiList />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <ErrorState message={`Error loading blogs: ${error}`} onRetry={handleRetry} />
      ) : sortedBlogs.length === 0 ? (
        <EmptyState 
            title="No articles found" 
            message="Try adjusting your search or category filter." 
        />
      ) : (
        <div className={viewMode === 'list' ? 'blogs-list' : 'blogs-grid'}>
          {paginatedBlogs.map(blog => (
            <BlogCard
              key={blog.id}
              blog={blog}
              viewMode={viewMode}
              from="blogs"
            />
          ))}
        </div>
      )}
      {!loading && !error && sortedBlogs.length > pageSize && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <IoIosArrowBack />
          </button>
          {getPaginationItems().map((item, idx) => {
            if (item === 'dots') {
              return (
                <button key={`dots-${idx}`} className="page-btn" disabled>
                  ...
                </button>
              );
            }
            const page = item;
            return (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            );
          })}
          <button
            className="page-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <IoIosArrowForward />
          </button>
        </div>
      )}
    </div>
  );
};

export default Blogs;
