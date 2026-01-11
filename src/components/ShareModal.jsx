import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from './Modal';

const ShareModal = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Blog">
      <p>Scan the QR code or copy the link below to share "{title}"</p>

      <div className="share-content">
        <div className="qr-code-wrapper">
          <QRCodeCanvas 
            value={url} 
            size={200}
            level={"H"}
            includeMargin={true}
          />
        </div>

        <div className="copy-link-wrapper">
          <input type="text" value={url} readOnly />
          <button onClick={handleCopy} title="Copy Link">
            {copied ? <FiCheck /> : <FiCopy />}
          </button>
        </div>

        <div className="social-share-buttons">
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="social-btn twitter" title="Share on Twitter"><FaTwitter /></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="social-btn facebook" title="Share on Facebook"><FaFacebook /></a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="social-btn linkedin" title="Share on LinkedIn"><FaLinkedin /></a>
            <a href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="social-btn whatsapp" title="Share on WhatsApp"><FaWhatsapp /></a>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
