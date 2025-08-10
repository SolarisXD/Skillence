import React, { useEffect } from 'react'
import Navbar from './components/navbar'
import AuthModal from './components/AuthModal'
import './App.css'

function App() {
  // Apply theme on app mount as a backup
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  return (
    <div className="App">
      <Navbar />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                Transform Your Career with
                <span className="gradient-text"> AI-Powered Learning</span>
              </h1>
              <p className="hero-description">
                Discover personalized skill development paths, connect with industry experts, 
                and accelerate your professional growth with cutting-edge AI technology.
              </p>
              <div className="hero-actions">
                <button className="btn-primary large">
                  Start Your Journey
                  <svg viewBox="0 0 24 24" className="btn-icon">
                    <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                  </svg>
                </button>
                <button className="btn-secondary large">
                  Watch Demo
                  <svg viewBox="0 0 24 24" className="btn-icon">
                    <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card">
                <div className="card-header">
                  <div className="card-avatar"></div>
                  <div className="card-info">
                    <h4>AI Learning Path</h4>
                    <p>Personalized for you</p>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="container">
            <div className="section-header">
              <h2>Why Choose Skillence?</h2>
              <p>Experience the future of professional development</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                  </svg>
                </div>
                <h3>AI-Powered Insights</h3>
                <p>Get personalized recommendations based on your skills, goals, and market trends.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
                  </svg>
                </div>
                <h3>Expert Network</h3>
                <p>Connect with industry professionals and mentors who can guide your career journey.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
                  </svg>
                </div>
                <h3>Career Growth</h3>
                <p>Track your progress and see measurable improvements in your professional development.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about-us" className="about-us">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>About Skillence</h2>
                <p>
                  We're revolutionizing professional development through AI-powered learning experiences. 
                  Our platform combines cutting-edge technology with human expertise to create personalized 
                  career growth paths that adapt to your unique goals and learning style.
                </p>
                <p>
                  Founded by industry veterans and AI researchers, Skillence bridges the gap between 
                  traditional education and the rapidly evolving job market, ensuring you stay ahead 
                  in your career journey.
                </p>
                <div className="stats">
                  <div className="stat">
                    <h3>10K+</h3>
                    <p>Active Learners</p>
                  </div>
                  <div className="stat">
                    <h3>500+</h3>
                    <p>Expert Mentors</p>
                  </div>
                  <div className="stat">
                    <h3>95%</h3>
                    <p>Success Rate</p>
                  </div>
                </div>
              </div>
              <div className="about-visual">
                <div className="about-image-placeholder">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Skillence</h3>
              <p>Empowering careers through AI-driven learning and professional development.</p>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#community">Community</a></li>
                <li><a href="#api">API Docs</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#privacy">Privacy</a></li>
                <li><a href="#terms">Terms</a></li>
                <li><a href="#security">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2024 Skillence. All rights reserved.</p>
              <div className="social-links">
                <a href="#twitter">Twitter</a>
                <a href="#linkedin">LinkedIn</a>
                <a href="#github">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App