import React from 'react';
import { BeatLoader } from 'react-spinners';
import '../styles/_states.scss';

const LoadingScreen = ({ fullPage = false, message = "Loading...", style = {} }) => {
  return (
    <div className={`loading-screen ${fullPage ? 'full-page' : ''}`} style={style}>
      <div className="loader-content">
        <BeatLoader color="#6366F1" size={15} margin={4} />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
