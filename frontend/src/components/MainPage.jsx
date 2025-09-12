import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import ThemeSelector from './ThemeSelector';
import AuthModal from './AuthModal';
import NeuralBg from './NeuralBg';
import SkillenceChatModal from './Chatbot/SkillenceChatModal';

const MainPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated and redirect to dashboard
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     navigate('/dashboard/resume');
  //   }
  // }, [navigate]);

  const scrollToFooter = () => {
    document.querySelector('.footer').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <>
      <Navbar onAuthClick={() => setShowAuthModal(true)} onAboutClick={scrollToFooter} />
      <ThemeSelector />
      
      <div className="hero-container">
        <NeuralBg />
        <div className="hero-content">
          <h1 className="hero-title">AI-Powered Career Intelligence Platform</h1>
          <p className="main-hero-subtitle">
            Leverage advanced machine learning algorithms to discover personalized career pathways,
            intelligent skill assessments, and data-driven learning roadmaps tailored to your unique
            professional profile and emerging market trends.
          </p>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={() => setShowChatModal(true)}>Launch AI Assistant</button>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <section id="advanced-ai-career-intelligence" className="features-section">
        <div className="container">
          <h2 className="section-title">Advanced AI Career Intelligence</h2>
          <p className="section-subtitle">
            Harness the power of artificial intelligence to unlock your professional potential 
            with data-driven insights and personalized recommendations.
          </p>
          <div className="features-grid">
            
            {/* AI Skill Assessment Feature */}
            <div className="feature-card assessment">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>AI-Powered Skill Assessment</h3>
              <p>Upload your resume or complete intelligent forms to receive comprehensive skill analysis using advanced natural language processing and machine learning algorithms.</p>
              <div className="feature-tech">
                <span className="tech-tag">ML Analytics</span>
                <span className="tech-tag">NLP Processing</span>
                <span className="tech-tag">AI Assessment</span>
              </div>
            </div>

            {/* Market Intelligence Analysis */}
            <div className="feature-card market">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <h3>Real-Time Market Intelligence</h3>
              <p>AI-driven job market analysis with predictive algorithms showing salary trends, demand forecasting, and emerging skill requirements across industries.</p>
              <div className="trend-preview">
                <div className="mini-chart">
                  <div className="chart-bar" style={{height: '20%'}}></div>
                  <div className="chart-bar" style={{height: '40%'}}></div>
                  <div className="chart-bar" style={{height: '80%'}}></div>
                  <div className="chart-bar" style={{height: '60%'}}></div>
                </div>
                <span className="trend-text">+23% AI demand</span>
              </div>
            </div>

            {/* Intelligent Career Path Recommendations */}
            <div className="feature-card recommendations">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 5.447-2.724A1 1 0 0121 3.618v10.764a1 1 0 01-.553.894L15 18l-6-3z"/>
                </svg>
              </div>
              <h3>Intelligent Career Pathways</h3>
              <p>AI-curated career recommendations using deep learning models trained on industry data, successful career transitions, and emerging technology trends.</p>
              <div className="path-example">
                <span className="role">Data Analyst</span>
                <span className="arrow">→</span>
                <span className="role">AI Engineer</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AI Learning & Progress Section */}
      <section className="learning-section">
        <div className="container">
          <h2 className="section-title">Adaptive Learning Intelligence</h2>
          <p className="section-subtitle">
            Experience personalized education powered by AI algorithms that adapt to your learning style and career objectives.
          </p>
          <div className="learning-grid">
            
            {/* AI-Powered Upskilling Roadmap */}
            <div className="learning-card roadmap">
              <h3>🎯 AI-Generated Learning Roadmaps</h3>
              <p>Machine learning algorithms create personalized learning paths with recommended courses, certifications, and skill-building resources based on your career goals and current competencies.</p>
              <div className="roadmap-preview">
                <div className="step completed">Python Fundamentals</div>
                <div className="step current">Machine Learning Basics</div>
                <div className="step">Neural Networks & Deep Learning</div>
              </div>
            </div>

            {/* Intelligent Progress Tracker */}
            <div className="learning-card progress">
              <h3>📊 Smart Achievement Analytics</h3>
              <p>AI-powered progress tracking with predictive insights, personalized milestones, and intelligent recommendations to optimize your learning journey.</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '72%'}}></div>
                <span className="progress-text">72% Complete</span>
              </div>
              <div className="achievement-badges">
                <div className="badge earned">🏆</div>
                <div className="badge earned">⭐</div>
                <div className="badge locked">🔒</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AI Assistant & Intelligence Section */}
      <section className="business-section">
        <div className="container">
          <h2 className="section-title">AI-Powered Career Intelligence</h2>
          <p className="section-subtitle">
            Advanced artificial intelligence systems providing personalized career guidance and predictive insights.
          </p>
          <div className="business-grid">
            
            {/* AI Career Chatbot */}
            <div className="business-card chatbot">
              <div className="chat-preview">
                <div className="chat-header">
                  <div className="bot-avatar">🤖</div>
                  <h3>AI Career Advisor</h3>
                </div>
                <div className="chat-preview">
                  <div className="message bot">How can I transition from web development to AI engineering?</div>
                  <div className="message user">I recommend starting with Python, machine learning fundamentals, and building portfolio projects with TensorFlow...</div>
                </div>
              </div>
            </div>

            {/* AI Sentiment Analysis */}
            <div className="business-card emotion">
              <h3>💭 AI Career Sentiment Analysis</h3>
              <p>Advanced natural language processing analyzes your career journal entries and provides intelligent insights about job satisfaction and growth opportunities.</p>
              <div className="emotion-example">
                <div className="journal-entry">"I feel overwhelmed by the rapidly changing tech landscape."</div>
                <div className="sentiment-result">
                  <span className="sentiment-tag negative">😰 Learning Anxiety Detected</span>
                  <span className="recommendation">AI suggests: Structured learning plan with achievable milestones</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AI Analytics & Intelligence Section */}
      <section className="analytics-section">
        <div className="container">
          <h2 className="section-title">Advanced Career Analytics</h2>
          <p className="section-subtitle">
            Leverage machine learning insights and predictive analytics to make data-driven career decisions.
          </p>
          <div className="analytics-grid">
            
            {/* AI Location Intelligence */}
            <div className="analytics-card location">
              <h3>🗺️ AI-Powered Geographic Intelligence</h3>
              <p>Machine learning algorithms analyze job market data to provide intelligent heatmaps showing opportunities, salary ranges, and emerging tech hubs by location.</p>
              <div className="heatmap-preview">
                <div className="map-placeholder">
                  <div className="heat-point hot" style={{top: '30%', left: '20%'}}></div>
                  <div className="heat-point medium" style={{top: '50%', left: '60%'}}></div>
                  <div className="heat-point cool" style={{top: '70%', left: '40%'}}></div>
                </div>
              </div>
            </div>

            {/* AI Resume Intelligence */}
            <div className="analytics-card resume">
              <h3>📄 AI Resume Intelligence Engine</h3>
              <p>Advanced natural language processing provides comprehensive resume analysis with intelligent optimization suggestions and ATS compatibility scoring.</p>
              <div className="resume-score">
                <div className="score-circle">
                  <span className="score">92</span>
                  <span className="score-label">Score</span>
                </div>
                <div className="improvements">
                  <div className="improvement">+ Add AI/ML keywords</div>
                  <div className="improvement">+ Include quantified achievements</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Standard Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <h3>AI Skillence</h3>
              <p>Next-generation career intelligence powered by artificial intelligence and machine learning algorithms</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#roadmap">Roadmap</a>
              </div>
              
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#blog">Blog</a>
              </div>
              
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#status">Status</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>&copy; 2025 Skillence. All rights reserved.</p>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      {showChatModal && (
        <SkillenceChatModal onClose={() => setShowChatModal(false)} />
      )}
    </>
  );
};

export default MainPage;
