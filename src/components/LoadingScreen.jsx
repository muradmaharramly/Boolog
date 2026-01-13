import React from 'react';
import { BeatLoader } from 'react-spinners';
import '../styles/_states.scss';

const LoadingScreen = ({ fullPage = false, style = {} }) => {
  return (
    <div className={`loading-screen ${fullPage ? 'full-page' : ''}`} style={style}>
      <BeatLoader color="#6366F1" size={15} margin={4} />
    </div>
  );
};

export default LoadingScreen;
