import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard, User, Palette, LogOut } from 'lucide-react';
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
                  <ChevronRight className="chevron-icon" size={20} />
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
                        navigate('/reflection-engine');
                        setShowServices(false);
                      }}
                    >
                      Reflection Engine
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
                  <LayoutDashboard className="dashboard-icon" size={20} />
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
                        <User className="dropdown-icon" size={20} />
                        Profile
                      </button>
                      <div className="dropdown-item theme-dropdown-container">
                        <button 
                          className="theme-dropdown-btn"
                          onClick={handleThemeClick}
                        >
                          <Palette className="dropdown-icon" size={20} />
                          Theme
                          <ChevronRight className="chevron-icon" size={20} />
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
                        <LogOut className="dropdown-icon" size={20} />
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
