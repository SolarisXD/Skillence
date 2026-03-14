import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

const SaveSkillButton = ({ skillId }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkIfSaved();
  }, [skillId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const checkIfSaved = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/skills/user/activity`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.saved_skills && data.saved_skills.includes(skillId)) {
          setIsSaved(true);
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
    if (!token) {
      // Could trigger auth modal here, but alert is a simple fallback
      alert('Please log in to save skills');
      return;
    }

    const newSavedStatus = !isSaved;
    
    // Optimistic UI update
    setIsSaved(newSavedStatus);
    
    try {
      const res = await fetch(`/api/skills/user/activity`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          skill_id: skillId,
          is_saved: newSavedStatus
        })
      });
      
      if (!res.ok) {
        // Revert on failure
        setIsSaved(!newSavedStatus);
        console.error('Failed to update skill save status');
      }
    } catch (error) {
      setIsSaved(!newSavedStatus);
      console.error('API Error updating skill save status', error);
    }
  };

  if (isLoading) {
    return (
      <div className="sl-loader-small" style={{ margin: '0 1rem' }}></div>
    );
  }

  return (
    <button
      onClick={handleToggleSave}
      className={`sl-save-btn ${isSaved ? 'saved' : ''}`}
    >
      {isSaved ? (
        <>
          <BookmarkCheck size={20} />
          Saved
        </>
      ) : (
        <>
          <Bookmark size={20} />
          Save Skill
        </>
      )}
    </button>
  );
};

export default SaveSkillButton;
