import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiClock, FiMessageSquare } from 'react-icons/fi';
import Modal from './Modal';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

const CommentModal = ({ isOpen, onClose, comments = [], onAddComment, onDeleteComment, currentUser, loading }) => {
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, comments]);

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
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="user-info">
                  <Avatar 
                    url={comment.author?.avatar_url || comment.profiles?.avatar_url} 
                    username={comment.author?.username || comment.profiles?.username || 'Unknown User'} 
                    size="sm" 
                  />
                  <span className="username">{comment.author?.username || comment.profiles?.username || 'Unknown User'}</span>
                  <span className="timestamp">{formatDate(comment.created_at)}</span>
                </div>
                {(currentUser?.id === comment.user_id || currentUser?.role === 'admin') && (
                  <button 
                    className="delete-comment-btn" 
                    onClick={() => onDeleteComment(comment.id)}
                    title="Delete comment"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
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
