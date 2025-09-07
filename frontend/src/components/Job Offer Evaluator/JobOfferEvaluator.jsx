import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobOfferEvaluator.css';

const JobOfferEvaluator = () => {
  const navigate = useNavigate();
  
  // Navbar state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: '',
    salary: '',
    currency: 'USD',
    city: '',
    country: '',
    healthInsurance: false,
    remoteWork: false,
    esops: false,
    learningBudget: false,
    otherInsurance: false
  });

  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

  // Job roles data
  const jobRoles = [
    'Software Engineer', 'Software Developer', 'Software Architect',
    'Data Scientist', 'Data Analyst', 'Data Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Cloud Engineer', 'ML Engineer',
    'Product Manager', 'Project Manager', 'Scrum Master',
    'UX Designer', 'UI Designer', 'Graphic Designer',
    'QA Engineer', 'Test Engineer', 'Security Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer',
    'Database Administrator', 'System Administrator', 'Network Engineer'
  ];

  // Cities data
  const cities = [
    'New York', 'London', 'Tokyo', 'San Francisco', 'Berlin',
    'Singapore', 'Sydney', 'Toronto', 'Amsterdam', 'Paris',
    'Los Angeles', 'Chicago', 'Boston', 'Seattle', 'Austin',
    'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune',
    'Dublin', 'Zurich', 'Stockholm', 'Copenhagen', 'Helsinki',
    'Tel Aviv', 'Hong Kong', 'Seoul', 'Shanghai', 'Beijing'
  ];

  // Countries data
  const countries = [
    'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia',
    'Singapore', 'Netherlands', 'France', 'Switzerland', 'Sweden',
    'Denmark', 'Norway', 'Finland', 'Japan', 'South Korea',
    'India', 'China', 'Israel', 'Ireland', 'Austria',
    'Belgium', 'Spain', 'Italy', 'Portugal', 'Poland'
  ];

  // Currency symbols
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Handle suggestions visibility
    if (name === 'jobTitle') {
      setShowJobSuggestions(value.length > 0);
    } else if (name === 'city') {
      setShowCitySuggestions(value.length > 0);
    } else if (name === 'country') {
      setShowCountrySuggestions(value.length > 0);
    }
  };

  const handleSuggestionClick = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'jobTitle') setShowJobSuggestions(false);
    if (field === 'city') setShowCitySuggestions(false);
    if (field === 'country') setShowCountrySuggestions(false);
  };

  const filterSuggestions = (list, query) => {
    return list.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  const getCurrentCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.currency);
    return currency ? currency.symbol : '$';
  };

  // Navbar functions
  useEffect(() => {
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

    checkAuthStatus();

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Job Offer Data:', formData);
    // TODO: Add evaluation logic here
  };

  return (
    <>
      {/* Navbar */}
      <nav className="job-evaluator-navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-brand" onClick={() => navigate('/')}>
            <h1>Skillence</h1>
          </div>
          
          {/* Navigation Menu */}
          <div className="navbar-menu">
            <ul className="navbar-nav">
              <li className="nav-item">
                <span className="nav-link active">Job Offer Evaluator</span>
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
          
          {/* Actions Section */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
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
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/register')}
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
              <span className="mobile-nav-link active">Job Offer Evaluator</span>
            </li>
            {isAuthenticated && (
              <li className="mobile-nav-item">
                <button 
                  className="mobile-nav-link" 
                  onClick={() => {
                    navigate('/dashboard/resume');
                    setMobileMenuOpen(false);
                  }}
                >
                  Dashboard
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="job-offer-evaluator">
      <div className="container">
        <h1 className="title">Job Offer Evaluation</h1>
        
        <form onSubmit={handleSubmit} className="evaluation-form">
          <div className="form-group">
            <label htmlFor="jobTitle" className="form-label">
              Job Role / Title
            </label>
            <div className="autocomplete-container">
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                onFocus={() => setShowJobSuggestions(formData.jobTitle.length > 0)}
                onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                placeholder="e.g. Software Engineer, Data Scientist"
                className="form-input"
              />
              {showJobSuggestions && (
                <div className="suggestions-dropdown">
                  {filterSuggestions(jobRoles, formData.jobTitle).map((role, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={() => handleSuggestionClick('jobTitle', role)}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Offered Salary
            </label>
            <div className="salary-input-container">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="currency-select"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="Enter salary amount"
                className="form-input salary-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Job Location
            </label>
            <div className="location-inputs">
              <div className="autocomplete-container">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onFocus={() => setShowCitySuggestions(formData.city.length > 0)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  placeholder="City"
                  className="form-input location-input"
                />
                {showCitySuggestions && (
                  <div className="suggestions-dropdown">
                    {filterSuggestions(cities, formData.city).map((city, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onMouseDown={() => handleSuggestionClick('city', city)}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="autocomplete-container">
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  onFocus={() => setShowCountrySuggestions(formData.country.length > 0)}
                  onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                  placeholder="Country"
                  className="form-input location-input"
                />
                {showCountrySuggestions && (
                  <div className="suggestions-dropdown">
                    {filterSuggestions(countries, formData.country).map((country, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onMouseDown={() => handleSuggestionClick('country', country)}
                      >
                        {country}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Additional Benefits
            </label>
            <div className="benefits-container">
              <div className="benefit-item">
                <input
                  type="checkbox"
                  id="healthInsurance"
                  name="healthInsurance"
                  checked={formData.healthInsurance}
                  onChange={handleInputChange}
                  className="benefit-checkbox"
                />
                <label htmlFor="healthInsurance" className="benefit-label">
                  Health Insurance
                </label>
              </div>

              <div className="benefit-item">
                <input
                  type="checkbox"
                  id="remoteWork"
                  name="remoteWork"
                  checked={formData.remoteWork}
                  onChange={handleInputChange}
                  className="benefit-checkbox"
                />
                <label htmlFor="remoteWork" className="benefit-label">
                  Remote Work
                </label>
              </div>

              <div className="benefit-item">
                <input
                  type="checkbox"
                  id="esops"
                  name="esops"
                  checked={formData.esops}
                  onChange={handleInputChange}
                  className="benefit-checkbox"
                />
                <label htmlFor="esops" className="benefit-label">
                  ESOPs
                </label>
              </div>

              <div className="benefit-item">
                <input
                  type="checkbox"
                  id="learningBudget"
                  name="learningBudget"
                  checked={formData.learningBudget}
                  onChange={handleInputChange}
                  className="benefit-checkbox"
                />
                <label htmlFor="learningBudget" className="benefit-label">
                  Learning Budget
                </label>
              </div>

              <div className="benefit-item">
                <input
                  type="checkbox"
                  id="otherInsurance"
                  name="otherInsurance"
                  checked={formData.otherInsurance}
                  onChange={handleInputChange}
                  className="benefit-checkbox"
                />
                <label htmlFor="otherInsurance" className="benefit-label">
                  Other Insurance Benefits
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="evaluate-button">
            Evaluate Offer
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default JobOfferEvaluator;
