import React from 'react';
import { X } from 'lucide-react';
import SkillenceChat from './SkillenceChat';
import styles from '../../styles/chatbot/chat.module.css';

const SkillenceChatModal = ({ onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className={styles.skillenceChatOverlay} 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="skillence-chat-title"
    >
      <div className={styles.skillenceChatModal}>
        <div className={styles.skillenceChatContainer}>
          <div className={styles.skillenceChatHeader}>
            <h1 id="skillence-chat-title" className={styles.skillenceChatTitle}>
              Skillence
            </h1>
            <button 
              className={styles.skillenceChatCloseButton}
              onClick={onClose}
              aria-label="Close chat"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>
          <SkillenceChat />
        </div>
      </div>
    </div>
  );
};

export default SkillenceChatModal;
