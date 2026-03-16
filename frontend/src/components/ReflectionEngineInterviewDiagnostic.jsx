import { useState, useRef, useEffect } from "react";
import { MessageSquare } from 'lucide-react';
import Navbar from "./navbar";
import { API_BASE_URL } from "../utils/api";

const STORAGE_KEYS = {
  SESSION_ID: "reflection_engine_session_id",
  MESSAGES: "reflection_engine_messages",
};

const getDefaultWelcomeMessage = () => ({
  id: 1,
  type: "ai",
  content: "Welcome to Reflection Engine. I am your AI interview coach. Share your latest interview situation and what felt difficult, and I will help you improve for your next interview.",
  timestamp: new Date().toISOString(),
});

export default function ReflectionEngineInterviewDiagnostic() {
  const [messages, setMessages] = useState(() => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages;
        }
      }
    } catch (error) {
      console.error("Failed to parse stored reflection messages:", error);
    }
    return [getDefaultWelcomeMessage()];
  });
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    const existingSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (existingSessionId) {
      return existingSessionId;
    }
    const newSessionId = `reflection-${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    return newSessionId;
  });
  const [userInfo, setUserInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [authResponse, profileResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, { headers }),
          fetch(`${API_BASE_URL}/api/profile/`, { headers }),
        ]);

        let userName = null;
        let userEmail = null;

        if (authResponse.ok) {
          const authData = await authResponse.json();
          userName = authData.name || null;
          userEmail = authData.email || null;
        }

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
            skills = profile.skills?.technical?.slice(0, 10) || [];
            softSkills = profile.skills?.soft?.slice(0, 5) || [];

            const educationItem = profile.education?.[0];
            if (educationItem) {
              const institution = educationItem.institution || educationItem.school || "";
              education = educationItem.degree
                ? `${educationItem.degree}${institution ? ` from ${institution}` : ""}`
                : null;
              cgpa = educationItem.gpa || null;
            }

            const experienceItem = profile.experience?.[0];
            if (experienceItem) {
              experience = experienceItem.title
                ? `${experienceItem.title}${experienceItem.company ? ` at ${experienceItem.company}` : ""}`
                : null;
            }

            projects = (profile.projects || [])
              .slice(0, 5)
              .map((item) => item.name || item.description?.slice(0, 60))
              .filter(Boolean);

            certifications = (profile.certifications || [])
              .slice(0, 5)
              .map((item) => item.name)
              .filter(Boolean);

            achievements = (profile.achievements || [])
              .slice(0, 3)
              .map((item) => item.title)
              .filter(Boolean);
          }
        }

        setUserInfo({
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
        });
      } catch (error) {
        console.error("Failed to fetch user context for Reflection Engine:", error);
      }
    };

    fetchUserContext();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sanitizeCoachText = (text) => {
    if (!text || typeof text !== "string") {
      return "I can help with interview coaching. Please share your interview experience in more detail.";
    }

    let cleaned = text;
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
    cleaned = cleaned.replace(/^#{1,6}\s*/gm, "");
    cleaned = cleaned.replace(/[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}\u{24C2}-\u{1F251}]/gu, "");
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

    return cleaned;
  };

  const buildHistoryPayload = () => {
    return messages.slice(-12).map((message) => ({
      role: message.type === "user" ? "user" : "bot",
      content: sanitizeCoachText(message.content),
    }));
  };

  const sendCoachRequest = async (endpoint, payload) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const inputValue = currentInput.trim();
    setCurrentInput("");
    setLoading(true);

    try {
      const payload = {
        message: inputValue,
        session_id: sessionId,
        history: buildHistoryPayload(),
        user_info: userInfo,
      };

      let data;
      try {
        data = await sendCoachRequest("/api/chatbot/reflection-coach", payload);
      } catch (primaryError) {
        console.warn("Primary reflection coach endpoint failed, trying fallback:", primaryError);
        data = await sendCoachRequest("/api/chatbot/chat", {
          message: inputValue,
          session_id: sessionId,
          history: buildHistoryPayload(),
          user_info: userInfo,
        });
      }

      const aiResponse = sanitizeCoachText(data.response);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: aiResponse || "I can help with interview coaching. Tell me what happened in your interview and what you want to improve.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "I could not reach the interview coach right now. Please ensure backend is running and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = () => {
    const analysisMessage = {
      id: Date.now(),
      type: "ai",
      content: "*Analyzing your interview experience...*\n\n🔍 **Processing your reflection**\n✅ **Identifying key patterns**\n🎯 **Generating personalized feedback**\n📝 **Creating action plan**",
      timestamp: new Date(),
      isAnalyzing: true
    };
    setMessages(prev => [...prev, analysisMessage]);

    setTimeout(() => {
      setMessages(prev => prev.filter(m => !m.isAnalyzing));
      
      const detailedAnalysis = generateDetailedAnalysis();
      const analysisResult = {
        id: Date.now() + 1,
        type: "ai",
        content: detailedAnalysis,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisResult]);
      setConversationState("completed");
      setLoading(false);
    }, 3000);
  };

  const generateDetailedAnalysis = () => {
    const { status, skills, sentiment, interviewReflection, pastMistakes } = userContext;
    
    return `## **Your Reflection Engine Analysis Complete**

