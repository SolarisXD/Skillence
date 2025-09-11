import React from 'react';
import styles from '../../../styles/chatbot/components.module.css';

const ChatHeader = ({ title = "Skillence" }) => {
  return (
    <div className={styles.skillenceChatHeader}>
      <h1 className={styles.skillenceChatTitle}>{title}</h1>
    </div>
  );
};

export default ChatHeader;
