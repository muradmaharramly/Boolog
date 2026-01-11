import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin, FiHeart } from 'react-icons/fi';
import logoImg from '../assets/images/boolog-logo.png';
import '../styles/_footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-logo">
            <img src={logoImg} alt="Boolog" />
            <span>Boolog</span>
        </div>
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer"><FiGithub size={20} /></a>
          <a href="#" target="_blank" rel="noopener noreferrer"><FiTwitter size={20} /></a>
          <a href="#" target="_blank" rel="noopener noreferrer"><FiLinkedin size={20} /></a>
        </div>
        <p>&copy; {new Date().getFullYear()} Boolog. All rights reserved.</p>
        <p>
          Build by <a href="https://muradmaharramli.me" target="_blank" rel="noopener noreferrer">Murad Maharramli</a> with <FiHeart className="heart-icon" /> love
        </p>
      </div>
    </footer>
  );
};

export default Footer;
