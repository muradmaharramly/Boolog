import React from 'react';
import ReactDOM from 'react-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import './Modal.scss';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#ff4d4f', fontSize: '3rem' }}>
          <FiAlertTriangle />
        </div>
        
        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={() => { onConfirm(); onClose(); }}>
            Yes, Delete It
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
