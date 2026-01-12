import React, { useState, useEffect } from 'react';
import { FiSave, FiUser, FiImage } from 'react-icons/fi';
import Modal from './Modal';
import '../styles/_modal.scss';

const UserEditModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        username: initialData.username || '',
        avatar_url: initialData.avatar_url || ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" className="edit-modal">
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Username</label>
          <div className="input-icon-wrapper">
            <FiUser className="input-icon" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="input-field"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Avatar URL</label>
          <div className="input-icon-wrapper">
            <FiImage className="input-icon" />
            <input
              type="text"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://..."
              className="input-field"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="primary-btn">
            <FiSave /> Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserEditModal;
