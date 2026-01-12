import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../features/blogs/blogsSlice';
import BlogCard from '../components/BlogCard';
import CTASection from '../components/CTASection';
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCode, FiLayout, FiZap, FiUsers, FiTrendingUp, FiHeart, FiMessageSquare } from 'react-icons/fi';
import '../styles/_home.scss';
import { BsStars } from 'react-icons/bs';
import ActiveUsers from '../components/ActiveUsers';
import FaqSection from '../components/FaqSection';

const Home = () => {
  const dispatch = useDispatch();
  const { items: blogs, loading } = useSelector((state) => state.blogs);

  useEffect(() => {
    if (blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [dispatch, blogs.length]);

  // Get latest 3 blogs
  const latestBlogs = [...blogs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  // Get most liked blogs (top 3)
  const mostLikedBlogs = [...blogs]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 3);

  // Get most commented blogs (top 3)
  const mostCommentedBlogs = [...blogs]
    .sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
    .slice(0, 3);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge"><BsStars /> The Future of Tech Blogging</span>
          <h1>
            Discover the <span className="highlight">Universe</span> <br />
            of Technology
          </h1>
          <p>
            The modern platform for developers, designers, and tech enthusiasts.
            Deep dives, tutorials, and insights for the digital age.
          </p>
          <div className="cta-buttons">
            <Link to="/blogs" className="btn-primary">
              Start Reading <FiArrowRight />
            </Link>
            <Link to="/register" className="btn-secondary">
              Join Community
            </Link>
          </div>
        </div>
      </section>

      <ActiveUsers />

      {/* Bento Grid Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-title">
            <h2>Why <span className="highlight">Boolog</span></h2>
            <p>Built for the modern web ecosystem.</p>
          </div>

          <div className="bento-grid">
            {/* Item 1: Large Feature */}
            <div className="bento-item span-2">
              <h3>Engineering Excellence</h3>
              <p>Deep dives into scalable architecture, clean code practices, and modern stack choices.</p>
              <FiCode className="icon-bg" />
            </div>

            {/* Item 2: Tall Feature */}
            <div className="bento-item tall">
              <h3>Peak Performance</h3>
              <p>Optimized for speed. Experience the lightning fast rendering and seamless transitions of our platform.</p>

              <div className="performance-stats">
                <div className="stat-row">
                  <span className="stat-label">Lighthouse Score</span>
                  <div className="stat-bar"><div className="fill" style={{ width: '98%' }}></div></div>
                  <span className="stat-value">98/100</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">First Contentful Paint</span>
                  <div className="stat-bar"><div className="fill" style={{ width: '95%' }}></div></div>
                  <span className="stat-value">0.4s</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">SEO Optimization</span>
                  <div className="stat-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                  <span className="stat-value">100%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Content Readability</span>
                  <div className="stat-bar">
                    <div className="fill" style={{ width: '92%' }}></div>
                  </div>
                  <span className="stat-value">92%</span>
                </div>

              </div>

              <FiZap className="icon-bg" />
            </div>

            {/* Item 3: Standard Feature */}
            <div className="bento-item">
              <h3>Design Systems</h3>
              <p>Crafting beautiful, consistent user interfaces.</p>
              <FiLayout className="icon-bg" />
            </div>

            {/* Item 4: Standard Feature */}
            <div className="bento-item">
              <h3>Community</h3>
              <p>Join a growing network of 10k+ developers.</p>
              <FiUsers className="icon-bg" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blogs */}
      <section className="latest-blogs">
        <div className="container">
          <div className="section-header">
            <h2>Latest Articles</h2>
            <Link to="/blogs" className="view-all">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="blogs-grid">
            {loading ? (
              <LoadingScreen message="Loading articles..." style={{ minHeight: '200px' }} />
            ) : (
              latestBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trending (Most Liked) */}
      {mostLikedBlogs.length > 0 && (
        <section className="latest-blogs">
          <div className="container">
            <div className="section-header">
              <h2> Trending Posts</h2>
            </div>

            <div className="blogs-grid">
              {loading ? (
                <LoadingScreen message="Loading trending..." style={{ minHeight: '200px' }} />
              ) : (
                mostLikedBlogs.map(blog => (
                  <BlogCard key={blog.id} blog={blog} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Most Discussed (Most Commented) */}
      {mostCommentedBlogs.length > 0 && (
        <section className="latest-blogs">
          <div className="container">
            <div className="section-header">
              <h2> Most Discussed</h2>
            </div>

            <div className="blogs-grid">
              {loading ? (
                <LoadingScreen message="Loading discussions..." style={{ minHeight: '200px' }} />
              ) : (
                mostCommentedBlogs.map(blog => (
                  <BlogCard key={blog.id} blog={blog} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <CTASection />

      <FaqSection />
    </div>
  );
};

export default Home;
