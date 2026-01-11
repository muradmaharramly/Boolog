import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../styles/_states.scss';

const EmptyState = ({ 
  icon: Icon = FiInbox, 
  title = "No items found", 
  message = "It seems there is nothing here yet.",
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="empty-state">
      <Icon className="empty-icon" />
      <h3>{title}</h3>
      <p>{message}</p>
      
      {actionLabel && (actionLink || onAction) && (
        <div className="empty-action">
          {actionLink ? (
            <Link to={actionLink} className="btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
