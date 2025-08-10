import { useState } from 'react'
import './App.css'
import Navbar from './components/navbar'
import ThemeSelector from './components/ThemeSelector'
import AuthModal from './components/AuthModal'

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const scrollToFooter = () => {
    document.querySelector('.footer').scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  return (
    <div className="App">
      <Navbar onAuthClick={() => setShowAuthModal(true)} onAboutClick={scrollToFooter} />
      <ThemeSelector />
      
      {/* Hero Section */}
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Transform Your Career with AI-Powered Guidance</h1>
          <p className="hero-subtitle">
            Discover personalized career paths, skill assessments, and learning roadmaps 
            tailored to your unique profile and market trends.
          </p>
          <div className="hero-buttons">
            <button className="cta-button primary">Get Started</button>
            <div className="ai-widget">
              <span className="widget-icon">🤖</span>
              <div className="widget-content">
                <span className="widget-text">AI Learning Path - Personalized for you</span>
                <div className="progress-indicator">
                  <div className="progress-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Intelligent Career Intelligence Platform</h2>
          <div className="features-grid">
            
            {/* Skill Assessment Feature */}
            <div className="feature-card assessment">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Smart Skill Assessment</h3>
              <p>Upload your resume or fill out forms to get AI-powered skill analysis using advanced NLP technology.</p>
              <div className="feature-tech">
                <span className="tech-tag">spaCy</span>
                <span className="tech-tag">BERT</span>
                <span className="tech-tag">NLP</span>
              </div>
            </div>

            {/* Job Market Analysis */}
            <div className="feature-card market">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <h3>Market Trend Analysis</h3>
              <p>Real-time job market insights with interactive graphs showing salary trends and demand patterns.</p>
              <div className="trend-preview">
                <div className="mini-chart">
                  <div className="chart-bar" style={{height: '20%'}}></div>
                  <div className="chart-bar" style={{height: '40%'}}></div>
                  <div className="chart-bar" style={{height: '80%'}}></div>
                  <div className="chart-bar" style={{height: '60%'}}></div>
                </div>
                <span className="trend-text">📈 +15% growth</span>
              </div>
            </div>

            {/* Career Path Recommendations */}
            <div className="feature-card recommendations">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 5.447-2.724A1 1 0 0121 3.618v10.764a1 1 0 01-.553.894L15 18l-6-3z"/>
                </svg>
              </div>
              <h3>Intelligent Career Paths</h3>
              <p>Netflix-style recommendations using collaborative filtering and knowledge graphs for seamless career transitions.</p>
              <div className="path-example">
                <span className="role">Data Analyst</span>
                <span className="arrow">→</span>
                <span className="role">ML Engineer</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Learning & Progress Section */}
      <section className="learning-section">
        <div className="container">
          <div className="learning-grid">
            
            {/* Upskilling Roadmap */}
            <div className="learning-card roadmap">
              <h3>🎯 Personalized Roadmaps</h3>
              <p>Custom learning paths with recommended courses, certifications, and skill-building resources.</p>
              <div className="roadmap-preview">
                <div className="step completed">Python Basics</div>
                <div className="step current">Machine Learning</div>
                <div className="step">Deep Learning</div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="learning-card progress">
              <h3>📊 Achievement Tracker</h3>
              <p>Gamified progress system that grows as you complete your personalized learning roadmap.</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '65%'}}></div>
                <span className="progress-text">65% Complete</span>
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

      {/* AI Assistant Section */}
      <section className="ai-section">
        <div className="container">
          <div className="ai-grid">
            
            {/* Career Chatbot */}
            <div className="ai-card chatbot">
              <div className="chat-header">
                <div className="bot-avatar">🤖</div>
                <h3>Career Assistant</h3>
              </div>
              <div className="chat-preview">
                <div className="message bot">How can I transition to AI/ML from web development?</div>
                <div className="message user">I'd recommend starting with Python and statistics...</div>
              </div>
            </div>

            {/* Emotion Analysis */}
            <div className="ai-card emotion">
              <h3>💭 Sentiment Insights</h3>
              <p>AI-powered analysis of your career journal entries to provide personalized feedback.</p>
              <div className="emotion-example">
                <div className="journal-entry">"I feel drained coding every day."</div>
                <div className="sentiment-result">
                  <span className="sentiment-tag negative">😔 Burnout detected</span>
                  <span className="recommendation">Schedule adjusted to be more relaxed</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="analytics-section">
        <div className="container">
          <div className="analytics-grid">
            
            {/* Location Insights */}
            <div className="analytics-card location">
              <h3>🗺️ Geographic Insights</h3>
              <p>Interactive heatmaps showing job opportunities and salary ranges by location.</p>
              <div className="heatmap-preview">
                <div className="map-placeholder">
                  <div className="heat-point hot" style={{top: '30%', left: '20%'}}></div>
                  <div className="heat-point medium" style={{top: '50%', left: '60%'}}></div>
                  <div className="heat-point cool" style={{top: '70%', left: '40%'}}></div>
                </div>
              </div>
            </div>

            {/* Resume Evaluator */}
            <div className="analytics-card resume">
              <h3>📄 Resume Intelligence</h3>
              <p>AI-powered resume analysis with actionable improvement suggestions and ATS optimization.</p>
              <div className="resume-score">
                <div className="score-circle">
                  <span className="score">87</span>
                  <span className="score-label">Score</span>
                </div>
                <div className="improvements">
                  <div className="improvement">+ Add technical skills</div>
                  <div className="improvement">+ Include metrics</div>
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
              <h3>Skillence</h3>
              <p>AI-powered career guidance for modern professionals</p>
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

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}

export default App