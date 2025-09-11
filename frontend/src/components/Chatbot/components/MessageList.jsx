import React from 'react';
import { Volume2 } from 'lucide-react';
import { formatTimestamp } from '../utils/helpers';
import styles from '../../../styles/chatbot/components.module.css';

const MessageList = ({ messages, onSpeak, isPlaying }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className={styles.skillenceMessage}>
        <p>Start a conversation with Skillence!</p>
      </div>
    );
  }

  const formatMessageContent = (content) => {
    // Split content into lines and format them properly
    const lines = content.split('\n');
    const elements = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') {
        elements.push(<br key={`br-${i}`} />);
        continue;
      }
      
      if (line.startsWith('•')) {
        // Handle bullet points
        const bulletContent = line.substring(1).trim();
        elements.push(
          <div key={`bullet-${i}`} style={{ 
            margin: '6px 0', 
            paddingLeft: '16px', 
            position: 'relative',
            textAlign: 'left'
          }}>
            <span style={{ 
              position: 'absolute', 
              left: '0', 
              color: '#1e40af', 
              fontWeight: '600' 
            }}>•</span>
            {bulletContent}
          </div>
        );
      } else if (line.startsWith('✨') || line.startsWith('👋')) {
        // Handle emoji lines with spacing
        elements.push(
          <div key={`emoji-${i}`} style={{ 
            margin: '12px 0', 
            fontWeight: '500',
            textAlign: 'left'
          }}>
            {line}
          </div>
        );
      } else {
        // Handle regular text
        elements.push(
          <div key={`text-${i}`} style={{ 
            margin: '8px 0',
            textAlign: 'left'
          }}>
            {line}
          </div>
        );
      }
    }
    
    return elements;
  };

  return (
    <div className={styles.skillenceMessages}>
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`${styles.skillenceMessage} ${
            message.type === 'user' ? styles.skillenceMessageUser : styles.skillenceMessageBot
          }`}
        >
          <div 
            className={`${styles.skillenceMessageBubble} ${
              message.type === 'user' 
                ? styles.skillenceMessageBubbleUser 
                : styles.skillenceMessageBubbleBot
            }`}
          >
            {message.type === 'bot' ? 
              formatMessageContent(message.content) : 
              message.content
            }
            {message.type === 'bot' && onSpeak && (
              <button
                onClick={() => onSpeak(message.content)}
                className={styles.skillenceSpeakButton}
                disabled={isPlaying}
                aria-label="Read message aloud"
              >
                <Volume2 size={14} />
              </button>
            )}
          </div>
          <div className={styles.skillenceMessageTimestamp}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
