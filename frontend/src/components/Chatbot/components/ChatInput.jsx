import React, { useState, useEffect } from "react";
import { Send, Mic, MicOff, Trash2 } from "lucide-react";
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
      {onClearChat && (
        <button
          type="button"
          onClick={handleClearChat}
          className={styles.skillenceInputButton}
          disabled={isLoading}
          aria-label="Clear chat history"
          style={{
            background: "#6b7280",
            marginRight: "4px",
          }}
          title="Clear chat history"
        >
          <Trash2 size={18} />
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

      {speechSupported && (
        <button
          type="button"
          onClick={toggleListening}
          className={styles.skillenceInputButton}
          disabled={isLoading}
          aria-label={isListening ? "Stop recording" : "Start voice input"}
          style={{
            background: isListening ? "#ef4444" : "#6b7280",
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      )}

      <button
        type="submit"
        className={styles.skillenceInputButton}
        disabled={!validateMessage(message) || isLoading}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default ChatInput;
