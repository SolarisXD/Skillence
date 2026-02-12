import React, { useState, useEffect } from "react";
import { SendIcon, MicIcon, MicOffIcon, TrashIcon } from "./ChatIcons";
import { validateMessage } from "../utils/helpers";
import styles from "../../../styles/chatbot/components.module.css";

const ChatInput = ({
  onSendMessage,
  isLoading,
  onSpeechResult,
  transcript,
  isListening,
  onStartListening,
  onStopListening,
  speechSupported,
  onClearChat,
}) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (transcript && !isListening) {
      setMessage(transcript);
      onSpeechResult(transcript);
    }
  }, [transcript, isListening, onSpeechResult]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateMessage(message) && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear all chat history? This cannot be undone.")) {
      onClearChat?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.skillenceInputContainer}>
      {/* Clear chat button - subtle ghost style on the left */}
      {onClearChat && (
        <button
          type="button"
          onClick={handleClearChat}
          className={styles.skillenceClearButton}
          disabled={isLoading}
          aria-label="Clear chat history"
          title="Clear chat history"
        >
          <TrashIcon size={22} />
        </button>
      )}

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message here..."
        className={styles.skillenceInputField}
        disabled={isLoading}
        maxLength={1000}
      />

      {/* Voice input button */}
      {speechSupported && (
        <button
          type="button"
          onClick={toggleListening}
          className={`${styles.skillenceInputButton} ${styles.skillenceMicButton} ${isListening ? styles.skillenceMicActive : ''}`}
          disabled={isLoading}
          aria-label={isListening ? "Stop recording" : "Start voice input"}
          title={isListening ? "Stop recording" : "Start voice input"}
        >
          {isListening ? <MicOffIcon size={22} /> : <MicIcon size={22} />}
        </button>
      )}

      {/* Send button - primary action */}
      <button
        type="submit"
        className={`${styles.skillenceInputButton} ${styles.skillenceSendButton}`}
        disabled={!validateMessage(message) || isLoading}
        aria-label="Send message"
        title="Send message"
      >
        <SendIcon size={22} />
      </button>
    </form>
  );
};

export default ChatInput;
