import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import ThemeSelector from './ThemeSelector';
import '../styles/navbar.css';

const Navbar = ({ onAuthClick, onAboutClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
      if (!event.target.closest('.theme-dropdown-container') && !event.target.closest('.theme-selector-dropdown')) {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleThemeChange = (theme) => {
    console.log('Theme changed to:', theme);
  };

  const handleThemeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowThemeSelector(!showThemeSelector);
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
              <>
                <button className="dashboard-btn">
                  <svg viewBox="0 0 24 24" className="dashboard-icon">
                    <path fill="currentColor" d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
                  </svg>
                  Dashboard
                </button>
                
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
                      <a href="/profile" className="dropdown-item">
                        <svg viewBox="0 0 24 24" className="dropdown-icon">
                          <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                        </svg>
                        Profile
                      </a>
                      <div className="dropdown-item theme-dropdown-container">
                        <button 
                          className="theme-dropdown-btn"
                          onClick={handleThemeClick}
                        >
                          <svg viewBox="0 0 24 24" className="dropdown-icon">
                            <path fill="currentColor" d="M12,18V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,15.31L23.31,12L20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31Z" />
                          </svg>
                          Theme
                          <svg viewBox="0 0 24 24" className="chevron-icon">
                            <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                          </svg>
                        </button>
                        {showThemeSelector && (
                          <ThemeSelector
                            isOpen={showThemeSelector}
                            onClose={() => setShowThemeSelector(false)}
                            onThemeChange={handleThemeChange}
                          />
                        )}
                      </div>
                      <button onClick={handleSignOut} className="dropdown-item">
                        <svg viewBox="0 0 24 24" className="dropdown-icon">
                          <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
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