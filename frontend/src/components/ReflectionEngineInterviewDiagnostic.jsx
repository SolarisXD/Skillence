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
      content: "*Analyzing your interview experience...*\n\n🔍 **Processing your reflection**\n✅ **Identifying key patterns**\n🎯 **Generating personalized feedback**\n📋 **Creating action plan**",
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
    
    return `## 🎯 **Your Reflection Engine Analysis Complete**

**Profile Summary:**
• **Status**: ${status}
• **Target Skills**: ${skills}
• **Current Mindset**: ${sentiment}

---

### 📊 **Key Patterns Identified**

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

### 🚀 **Personalized Action Plan**

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

### 💡 **Specific Recommendations**

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

### 🔄 **Your Reflection Engine Loop**

Moving forward, use this cycle for continuous improvement:
1. **Experience** → New interview or practice session
2. **Reflect** → What went well? What could improve?
3. **Analyze** → Identify patterns and root causes
4. **Act** → Implement specific improvements
5. **Review** → Measure progress and adjust approach

---

**Remember**: Every interview is a learning experience. The goal isn't perfection - it's progress. You're already ahead of most candidates simply by taking the time to reflect deeply on your experiences.

What aspect of this analysis would you like to dive deeper into? I'm here to help you prepare for your next interview success! 🌟`;
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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a37 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
      {/* Chat Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderRadius: '20px',
          padding: '20px 30px',
          marginBottom: '30px',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: 'var(--text-primary)',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 10px 0'
          }}>
            <span style={{
              background: 'var(--accent-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              💬 Reflection Engine AI Coach
            </span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '16px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Transform your interview experiences into stepping stones for success
          </p>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          background: 'var(--card-gradient)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          padding: '30px',
          marginBottom: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px'
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
                      ? 'linear-gradient(135deg, #4169E1 0%, #87CEEB 100%)'
                      : message.isThinking || message.isAnalyzing
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    color: '#ffffff',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    boxShadow: message.type === 'user' 
                      ? '0 8px 25px rgba(65, 105, 225, 0.3)'
                      : '0 4px 15px rgba(0, 0, 0, 0.1)',
                    border: message.type === 'ai' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
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
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
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
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          padding: '20px',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end'
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
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
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
              border: 'none',
              background: loading || !currentInput.trim() 
                ? 'rgba(100, 100, 100, 0.5)' 
                : 'linear-gradient(135deg, #4169E1 0%, #87CEEB 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading || !currentInput.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: loading || !currentInput.trim() 
                ? 'none' 
                : '0 4px 15px rgba(65, 105, 225, 0.4)'
            }}
          >
            Send →
          </button>
        </div>
      </div>

      <style jsx>{`
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
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }
      `}</style>
    </div>
    </>
  );
}
