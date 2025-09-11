import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import { useSpeechToText } from './hooks/useSpeechToText';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { chatService } from './services/chatService';
import { generateSessionId } from './utils/helpers';
import styles from '../../styles/chatbot/chat.module.css';

function SkillenceChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `👋 Hello! I'm Skillence, your AI-powered career guidance assistant. I'm here to help you navigate your professional journey, explore career paths, and achieve your goals.

✨ I can help you with:
• Career planning and guidance
• Skill development recommendations  
• Industry insights and trends
• Interview preparation
• Resume and portfolio advice

How can I assist you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const messagesEndRef = useRef(null);

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: speechSupported 
  } = useSpeechToText();

  const { speak, isPlaying } = useTextToSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage({
        message: content.trim(),
        session_id: sessionId,
        timestamp: new Date().toISOString()
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response || 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '⚠️ I\'m experiencing some technical difficulties right now. Please try again in a moment, or check your internet connection.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechResult = (transcript) => {
    if (transcript.trim()) {
      handleSendMessage(transcript);
    }
  };

  const handleSpeakMessage = (content) => {
    speak(content);
  };

  return (
    <div className={styles.skillenceChatContent}>
      <div className={styles.skillenceChatMessages}>
        <MessageList 
          messages={messages} 
          onSpeak={handleSpeakMessage}
          isPlaying={isPlaying}
        />
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.skillenceChatInputArea}>
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onSpeechResult={handleSpeechResult}
          transcript={transcript}
          isListening={isListening}
          onStartListening={startListening}
          onStopListening={stopListening}
          speechSupported={speechSupported}
        />
      </div>
    </div>
  );
}

export default SkillenceChat;
