import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#ff4d4f', fontSize: '3rem' }}>
        <FiAlertTriangle />
      </div>
      
      <p>{message}</p>

      <div className="modal-actions">
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="confirm-btn" onClick={() => { onConfirm(); onClose(); }}>
          Yes, Delete It
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
