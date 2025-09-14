import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  progress, 
  className = '', 
  showPercentage = true, 
  size = 'normal', // 'thin', 'normal', 'thick'
  color = 'primary', // 'primary', 'success', 'warning', 'danger'
  label = '',
  position = 'bottom' // 'top', 'bottom', 'inline'
}) => {
  const progressValue = Math.max(0, Math.min(100, progress || 0));
  
  const getProgressColor = () => {
    switch (color) {
      case 'success':
        return 'var(--progress-success)';
      case 'warning':
        return 'var(--progress-warning)';
      case 'danger':
        return 'var(--progress-danger)';
      default:
        return 'var(--progress-primary)';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'thin':
        return 'progress-bar-thin';
      case 'thick':
        return 'progress-bar-thick';
      default:
        return 'progress-bar-normal';
    }
  };

  const renderLabel = () => {
    if (!label && !showPercentage) return null;
    
    return (
      <div className={`progress-label progress-label-${position}`}>
        {label && <span className="progress-label-text">{label}</span>}
        {showPercentage && (
          <span className="progress-percentage">
            {progressValue.toFixed(0)}%
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`progress-container ${className}`}>
      {position === 'top' && renderLabel()}
      
      <div className={`progress-bar ${getSizeClass()}`}>
        <div 
          className="progress-fill"
          style={{ 
            width: `${progressValue}%`,
            backgroundColor: getProgressColor()
          }}
        />
      </div>
      
      {position === 'bottom' && renderLabel()}
      {position === 'inline' && (
        <div className="progress-inline-label">
          {renderLabel()}
        </div>
      )}
    </div>
  );
};

// Specialized component for thin progress (just a line, no text)
export const ThinProgressBar = ({ progress, className = '', color = 'primary' }) => {
  return (
    <ProgressBar
      progress={progress}
      size="thin"
      showPercentage={false}
      color={color}
      className={`thin-progress-bar ${className}`}
    />
  );
};

// Specialized component for phase progress (thin line at top of container)
export const PhaseProgressBar = ({ progress, className = '' }) => {
  return (
    <ThinProgressBar
      progress={progress}
      color={progress === 100 ? 'success' : 'primary'}
      className={`phase-progress-bar ${className}`}
    />
  );
};

// Specialized component for total roadmap progress (very thin line at top of roadmap container)
export const RoadmapProgressBar = ({ progress, className = '' }) => {
  return (
    <ThinProgressBar
      progress={progress}
      color={progress === 100 ? 'success' : 'primary'}
      className={`roadmap-progress-bar ${className}`}
    />
  );
};

// Component for progress with detailed stats
export const DetailedProgressBar = ({ 
  progress, 
  completedItems, 
  totalItems, 
  label,
  className = '' 
}) => {
  return (
    <div className={`detailed-progress ${className}`}>
      <div className="detailed-progress-header">
        <span className="detailed-progress-label">{label}</span>
        <span className="detailed-progress-stats">
          {completedItems}/{totalItems}
        </span>
      </div>
      <ProgressBar
        progress={progress}
        showPercentage={true}
        size="normal"
        position="bottom"
      />
    </div>
  );
};

export default ProgressBar;