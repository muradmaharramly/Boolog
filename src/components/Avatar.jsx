import React from 'react';

const stringToGradient = (string) => {
  if (!string) return 'linear-gradient(135deg, #58a6ff, #5644cc)'; 
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate distinct colors
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 50%))`;
};

const Avatar = ({ url, username, size = '40px', className = '' }) => {
  const styles = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `calc(${size} * 0.5)`,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  };

  if (url) {
    return (
      <img 
        src={url} 
        alt={username || 'User'} 
        className={className} 
        style={styles} 
      />
    );
  }

  const background = stringToGradient(username || 'User');
  const initial = username ? username.charAt(0) : '?';

  return (
    <div 
      className={className} 
      style={{ ...styles, background }}
      title={username}
    >
      {initial}
    </div>
  );
};

export default Avatar;
