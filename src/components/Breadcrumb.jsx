import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const segmentLabelMap = {
  blogs: 'Blogs',
  blog: 'Blog',
  users: 'People',
  user: 'People',
  about: 'About',
  login: 'Login',
  register: 'Register',
  profile: 'Profile',
  admin: 'Dashboard'
};

const Breadcrumb = () => {
  const location = useLocation();
  if (location.pathname === '/') {
    return null;
  }

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const items = [];

  items.push({
    label: 'Home',
    to: '/'
  });

  if (pathSegments[0] === 'blog') {
    const from = location.state && location.state.from;
    const blogNumber = pathSegments[1] || '';

    if (from === 'blogs') {
      items.push({
        label: 'Blogs',
        to: '/blogs'
      });
    }

    items.push({
      label: blogNumber ? `Blog ${blogNumber}` : 'Blog',
      to: null
    });
  } else if (pathSegments[0] === 'user') {
    const from = location.state && location.state.from;
    const usernameSegment = pathSegments[1] || '';
    const username = decodeURIComponent(usernameSegment);

    if (from === 'users') {
      items.push({
        label: 'People',
        to: '/users'
      });
    }

    items.push({
      label: username || 'User',
      to: null
    });
  } else {
    let accumulatedPath = '';

    pathSegments.forEach((segment, index) => {
      accumulatedPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const key = segment.toLowerCase();
      const mappedLabel = segmentLabelMap[key];
      const rawLabel = segment.replace(/-/g, ' ');
      const baseLabel = mappedLabel || rawLabel;
      const label = baseLabel.charAt(0).toUpperCase() + baseLabel.slice(1);

      items.push({
        label,
        to: isLast ? null : accumulatedPath
      });
    });
  }

  return (
    <div className="breadcrumb-wrapper">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            if (index > 0) {
              return (
                <React.Fragment key={item.label + index}>
                  <span className="breadcrumb-separator">/</span>
                  {isLast || !item.to ? (
                    <span className="breadcrumb-item breadcrumb-item--active">
                      {item.label}
                    </span>
                  ) : (
                    <span className="breadcrumb-item">
                      <Link to={item.to}>{item.label}</Link>
                    </span>
                  )}
                </React.Fragment>
              );
            }

            return item.to ? (
              <span key={item.label + index} className="breadcrumb-item">
                <Link to={item.to}>{item.label}</Link>
              </span>
            ) : (
              <span
                key={item.label + index}
                className="breadcrumb-item breadcrumb-item--active"
              >
                {item.label}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
