import { useState, useRef, useEffect } from "react";
import Navbar from "./navbar";
import Icons from "./Icons/ReflectionEngineIcons.jsx";

export default function ReflectionEngineInterviewDiagnostic() {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationState, setConversationState] = useState("greeting");
  const [userContext, setUserContext] = useState({
    status: "",
    skills: "",
    sentiment: "",
    interviewReflection: "",
    pastMistakes: []
  });
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
    // Initial greeting message - no user authentication required
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: "ai",
          content: `Welcome to Reflection Engine! I'm your AI Interview Coach, and I'm here to help you transform your interview experiences into your next success story. I know interviews can feel overwhelming, but remember - every experience is a stepping stone toward your goals.\n\nLet's start by getting to know you better. What's your current situation? Are you a student preparing for placements, someone looking to switch careers, or perhaps a recent graduate navigating the job market? I want to understand your journey so I can provide the most relevant guidance.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const generateContextualResponse = () => {
    const sentiment = userContext.sentiment.toLowerCase();
    if (sentiment.includes('anxious') || sentiment.includes('nervous')) {
      return "I hear that anxiety in your response, and that's completely normal. Interview anxiety affects most people, even experienced professionals. The fact that you're aware of it is the first step toward managing it.";
    } else if (sentiment.includes('frustrated') || sentiment.includes('annoyed')) {
      return "I can sense your frustration, and honestly, that passion can be a strength when channeled right. Sometimes frustration means you care deeply about succeeding, which is valuable.";
    } else if (sentiment.includes('excited') || sentiment.includes('optimistic')) {
      return "I love your positive energy! That enthusiasm will serve you well. Let's make sure your next interview matches that excitement.";
    } else if (sentiment.includes('overwhelmed') || sentiment.includes('stressed')) {
      return "Feeling overwhelmed is so common in job searching. Let's break things down into manageable pieces together.";
    } else {
      return "Thank you for sharing how you're feeling. Understanding your emotional state helps me provide better guidance.";
    }
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

    let aiResponse = "";
    let nextState = conversationState;

    try {
      switch (conversationState) {
        case "greeting":
          setUserContext(prev => ({ ...prev, status: inputValue }));
          
          setTimeout(() => {
            aiResponse = `I understand you're ${inputValue.toLowerCase()}. That context really helps me tailor my guidance to your specific situation!\n\nNow, let's dive into the technical side - what specific skills, technologies, or role were you interviewing for? The more specific you can be (like "Full Stack Developer with React and Node.js" or "Data Scientist with Python and Machine Learning"), the better I can understand the expectations and challenges you faced.`;
            nextState = "skills";
            
            const aiMessage = {
              id: Date.now() + 1,
              type: "ai",
              content: aiResponse,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setConversationState(nextState);
            setLoading(false);
          }, 1000);
          return;
          
        case "skills":
          setUserContext(prev => ({ ...prev, skills: inputValue }));
          
          setTimeout(() => {
            aiResponse = `Perfect! ${inputValue} - I have a clear picture of the technical landscape you're navigating. These skills are definitely in demand, which is great!\n\nNow, I want to understand how you're feeling about all this. Job searching and interviews can be an emotional rollercoaster - are you feeling anxious about your performance, frustrated with the process, excited but nervous, or maybe overwhelmed? There's no wrong answer here, and understanding your emotional state helps me provide the right kind of support.`;
            nextState = "sentiment";
            
            const aiMessage = {
              id: Date.now() + 1,
              type: "ai",
              content: aiResponse,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setConversationState(nextState);
            setLoading(false);
          }, 1200);
          return;
          
        case "sentiment":
          setUserContext(prev => ({ ...prev, sentiment: inputValue }));
          
          setTimeout(() => {
            const contextualResponse = generateContextualResponse();
            aiResponse = `${contextualResponse}\n\nNow that I understand your background and how you're feeling, I'm ready to dive into the main event - your interview experience. Take your time and tell me everything that happened. I want to hear about:\n\n• The questions that caught you off guard\n• Moments when you felt confident\n• Times when you stumbled or felt uncertain\n• Technical challenges you faced\n• Anything you wish you had said differently\n\nRemember, there's no judgment here - every detail helps me understand your experience better and provide more personalized guidance. The more honest and detailed you are, the better I can help you turn this experience into preparation for your next success.`;
            nextState = "reflection";
            
            const aiMessage = {
              id: Date.now() + 1,
              type: "ai",
              content: aiResponse,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setConversationState(nextState);
            setLoading(false);
          }, 1500);
          return;
          
        case "reflection":
          setUserContext(prev => ({ ...prev, interviewReflection: inputValue }));
          
          const thinkingMessage = {
            id: Date.now(),
            type: "ai",
            content: "Let me carefully read through your interview experience and understand what happened...\n\n*Reading and processing your reflection...*",
            timestamp: new Date(),
            isThinking: true
          };
          setMessages(prev => [...prev, thinkingMessage]);
          
          setTimeout(() => {
            setMessages(prev => prev.filter(m => !m.isThinking));
            aiResponse = `Thank you for sharing your interview experience so openly. I can tell you've put real thought into reflecting on what happened, and that self-awareness is already a huge strength.\n\nBefore I analyze your experience, are there any recurring patterns or mistakes from past interviews that you'd like me to consider? For example, things like "I always get nervous with coding challenges" or "I struggle with behavioral questions" or "I tend to ramble in my answers"?\n\nYou can either tell me about any patterns you've noticed, or just say "none" or "let's proceed" if you'd prefer to jump straight into the analysis.`;
            nextState = "pastMistakes";
            
            const aiMessage = {
              id: Date.now() + 1,
              type: "ai",
              content: aiResponse,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setConversationState(nextState);
            setLoading(false);
          }, 2500);
          return;
          
        case "pastMistakes":
          if (inputValue.toLowerCase().includes("none") || inputValue.toLowerCase().includes("proceed")) {
            setUserContext(prev => ({ ...prev, pastMistakes: [] }));
          } else {
            const mistakes = inputValue.split(',').map(m => m.trim()).filter(m => m.length > 0);
            setUserContext(prev => ({ ...prev, pastMistakes: mistakes }));
          }
          
          aiResponse = "Perfect! I now have all the context I need. Let me analyze your interview experience and provide personalized feedback and actionable strategies. This might take a moment as I'm processing everything you've shared...";
          nextState = "analyzing";
          
          setTimeout(() => {
            handleAnalysis();
          }, 1000);
          break;

        case "completed":
          setTimeout(() => {
            let contextualResponse = "";
            
            if (inputValue.toLowerCase().includes('higher studies') || inputValue.toLowerCase().includes('masters')) {
              contextualResponse = `That's a great question about higher studies vs job opportunities! Based on our previous conversation about your interview experiences, I can definitely help you think through this decision.\n\nHere are some key factors to consider:\n\n**For Higher Studies:**\n• **Specialization**: Advanced degrees allow deeper expertise in your field\n• **Research opportunities**: If you're interested in innovation and cutting-edge work\n• **Long-term career growth**: Some roles require advanced degrees\n• **Network building**: Academic connections can be valuable\n\n**For Job First:**\n• **Real-world experience**: Practical skills and industry exposure\n• **Financial independence**: Start earning and gaining work experience\n• **Immediate impact**: Apply your current skills right away\n• **Learning while working**: Many companies offer continuous learning opportunities\n\nWhat specific field are you considering for higher studies? And what are your main concerns about choosing between the two paths?`;
            } else {
              contextualResponse = `That's a great follow-up question! Based on everything we've discussed, here are some additional insights:\n\n**Remember the key takeaways from our analysis:**\n• Focus on the patterns we identified in your interview experience\n• Practice the specific areas where you felt less confident\n• Use the STAR method for behavioral questions\n• Prepare concrete examples that showcase your skills\n\n**For your next interview:**\n• Review the technical concepts we discussed\n• Practice explaining your thought process out loud\n• Prepare questions that show your genuine interest in the role\n• Remember that confidence comes from preparation\n\nIs there any specific aspect of interview preparation you'd like me to elaborate on?`;
            }
            
            const aiMessage = {
              id: Date.now() + 1,
              type: "ai",
              content: contextualResponse,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setLoading(false);
          }, 1200);
          return;

        default:
          aiResponse = "I'm here to help you with your interview preparation. What would you like to know more about?";
          break;
      }

      if (aiResponse) {
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setConversationState(nextState);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "I apologize, but I encountered an error processing your message. Please try again.",
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
      content: "*Analyzing your interview experience...*\n\n<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' style='display:inline-block;vertical-align:middle'><circle cx='11' cy='11' r='8' fill='none' stroke='currentColor' stroke-width='2'/><path d='M21 21l-4.35-4.35'/></svg> **Processing your reflection**\n<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' style='display:inline-block;vertical-align:middle'><path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/></svg> **Identifying key patterns**\n<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' style='display:inline-block;vertical-align:middle'><circle cx='12' cy='12' r='10' fill='none' stroke='currentColor' stroke-width='2'/><circle cx='12' cy='12' r='3'/></svg> **Generating personalized feedback**\n<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' style='display:inline-block;vertical-align:middle'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/></svg> **Creating action plan**",
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
              <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' style={{flexShrink: 0}}><path d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/></svg>
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
