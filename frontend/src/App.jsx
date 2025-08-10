import React from 'react'
import Navbar from './components/navbar'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      
      <main className="main-content">
        {/* Main content area - currently empty */}
      </main>
      
      <footer id="about-us" className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Skillence</h3>
              <p>Empowering careers through AI-driven learning and development. We help professionals advance their skills and achieve their career goals.</p>
            </div>
            
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#press">Press</a></li>
                <li><a href="#investors">Investors</a></li>
                <li><a href="#blog">Blog</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#community">Community</a></li>
                <li><a href="#guidelines">Guidelines</a></li>
                <li><a href="#status">Status</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
                <li><a href="#licenses">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2025 Skillence. All rights reserved.</p>
              <div className="social-links">
                <a href="#linkedin" aria-label="LinkedIn">LinkedIn</a>
                <a href="#twitter" aria-label="Twitter">Twitter</a>
                <a href="#facebook" aria-label="Facebook">Facebook</a>
                <a href="#instagram" aria-label="Instagram">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App