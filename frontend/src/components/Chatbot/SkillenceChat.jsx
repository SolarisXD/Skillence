import React, { useState, useRef, useEffect, useCallback } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";
import { useSpeechToText } from "./hooks/useSpeechToText";
import { useTextToSpeech } from "./hooks/useTextToSpeech";
import { chatService } from "./services/chatService";
import { generateSessionId } from "./utils/helpers";
import { API_BASE_URL } from "../../utils/api";
import styles from "../../styles/chatbot/chat.module.css";

// Storage keys - localStorage only (no database, safe for team project)
const STORAGE_KEYS = {
  SESSION_ID: "skillence_chat_session_id",
  MESSAGES: "skillence_chat_messages",
};

// API URL for profile fetch
const API_URL = API_BASE_URL;

// Default welcome message (personalized if user name available)
const getWelcomeMessage = (userName = null) => ({
  id: 1,
  type: "bot",
  content: userName
    ? `▶ Hello ${userName}! I'm Skillence, your AI-powered career guidance assistant. I'm here to help you navigate your professional journey, explore career paths, and achieve your goals.

◇ I can help you with:
• Career planning and guidance
• Skill development recommendations  
• Industry insights and trends
• Interview preparation
• Resume and portfolio advice

How can I assist you today?`
    : `▶ Hello! I'm Skillence, your AI-powered career guidance assistant. I'm here to help you navigate your professional journey, explore career paths, and achieve your goals.

◇ I can help you with:
• Career planning and guidance
• Skill development recommendations  
• Industry insights and trends
• Interview preparation
• Resume and portfolio advice

How can I assist you today?`,
  timestamp: new Date().toISOString(),
});

function SkillenceChat() {
  // Get or create persistent session ID (stored in localStorage)
  const getSessionId = () => {
    let storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, storedSessionId);
    }
    return storedSessionId;
  };

  // Load messages from localStorage on init
  const loadInitialMessages = () => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load messages from localStorage:", e);
    }
    return [getWelcomeMessage()];
  };

  const [messages, setMessages] = useState(loadInitialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(getSessionId);
  const [userInfo, setUserInfo] = useState(null); // User profile for personalization
  const messagesEndRef = useRef(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: speechSupported,
  } = useSpeechToText();

  const { speak, isPlaying } = useTextToSpeech();

  // Fetch user info for personalization (only reads, no writes - safe for team)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log(
            "No token found, chatbot will work without personalization",
          );
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch user's name from auth endpoint (users collection)
        // AND profile data from profile endpoint (resume data)
        // Both are existing endpoints - safe to use
        const [authResponse, profileResponse] = await Promise.all([
          fetch(`${API_URL}/api/auth/me`, { headers }),
          fetch(`${API_URL}/api/profile/`, { headers }),
        ]);

        let userName = null;
        let userEmail = null;

        // Get name from auth/me (users collection)
        if (authResponse.ok) {
          const authData = await authResponse.json();
          userName = authData.name || null;
          userEmail = authData.email || null;
        }

        // Get skills/education/experience/projects/certifications from profile (resume data)
        let skills = [];
        let softSkills = [];
        let education = null;
        let cgpa = null;
        let experience = null;
        let projects = [];
        let certifications = [];
        let achievements = [];

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.profile?.profile_data) {
            const profile = profileData.profile.profile_data;

            // Technical and soft skills
            skills = profile.skills?.technical?.slice(0, 10) || [];
            softSkills = profile.skills?.soft?.slice(0, 5) || [];

            // Education with CGPA
            const edu = profile.education?.[0];
            if (edu) {
              const school = edu.institution || edu.school || "Unknown";
              education = edu.degree ? `${edu.degree} from ${school}` : null;
              cgpa = edu.gpa || null;
            }

            // Experience
            const exp = profile.experience?.[0];
            if (exp) {
              experience = exp.title
                ? `${exp.title} at ${exp.company || "Unknown"}`
                : null;
            }

            // Projects (extract names)
            projects = (profile.projects || [])
              .slice(0, 5)
              .map((p) => p.name || p.description?.slice(0, 50))
              .filter(Boolean);

            // Certifications (extract names)
            certifications = (profile.certifications || [])
              .slice(0, 5)
              .map((c) => c.name)
              .filter(Boolean);

            // Achievements (extract titles)
            achievements = (profile.achievements || [])
              .slice(0, 3)
              .map((a) => a.title)
              .filter(Boolean);
          }
        }

        const extractedInfo = {
          name: userName,
          email: userEmail,
          skills,
          soft_skills: softSkills,
          education,
          cgpa,
          experience,
          projects,
          certifications,
          achievements,
        };

        setUserInfo(extractedInfo);
        console.log("User info loaded for chatbot personalization:", userName);

        // Update welcome message with user's name if this is a fresh session
        if (
          extractedInfo.name &&
          messages.length === 1 &&
          messages[0].id === 1
        ) {
          setMessages([getWelcomeMessage(extractedInfo.name)]);
        }
      } catch (error) {
        console.error("Failed to fetch user info for chatbot:", error);
        // Continue without personalization - not a critical error
      }
    };

    fetchUserInfo();
  }, []); // Only run once on mount

  // Save messages to localStorage whenever they change
  const saveMessagesToStorage = useCallback((msgs) => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages, saveMessagesToStorage]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message with recent history for context (last 10 messages)
      const recentHistory = messages.slice(-10).map((m) => ({
        role: m.type === "user" ? "user" : "bot",
        content: m.content,
      }));

      const response = await chatService.sendMessage({
        message: content.trim(),
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        history: recentHistory, // Send history for context
        user_info: userInfo, // Send user profile for personalization
      });

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          response.response ||
          "I apologize, but I encountered an issue processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "[!] I'm experiencing some technical difficulties right now. Please try again in a moment, or check your internet connection.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear chat history (localStorage only)
  const handleClearChat = () => {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    setMessages([getWelcomeMessage()]);
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
          onClearChat={handleClearChat}
        />
      </div>
    </div>
  );
}

export default SkillenceChat;