**Profile Summary:**
• **Status**: ${status}
• **Target Skills**: ${skills}
• **Current Mindset**: ${sentiment}

---

### **Key Patterns Identified**

Based on your reflection, I've identified several important patterns:

**Strengths to Leverage:**
• Your self-awareness about areas for improvement
• Technical knowledge in ${skills}
• Willingness to reflect honestly on your experience

**Growth Opportunities:**
• Communication during technical discussions
• Managing interview anxiety/nerves
• Structuring responses more effectively

---

### **Personalized Action Plan**

**Immediate Next Steps (Next 1-2 weeks):**
1. **Practice Technical Communication**: Explain your code/solutions out loud daily
2. **Mock Interview Sessions**: Practice with friends or use online platforms
3. **STAR Method**: Structure behavioral answers (Situation, Task, Action, Result)

**Medium-term Goals (Next month):**
1. **Build Confidence**: Work on 2-3 strong project examples you can discuss
2. **Technical Deep Dive**: Strengthen areas where you felt uncertain
3. **Interview Simulation**: Record yourself answering common questions

**Long-term Development (Ongoing):**
1. **Continuous Learning**: Stay updated with latest trends in ${skills}
2. **Networking**: Connect with professionals in your target field
3. **Portfolio Enhancement**: Showcase your best work prominently

---

### **Specific Recommendations**

**For Technical Questions:**
• Use the "rubber duck" debugging method - explain your thinking process step by step
• Break down complex problems into smaller, manageable parts
• Don't be afraid to ask clarifying questions

**For Behavioral Questions:**
• Prepare 5-7 strong examples using the STAR method
• Focus on specific achievements and learnings
• Show growth mindset and adaptability

**For Managing Nerves:**
• Practice deep breathing techniques before the interview
• Arrive early but not too early (10-15 minutes)
• Remember: they already like your resume, now they want to meet you!

---

### **Your Reflection Engine Loop**

Moving forward, use this cycle for continuous improvement:
1. **Experience** → New interview or practice session
2. **Reflect** → What went well? What could improve?
3. **Analyze** → Identify patterns and root causes
4. **Act** → Implement specific improvements
5. **Review** → Measure progress and adjust approach

---

**Remember**: Every interview is a learning experience. The goal isn't perfection - it's progress. You're already ahead of most candidates simply by taking the time to reflect deeply on your experiences.

