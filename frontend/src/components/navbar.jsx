import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import '../styles/navbar.css';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 10) {
        setIsAtTop(true);
        setIsVisible(true);
      } else {
        setIsAtTop(false);
        if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    }
  };

  const scrollToAbout = (e) => {
    e.preventDefault();
    document.getElementById('about-us').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setShowDropdown(false);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  return (
    <>
      <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'} ${isAtTop ? 'navbar-at-top' : 'navbar-floating'}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>Skillence</h1>
          </div>
          
          <div className="navbar-menu">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a href="#about-us" className="nav-link" onClick={scrollToAbout}>About Us</a>
              </li>
              <li className="nav-item">
                <a href="#services" className="nav-link">Services</a>
              </li>
            </ul>
          </div>
          
          <div className="navbar-actions">
            {isAuthenticated ? (
              <div className="profile-dropdown">
                <button 
                  className="profile-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="profile-icon">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <a href="/profile" className="dropdown-item">Profile</a>
                    <button onClick={handleSignOut} className="dropdown-item">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  className="btn-secondary"
                  onClick={() => openAuthModal('login')}
                >
                  Sign In
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => openAuthModal('signup')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        mode={authMode}
        onSwitchMode={switchAuthMode}
      />
    </>
  );
};

export default Navbar;