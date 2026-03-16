import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, BookmarkCheck, ChevronDown, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { apiUrl } from '../../utils/api';

const STATUS_OPTIONS = [
  { value: 'interested', label: 'Interested', icon: Sparkles, color: '#f59e0b' },
  { value: 'learning', label: 'Learning', icon: BookOpen, color: '#3b82f6' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: '#22c55e' },
];

const SaveSkillButton = ({ skillId }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [status, setStatus] = useState('interested');
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkIfSaved();
  }, [skillId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const checkIfSaved = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }

    try {
      const res = await fetch(apiUrl('/api/skills/user/activity'), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.saved_skills?.includes(skillId)) {
          setIsSaved(true);
          if (data.saved_details?.[skillId]) {
            setStatus(data.saved_details[skillId].status || 'interested');
          }
        }
      }
    } catch (error) {
      console.error('Error checking saved skill status', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in to save skills'); return; }
    const newSavedStatus = !isSaved;
    setIsSaved(newSavedStatus);

    try {
      const res = await fetch(apiUrl('/api/skills/user/activity'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ skill_id: skillId, is_saved: newSavedStatus })
      });
      if (!res.ok) setIsSaved(!newSavedStatus);
    } catch {
      setIsSaved(!newSavedStatus);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setStatus(newStatus);
    setShowDropdown(false);

    try {
      await fetch(apiUrl('/api/skills/user/activity'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ skill_id: skillId, is_saved: true, status: newStatus })
      });
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  if (isLoading) return <div className="sl-loader-small" style={{ margin: '0 1rem' }}></div>;

  const currentStatusInfo = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="sl-bookmark-wrapper" ref={dropdownRef}>
      <button
        onClick={handleToggleSave}
        className={`sl-save-btn ${isSaved ? 'saved' : ''}`}
        style={isSaved ? { borderColor: currentStatusInfo.color, color: currentStatusInfo.color } : {}}
      >
        {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        {isSaved ? 'Bookmarked' : 'Save Skill'}
      </button>
      {isSaved && (
        <button
          className="sl-status-toggle"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ borderColor: currentStatusInfo.color, color: currentStatusInfo.color }}
        >
          {React.createElement(currentStatusInfo.icon, { size: 16 })}
          {currentStatusInfo.label}
          <ChevronDown size={14} />
        </button>
      )}
      {showDropdown && (
        <div className="sl-status-dropdown">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`sl-status-option ${status === opt.value ? 'active' : ''}`}
              onClick={() => handleStatusChange(opt.value)}
            >
              {React.createElement(opt.icon, { size: 16, color: opt.color })}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SaveSkillButton;
