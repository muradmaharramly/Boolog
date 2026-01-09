import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../features/blogs/blogsSlice';
import BlogCard from '../components/BlogCard';
import { BeatLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import '../styles/_home.scss';

const Home = () => {
  const dispatch = useDispatch();
  const { items: blogs, loading, error } = useSelector((state) => state.blogs);
  const [visibleNew, setVisibleNew] = useState(3);
  const [visibleFeatured, setVisibleFeatured] = useState(3);

  useEffect(() => {
    if (blogs.length === 0) {
        dispatch(fetchBlogs());
    }
  }, [dispatch, blogs.length]);

  const newBlogs = [...blogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const featuredBlogs = [...blogs].sort((a, b) => {
    const engagementA = (a.likes?.length || 0) + (a.comments?.length || 0);
    const engagementB = (b.likes?.length || 0) + (b.comments?.length || 0);
    return engagementB - engagementA;
  });

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h1>Boolog</h1>
        <p>The Modern IT Blog Platform for Developers, by Developers.</p>
        <div className="cta-buttons">
            <Link to="/blogs" className="primary-btn">
                Start Reading <FiArrowRight />
            </Link>
            <Link to="/register" className="secondary-btn">
                Join Community
            </Link>
        </div>
      </section>

      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          Error: {error}
        </div>
      )}

      {loading && blogs.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <BeatLoader color="#58a6ff" />
        </div>
      ) : (
        <>
            {/* New Blogs Section */}
            <section className="blogs-section">
                <h2 className="section-title new">New Blogs</h2>
                <div className="blogs-grid">
                    {newBlogs.slice(0, visibleNew).map(blog => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                </div>
                {visibleNew < newBlogs.length && (
                    <div className="load-more-container">
                        <button onClick={() => setVisibleNew(prev => prev + 3)} style={{ color: '#58a6ff' }}>
                            Load More
                        </button>
                    </div>
                )}
            </section>

            {/* Featured Blogs Section */}
            <section className="blogs-section">
                <h2 className="section-title featured">Featured Blogs</h2>
                <div className="blogs-grid">
                    {featuredBlogs.slice(0, visibleFeatured).map(blog => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                </div>
                {visibleFeatured < featuredBlogs.length && (
                    <div className="load-more-container">
                        <button onClick={() => setVisibleFeatured(prev => prev + 3)} style={{ color: '#238636' }}>
                            Load More
                        </button>
                    </div>
                )}
            </section>
        </>
      )}

      {/* CTA Section */}
      <section className="cta">
          <h2>Ready to share your story?</h2>
          <p>Join thousands of developers sharing their knowledge on Boolog.</p>
          <Link to="/register" className="cta-btn">
              Get Started for Free
          </Link>
      </section>
    </div>
  );
};

export default Home;
