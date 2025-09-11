import { useState, useRef } from 'react';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const speak = (text) => {
    if (!text || isPlaying) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to use a female voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen') ||
      voice.name.includes('Moira')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
  };

  const stop = () => {
    synthRef.current.cancel();
    setIsPlaying(false);
  };

  return {
    speak,
    stop,
    isPlaying
  };
};
