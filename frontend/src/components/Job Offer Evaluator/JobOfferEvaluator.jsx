import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
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

  // keep authentication/form state in this page if needed

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Job Offer Data:', formData);
    // TODO: Add evaluation logic here
  };

  return (
    <>
      <Navbar />

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
