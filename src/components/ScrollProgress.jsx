import React, { useEffect, useState } from 'react';
import '../styles/_scroll-progress.scss';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="global-reading-progress-bar" style={{ width: `${scrollProgress}%` }} />
  );
};

export default ScrollProgress;
