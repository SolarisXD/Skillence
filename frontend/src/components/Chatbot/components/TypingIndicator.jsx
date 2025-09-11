import React from 'react';
import styles from '../../../styles/chatbot/components.module.css';

const TypingIndicator = () => {
  return (
    <div className={styles.skillenceTypingIndicator}>
      <div className={styles.skillenceTypingDots}>
        <div className={styles.skillenceTypingDot}></div>
        <div className={styles.skillenceTypingDot}></div>
        <div className={styles.skillenceTypingDot}></div>
      </div>
      <span className={styles.skillenceTypingText}>Skillence is thinking</span>
    </div>
  );
};

export default TypingIndicator;
