import React, { useState } from 'react';
import './DeadlineTracker.css';
import { Calendar, Clock, Plus, Edit2 } from 'lucide-react';

const DeadlineTracker = ({ 
  deadline,
  onUpdateDeadline,
  label = "Deadline",
  showQuickActions = true,
  isEditable = true,
  className = "",
  size = "normal" // "compact", "normal", "detailed"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState('');

  // Parse deadline date
  const deadlineDate = new Date(deadline);
  const currentDate = new Date();
  const isOverdue = deadlineDate < currentDate;
  const daysRemaining = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format date for input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get deadline status
  const getDeadlineStatus = () => {
    if (isOverdue) return 'overdue';
    if (daysRemaining <= 7) return 'urgent';
    if (daysRemaining <= 30) return 'upcoming';
    return 'normal';
  };

  // Get days remaining text
  const getDaysRemainingText = () => {
    if (isOverdue) {
      const overdueDays = Math.abs(daysRemaining);
      return `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`;
    }
    if (daysRemaining === 0) return 'Due today';
    if (daysRemaining === 1) return 'Due tomorrow';
    return `${daysRemaining} days remaining`;
  };

  // Quick adjustment functions
  const adjustDeadline = (days) => {
    const newDate = new Date(deadlineDate);
    newDate.setDate(newDate.getDate() + days);
    onUpdateDeadline(newDate);
  };

  // Handle manual date change
  const handleDateEdit = () => {
    setTempDate(formatDateForInput(deadlineDate));
    setIsEditing(true);
  };

  const handleDateSave = () => {
    if (tempDate) {
      const newDate = new Date(tempDate);
      onUpdateDeadline(newDate);
    }
    setIsEditing(false);
  };

  const handleDateCancel = () => {
    setIsEditing(false);
    setTempDate('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleDateSave();
    } else if (e.key === 'Escape') {
      handleDateCancel();
    }
  };

  return (
    <div className={`deadline-tracker ${className} deadline-${size} deadline-${getDeadlineStatus()}`}>
      {size !== 'compact' && (
        <div className="deadline-label">
          <Calendar size={16} />
          <span>{label}</span>
        </div>
      )}
      
      <div className="deadline-content">
        <div className="deadline-date-section">
          {isEditing ? (
            <div className="deadline-edit">
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                onBlur={handleDateSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="deadline-input"
              />
            </div>
          ) : (
            <div className="deadline-display" onClick={isEditable ? handleDateEdit : undefined}>
              <span className="deadline-date">{formatDate(deadlineDate)}</span>
              {isEditable && <Edit2 size={14} />}
            </div>
          )}
        </div>

        <div className="deadline-status">
          <Clock size={16} />
          <span className="deadline-remaining">{getDaysRemainingText()}</span>
        </div>

        {showQuickActions && isEditable && !isEditing && (
          <div className="deadline-quick-actions">
            <button
              className="quick-action-btn"
              onClick={() => adjustDeadline(1)}
              title="Extend by 1 day"
            >
              <Plus size={12} />
              <span>1d</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => adjustDeadline(7)}
              title="Extend by 1 week"
            >
              <Plus size={12} />
              <span>1w</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact button version for deadline tracker
export const CompactDeadlineButton = ({ 
  deadline, 
  onUpdateDeadline, 
  className = "",
  isCompleted = false 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDate, setTempDate] = useState('');

  const deadlineDate = new Date(deadline);
  const currentDate = new Date();
  const isOverdue = deadlineDate < currentDate;
  const daysRemaining = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date for input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get deadline status
  const getDeadlineStatus = () => {
    if (isOverdue) return 'overdue';
    if (daysRemaining <= 7) return 'urgent';
    return 'normal';
  };

  // Quick adjustment functions
  const adjustDeadline = (days) => {
    const newDate = new Date(deadlineDate);
    newDate.setDate(newDate.getDate() + days);
    onUpdateDeadline(newDate);
    setShowCalendar(false);
  };

  // Handle calendar date change
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    onUpdateDeadline(newDate);
    setShowCalendar(false);
  };

  const handleButtonClick = () => {
    if (!isCompleted) {
      setTempDate(formatDateForInput(deadlineDate));
      setShowCalendar(!showCalendar);
    }
  };

  return (
    <div className={`compact-deadline-button ${className} deadline-${getDeadlineStatus()}`}>
      <button
        className="deadline-button"
        onClick={handleButtonClick}
        disabled={isCompleted}
        title={isCompleted ? 'Completed' : 'Click to change deadline'}
      >
        <Calendar size={16} />
        <span className="deadline-text">{formatDate(deadlineDate)}</span>
      </button>

      {showCalendar && !isCompleted && (
        <div className="deadline-calendar-popup">
          <div className="calendar-header">
            <span>Set Deadline</span>
            <button 
              className="close-calendar"
              onClick={() => setShowCalendar(false)}
            >
              ×
            </button>
          </div>
          
          <input
            type="date"
            value={formatDateForInput(deadlineDate)}
            onChange={handleDateChange}
            className="calendar-input"
          />
          
          <div className="quick-adjust-buttons">
            <button
              className="quick-adjust-btn"
              onClick={() => adjustDeadline(1)}
            >
              <Plus size={12} />
              1 day
            </button>
            <button
              className="quick-adjust-btn"
              onClick={() => adjustDeadline(7)}
            >
              <Plus size={12} />
              1 week
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Detailed version with more information
export const DetailedDeadlineTracker = ({ 
  deadline, 
  onUpdateDeadline, 
  label,
  originalDeadline,
  className = "" 
}) => {
  const hasBeenExtended = originalDeadline && new Date(deadline) > new Date(originalDeadline);

  return (
    <div className={`detailed-deadline ${className}`}>
      <DeadlineTracker
        deadline={deadline}
        onUpdateDeadline={onUpdateDeadline}
        label={label}
        size="detailed"
      />
      {hasBeenExtended && (
        <div className="deadline-history">
          <span className="original-deadline">
            Original: {new Date(originalDeadline).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

// Phase deadline component
export const PhaseDeadlineTracker = ({ 
  phaseNumber,
  deadline,
  onUpdateDeadline,
  isCompleted = false,
  className = ""
}) => {
  const handleUpdate = (newDate) => {
    onUpdateDeadline(phaseNumber, newDate);
  };

  return (
    <CompactDeadlineButton
      deadline={deadline}
      onUpdateDeadline={handleUpdate}
      isCompleted={isCompleted}
      className={`phase-deadline ${isCompleted ? 'phase-completed' : ''} ${className}`}
    />
  );
};

export default DeadlineTracker;