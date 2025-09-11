// Generate a unique session ID
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Truncate text to specified length
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Validate message content
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return false;
  }
  return message.trim().length > 0 && message.trim().length <= 1000;
};

// Check if browser supports speech recognition
export const isSpeechRecognitionSupported = () => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Check if browser supports speech synthesis
export const isSpeechSynthesisSupported = () => {
  return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
};
