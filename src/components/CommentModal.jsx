import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiClock, FiMessageSquare, FiTrash } from 'react-icons/fi';
import Modal from './Modal';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

const CommentModal = ({ isOpen, onClose, comments = [], onAddComment, onDeleteComment, currentUser, loading }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comments (${comments.length})`} className="comment-modal">
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="empty-state">
            <FiMessageSquare className="empty-icon" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwnComment = currentUser?.id === comment.user_id;
            const baseUsername = comment.author?.username || comment.profiles?.username;
            const displayName = baseUsername || (isOwnComment ? (currentUser?.username || 'Admin') : 'Admin');

            const avatarUrl = comment.author?.avatar_url || comment.profiles?.avatar_url;

            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="user-info">
                    <Avatar 
                      url={avatarUrl} 
                      username={displayName} 
                      size="sm" 
                    />
                    <span className="username">{displayName}</span>
                    {comment.isFirst && (
                      <span className="first-badge">First</span>
                    )}
                    <span className="timestamp">{formatDate(comment.created_at)}</span>
                  </div>
                  {(currentUser?.id === comment.user_id || currentUser?.role === 'admin') && (
                    <button 
                      className="delete-comment-btn" 
                      onClick={() => onDeleteComment(comment.id)}
                      title="Delete comment"
                    >
                      <FiTrash />
                    </button>
                  )}
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
          disabled={loading}
        />
        <button type="submit" className="send-btn" disabled={loading || !newComment.trim()}>
          <FiSend />
        </button>
      </form>
    </Modal>
  );
};

export default CommentModal;
