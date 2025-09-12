import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import ThemeSelector from './ThemeSelector';
import '../styles/navbar.css';

const Navbar = ({ onAuthClick, onAboutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 10) {
        setIsAtTop(true);
        setIsVisible(true);
      } else {
        setIsAtTop(false);
        if (currentScrollY < lastScrollY) {
          // Scrolling up - show navbar
          setIsVisible(true);
        } else {
          // Scrolling down - hide navbar
          setIsVisible(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, location.pathname]);

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
      if (!event.target.closest('.theme-dropdown-container')) {
        setShowThemeSelector(false);
      }
      if (!event.target.closest('.services-dropdown')) {
        setShowServices(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    if (onAuthClick) {
      onAuthClick();
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowAuthModal(false);
  };

  const onSwitchMode = () => {
    setAuthMode((prevMode) => (prevMode === 'login' ? 'signup' : 'login'));
  };

  const scrollToAbout = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToAbout: true } });
    } else {
      const aboutSection = document.getElementById('about-us');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (onAboutClick) {
      onAboutClick();
    }
  };

  const scrollToServices = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToServices: true } });
    } else {
      const servicesSection = document.getElementById('advanced-ai-career-intelligence');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleThemeClick = () => {
    setShowThemeSelector(!showThemeSelector);
  };

  const handleThemeChange = (theme) => {
    // Apply theme change logic here
    setShowThemeSelector(false);
  };

  // Handle navigation on route changes
  useEffect(() => {
    if (location.state?.scrollToAbout) {
      setTimeout(() => {
        const aboutSection = document.getElementById('about-us');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (location.state?.scrollToServices) {
      setTimeout(() => {
        const servicesSection = document.getElementById('advanced-ai-career-intelligence');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <>
      <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'} ${isAtTop ? 'navbar-at-top' : 'navbar-floating'}`}>
        <div className="navbar-container">
          {/* Logo - Left aligned */}
          <div className="navbar-brand" onClick={() => navigate('/')}>
            <h1>Skillence</h1>
          </div>
          
          {/* Navigation Menu - Center-left with proper spacing */}
          <div className="navbar-menu">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a href="#about-us" className="nav-link" onClick={scrollToAbout}>About Us</a>
              </li>
              <li className="nav-item services-dropdown" onClick={() => setShowServices(!showServices)}>
                <button className={`nav-link services-toggle ${showServices ? 'open' : ''}`} type="button">
                  Services
                  <svg viewBox="0 0 24 24" className="chevron-icon">
                    <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                  </svg>
                </button>
                {showServices && (
                  <div className="services-menu dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/job-offer-evaluator');
                        setShowServices(false);
                      }}
                    >
                      Job Offer Evaluator
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/job-trends');
                        setShowServices(false);
                      }}
                    >
                      Job Trend Analysis
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/career-path-recommendation');
                        setShowServices(false);
                      }}
                    >
                      Career Path Recommendation
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
          
          {/* Actions Section - Right aligned */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                {/* Dashboard Button - Only shown when logged in */}
                <button 
                  className="dashboard-btn"
                  onClick={() => navigate('/dashboard/resume')}
                  title="Dashboard"
                >
                  <svg viewBox="0 0 24 24" className="dashboard-icon">
                    <path fill="currentColor" d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
                  </svg>
                  <span>Dashboard</span>
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
                      <button 
                        onClick={() => {
                          navigate('/profile');
                          setShowDropdown(false);
                        }} 
                        className="dropdown-item"
                      >
                        <svg viewBox="0 0 24 24" className="dropdown-icon">
                          <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                        </svg>
                        Profile
                      </button>
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

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav active">
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <a 
                href="#about-us" 
                className="mobile-nav-link" 
                onClick={(e) => {
                  scrollToAbout(e);
                  setMobileMenuOpen(false);
                }}
              >
                About Us
              </a>
            </li>
            <li className="mobile-nav-item">
              <a 
                href="#advanced-ai-career-intelligence" 
                className="mobile-nav-link"
                onClick={(e) => {
                  scrollToServices(e);
                  setMobileMenuOpen(false);
                }}
              >
                Services
              </a>
            </li>
            <li className="mobile-nav-item">
              <button
                className="mobile-nav-link"
                onClick={() => {
                  navigate('/job-offer-evaluator');
                  setMobileMenuOpen(false);
                }}
              >
                Job Offer Evaluator
              </button>
            </li>
          </ul>
          
          {isAuthenticated && (
            <div className="mobile-auth-buttons">
              <button 
                className="btn-primary"
                onClick={() => {
                  navigate('/dashboard/resume');
                  setMobileMenuOpen(false);
                }}
              >
                Resume Dashboard
              </button>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="mobile-auth-buttons">
              <button 
                className="btn-secondary"
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  openAuthModal('signup');
                  setMobileMenuOpen(false);
                }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          mode={authMode}
          onSuccess={handleAuthSuccess}
          onSwitchMode={onSwitchMode}
        />
      )}
    </>
  );
};

export default Navbar;
