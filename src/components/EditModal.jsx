import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiImage, FiTag, FiFolder } from 'react-icons/fi';
import Modal from './Modal';
import '../styles/_modal.scss'; // Ensure styles are applied

const EditModal = ({ isOpen, onClose, initialData, onSave, categories = [], isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    category_id: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        content: initialData.content || '',
        image_url: initialData.image_url || '',
        category_id: initialData.category_id || '',
        tags: initialData.tags || []
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Blog" className="edit-modal">
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Blog Title"
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <div className="input-icon-wrapper">
            <FiFolder className="input-icon" />
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your story..."
            required
            rows={6}
            className="input-field textarea"
          />
        </div>

        <div className="form-group">
          <label>Cover Image URL</label>
          <div className="input-icon-wrapper">
            <FiImage className="input-icon" />
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="input-field"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="input-icon-wrapper">
            <FiTag className="input-icon" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Press Enter to add tags"
              className="input-field"
            />
          </div>
          <div className="tags-container">
            {formData.tags.map(tag => (
              <span key={tag} className="tag-pill">
                #{tag}
                <FiX onClick={() => removeTag(tag)} />
              </span>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : <><FiSave /> Save Changes</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModal;
