import React from 'react';
import { Check, Target, Book } from 'lucide-react';
import './TaskCheckbox.css';

const TaskCheckbox = ({ 
  taskId,
  taskName,
  taskType = 'task', // 'skill', 'milestone', 'resource', 'task'
  isCompleted = false,
  isLoading = false,
  onToggle,
  className = '',
  showLabel = true,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  
  const handleToggle = () => {
    if (!isLoading && onToggle) {
      onToggle(taskId, !isCompleted);
    }
  };

  const getTaskIcon = () => {
    switch (taskType) {
      case 'skill':
        return <Target size={14} style={{marginRight: '4px'}} />;
      case 'milestone':
        return null; // Remove trophy emoji from individual milestones
      case 'resource':
        return <Book size={14} style={{marginRight: '4px'}} />;
      default:
        return null;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'task-checkbox-small';
      case 'large':
        return 'task-checkbox-large';
      default:
        return 'task-checkbox-normal';
    }
  };

  return (
    <div className={`task-checkbox-wrapper ${className} ${getSizeClass()} ${isCompleted ? 'task-completed' : ''}`}>
      <div className="task-checkbox-container">
        <div className="task-checkbox-section">
          <button
            type="button"
            className={`task-checkbox ${isCompleted ? 'checked' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={handleToggle}
            disabled={isLoading}
            aria-label={`Mark ${taskName} as ${isCompleted ? 'incomplete' : 'complete'}`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isLoading ? (
              <div className="checkbox-spinner" />
            ) : isCompleted ? (
              <Check size={10} strokeWidth={3} />
            ) : null}
          </button>
        </div>
        
        {showLabel && (
          <div className="task-content-section">
            <div className={`task-label ${isCompleted ? 'task-completed' : ''}`}>
              <div className="task-header">
                {getTaskIcon() && <span className="task-icon">{getTaskIcon()}</span>}
                <span className="task-name">{taskName}</span>
              </div>
              {/* Remove milestone badge and skill badge */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized component for skill items
export const SkillCheckbox = ({ skillName, isCompleted, onToggle, className = '' }) => {
  return (
    <TaskCheckbox
      taskId={`skill_${skillName}`}
      taskName={skillName}
      taskType="skill"
      isCompleted={isCompleted}
      onToggle={onToggle}
      className={className}
      size="small"
    />
  );
};

// Specialized component for milestone items
export const MilestoneCheckbox = ({ milestone, isCompleted, onToggle, className = '' }) => {
  return (
    <TaskCheckbox
      taskId={`milestone_${milestone}`}
      taskName={milestone}
      taskType="milestone"
      isCompleted={isCompleted}
      onToggle={onToggle}
      className={className}
    />
  );
};

// Specialized component for resource items
export const ResourceCheckbox = ({ resource, isCompleted, onToggle, className = '' }) => {
  const resourceName = typeof resource === 'object' ? resource.title : resource;
  
  return (
    <TaskCheckbox
      taskId={`resource_${resourceName}`}
      taskName={resourceName}
      taskType="resource"
      isCompleted={isCompleted}
      onToggle={onToggle}
      className={className}
    />
  );
};

// Compact list component for multiple tasks
export const TaskList = ({ tasks, completedTasks = [], onToggleTask, className = '' }) => {
  return (
    <div className={`task-list ${className}`}>
      {tasks.map((task, index) => {
        const taskId = task.id || `task_${index}`;
        const isCompleted = completedTasks.includes(taskId);
        
        return (
          <TaskCheckbox
            key={taskId}
            taskId={taskId}
            taskName={task.name || task}
            taskType={task.type || 'task'}
            isCompleted={isCompleted}
            onToggle={onToggleTask}
            size="small"
            className="task-list-item"
          />
        );
      })}
    </div>
  );
};

export default TaskCheckbox;