What aspect of this analysis would you like to dive deeper into? I'm here to help you prepare for your next interview success!`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Navbar />
      <div className="App" style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        position: 'relative'
      }}>
        {/* Custom Reflection Engine Background Animation */}
        <div className="reflection-bg">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>
          <div className="gradient-beam beam-1"></div>
          <div className="gradient-beam beam-2"></div>
          <div className="gradient-beam beam-3"></div>
          <div className="particle-field">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          padding: '40px 20px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div className="container" style={{
            background: 'var(--card-gradient)',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(20px)',
            textAlign: 'center',
            boxShadow: 'var(--shadow)',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: '16px',
              background: 'var(--accent-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}>
              <MessageSquare size={24} style={{flexShrink: 0, color: '#667eea'}} />
              Reflection Engine AI Coach
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--text-primary)',
              fontWeight: '500',
              margin: 0,
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              Transform your interview experiences into stepping stones for success
            </p>
          </div>

          {/* Chat Container */}
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'var(--card-gradient)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(20px)',
            padding: '0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '600px',
            boxShadow: 'var(--shadow)',
            marginBottom: '20px'
          }}>
            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '30px',
              overflowY: 'auto'
            }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '20px'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '16px 20px',
                    borderRadius: message.type === 'user' ? '20px 20px 8px 20px' : '20px 20px 20px 8px',
                    background: message.type === 'user' 
                      ? 'var(--accent-gradient)'
                      : message.isThinking || message.isAnalyzing
                      ? 'var(--accent-gradient)'
                      : 'var(--bg-secondary)',
                    color: message.type === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    boxShadow: message.type === 'user' 
                      ? '0 8px 25px rgba(65, 105, 225, 0.3)'
                      : '0 4px 15px rgba(0, 0, 0, 0.1)',
                    border: message.type === 'ai' ? '1px solid var(--border-color)' : 'none',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '20px 20px 20px 8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea',
                      animation: 'pulse 1.5s ease-in-out 0.3s infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea',
                      animation: 'pulse 1.5s ease-in-out 0.6s infinite'
                    }}></div>
                    <span style={{ marginLeft: '8px' }}>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'var(--card-gradient)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          padding: '20px',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end',
          boxShadow: 'var(--shadow)'
        }}>
          <textarea
            ref={textareaRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your interview experience or ask a question..."
            disabled={loading}
            style={{
              flex: 1,
              minHeight: '50px',
              maxHeight: '120px',
              padding: '15px 20px',
              borderRadius: '15px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !currentInput.trim()}
            style={{
              padding: '15px 25px',
              borderRadius: '15px',
              border: loading || !currentInput.trim() ? '2px solid var(--border-color)' : 'none',
              background: loading || !currentInput.trim() 
                ? 'var(--bg-secondary)' 
                : 'var(--accent-gradient)',
              color: loading || !currentInput.trim() ? 'var(--text-secondary)' : '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading || !currentInput.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: loading || !currentInput.trim() 
                ? 'none' 
                : 'var(--shadow-glow)',
              opacity: loading || !currentInput.trim() ? 0.6 : 1
            }}
          >
            Send →
          </button>
        </div>
      </div>

      <style jsx>{`
        .reflection-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: var(--accent-gradient);
          opacity: 0.15;
          animation: float 8s ease-in-out infinite;
          filter: blur(1px);
        }

        .shape-1 {
          width: 120px;
          height: 120px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 12s;
        }

        .shape-2 {
          width: 80px;
          height: 80px;
          top: 70%;
          right: 20%;
          animation-delay: -3s;
          animation-duration: 10s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 15%;
          animation-delay: -6s;
          animation-duration: 14s;
        }

        .shape-4 {
          width: 60px;
          height: 60px;
          top: 40%;
          right: 10%;
          animation-delay: -2s;
          animation-duration: 11s;
        }

        .shape-5 {
          width: 90px;
          height: 90px;
          top: 20%;
          left: 50%;
          animation-delay: -8s;
          animation-duration: 13s;
        }

        .gradient-beam {
          position: absolute;
          height: 2px;
          background: var(--accent-gradient);
          opacity: 0.4;
          animation: beam 15s linear infinite;
        }

        .beam-1 {
          width: 200px;
          top: 25%;
          left: -200px;
          animation-delay: 0s;
          transform: rotate(15deg);
        }

        .beam-2 {
          width: 150px;
          top: 60%;
          right: -150px;
          animation-delay: -5s;
          transform: rotate(-20deg);
        }

        .beam-3 {
          width: 180px;
          bottom: 30%;
          left: -180px;
          animation-delay: -10s;
          transform: rotate(10deg);
        }

        .particle-field {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          opacity: 0.7;
          animation: particle 20s linear infinite;
        }

        .particle-1 { top: 10%; left: 20%; animation-delay: 0s; }
        .particle-2 { top: 30%; left: 70%; animation-delay: -2s; }
        .particle-3 { top: 50%; left: 30%; animation-delay: -4s; }
        .particle-4 { top: 70%; left: 80%; animation-delay: -6s; }
        .particle-5 { top: 20%; left: 60%; animation-delay: -8s; }
        .particle-6 { top: 80%; left: 40%; animation-delay: -10s; }
        .particle-7 { top: 40%; left: 10%; animation-delay: -12s; }
        .particle-8 { top: 60%; left: 90%; animation-delay: -14s; }
        .particle-9 { top: 15%; left: 85%; animation-delay: -16s; }
        .particle-10 { top: 85%; left: 25%; animation-delay: -18s; }
        .particle-11 { top: 35%; left: 55%; animation-delay: -3s; }
        .particle-12 { top: 75%; left: 65%; animation-delay: -7s; }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
          }
          75% {
            transform: translateY(-15px) rotate(2deg);
          }
        }

        @keyframes beam {
          0% {
            transform: translateX(-100vw) rotate(15deg);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(100vw) rotate(15deg);
            opacity: 0;
          }
        }

        @keyframes particle {
          0% {
            opacity: 0;
            transform: translateY(0px) scale(0.5);
          }
          10% {
            opacity: 0.7;
            transform: translateY(-10px) scale(1);
          }
          80% {
            opacity: 0.7;
            transform: translateY(-80px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--bg-secondary);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--accent-gradient);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
    </>
  );
}
