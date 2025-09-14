import React, { useState } from 'react';
import './DeadlineTracker.css';

// SVG Icons
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

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
          <CalendarIcon />
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
              {isEditable && <EditIcon />}
            </div>
          )}
        </div>

        <div className="deadline-status">
          <ClockIcon />
          <span className="deadline-remaining">{getDaysRemainingText()}</span>
        </div>

        {showQuickActions && isEditable && !isEditing && (
          <div className="deadline-quick-actions">
            <button
              className="quick-action-btn"
              onClick={() => adjustDeadline(1)}
              title="Extend by 1 day"
            >
              <PlusIcon />
              <span>1d</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => adjustDeadline(7)}
              title="Extend by 1 week"
            >
              <PlusIcon />
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
        <CalendarIcon />
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
              <PlusIcon />
              1 day
            </button>
            <button
              className="quick-adjust-btn"
              onClick={() => adjustDeadline(7)}
            >
              <PlusIcon />
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