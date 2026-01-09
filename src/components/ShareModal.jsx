import React from 'react';
import ReactDOM from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Modal.scss';

const ShareModal = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
        
        <h2>Share Blog</h2>
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

          <div className="url-container">
            <input type="text" value={url} readOnly />
            <button onClick={handleCopy} title="Copy Link">
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose} style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
