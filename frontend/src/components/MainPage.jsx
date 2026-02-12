import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, TrendingUp, Map, Target, Linkedin, Twitter, Github } from 'lucide-react';
import Navbar from './navbar';
import ThemeSelector from './ThemeSelector';
import AuthModal from './AuthModal';
import NeuralBg from './NeuralBg';
import SkillenceChatModal from './Chatbot/SkillenceChatModal';

const MainPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
                <CheckCircle size={48} />
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
                <TrendingUp size={48} />
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
                <Map size={48} />
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
              <h3>◆ AI-Generated Learning Roadmaps</h3>
              <p>Machine learning algorithms create personalized learning paths with recommended courses, certifications, and skill-building resources based on your career goals and current competencies.</p>
              <div className="roadmap-preview">
                <div className="step completed">Python Fundamentals</div>
                <div className="step current">Machine Learning Basics</div>
                <div className="step">Neural Networks & Deep Learning</div>
              </div>
            </div>

            {/* Intelligent Progress Tracker */}
            <div className="learning-card progress">
              <h3>■ Smart Achievement Analytics</h3>
              <p>AI-powered progress tracking with predictive insights, personalized milestones, and intelligent recommendations to optimize your learning journey.</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '72%'}}></div>
                <span className="progress-text">72% Complete</span>
              </div>
              <div className="achievement-badges">
                <div className="badge earned">◆</div>
                <div className="badge earned">★</div>
                <div className="badge locked">■</div>
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
                  <div className="bot-avatar">
                    <Target size={16} />
                  </div>
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
              <h3>◇ AI Career Sentiment Analysis</h3>
              <p>Advanced natural language processing analyzes your career journal entries and provides intelligent insights about job satisfaction and growth opportunities.</p>
              <div className="emotion-example">
                <div className="journal-entry">"I feel overwhelmed by the rapidly changing tech landscape."</div>
                <div className="sentiment-result">
                  <span className="sentiment-tag negative">[!] Learning Anxiety Detected</span>
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
              <h3>■ AI-Powered Geographic Intelligence</h3>
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
              <h3>□ AI Resume Intelligence Engine</h3>
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
                <h4>Company</h4>
                <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About</a>
                <a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }}>Blog</a>
              </div>
              
              <div className="footer-column">
                <h4>Support</h4>
                <a href="/help-center" onClick={(e) => { e.preventDefault(); navigate('/help-center'); }}>Help Center</a>
                <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
                <a href="/status" onClick={(e) => { e.preventDefault(); navigate('/status'); }}>Status</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>&copy; 2025 Skillence. All rights reserved.</p>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="GitHub">
                <Github size={20} />
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
