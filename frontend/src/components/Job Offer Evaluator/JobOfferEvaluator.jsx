import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import './JobOfferEvaluator.css';

// Adzuna API configuration
const ADZUNA_CONFIG = {
  BASE_URL: 'https://api.adzuna.com/v1/api',
  API_KEY: import.meta.env.VITE_ADZUNA_API_KEY,
  APP_ID: import.meta.env.VITE_ADZUNA_APP_ID,
};

// Country code mapping for Adzuna API
const COUNTRY_CODES = {
  'United States': 'us',
  'United Kingdom': 'gb',
  'Germany': 'de',
  'Canada': 'ca',
  'Australia': 'au',
  'Singapore': 'sg',
  'Netherlands': 'nl',
  'France': 'fr',
  'Switzerland': 'ch',
  'Sweden': 'se',
  'Denmark': 'dk',
  'Norway': 'no',
  'Finland': 'fi',
  'Japan': 'jp',
  'South Korea': 'kr',
  'India': 'in',
  'China': 'cn',
  'Israel': 'il',
  'Ireland': 'ie',
  'Austria': 'at',
  'Belgium': 'be',
  'Spain': 'es',
  'Italy': 'it',
  'Portugal': 'pt',
  'Poland': 'pl'
};

// Fallback market data for demo/development
const FALLBACK_MARKET_DATA = {
  jobs: {
    count: 125,
    results: [
      { title: 'Senior Software Engineer', salary_min: 90000, salary_max: 130000 },
      { title: 'Software Developer', salary_min: 70000, salary_max: 100000 },
      { title: 'Full Stack Engineer', salary_min: 85000, salary_max: 120000 },
      { title: 'Data Scientist', salary_min: 95000, salary_max: 140000 },
      { title: 'Product Manager', salary_min: 100000, salary_max: 150000 }
    ]
  }
};

// Adzuna API functions
const adzunaAPI = {
  // Search jobs for salary comparison
  searchJobs: async (country, query, location = '') => {
    const countryCode = COUNTRY_CODES[country] || 'us';
    const url = new URL(`${ADZUNA_CONFIG.BASE_URL}/jobs/${countryCode}/search/1`);
    
    const params = {
      app_id: ADZUNA_CONFIG.APP_ID,
      app_key: ADZUNA_CONFIG.API_KEY,
      what: query,
      where: location,
      results_per_page: 20,
      sort_by: 'salary'
    };
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }
    return await response.json();
  },

  // Get salary histogram data
  getSalaryHistogram: async (country, query, location = '') => {
    const countryCode = COUNTRY_CODES[country] || 'us';
    const url = new URL(`${ADZUNA_CONFIG.BASE_URL}/jobs/${countryCode}/histogram`);
    
    const params = {
      app_id: ADZUNA_CONFIG.APP_ID,
      app_key: ADZUNA_CONFIG.API_KEY,
      what: query,
      where: location
    };
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }
    return await response.json();
  },

  // Get salary history/trends
  getSalaryHistory: async (country, query, location = '') => {
    const countryCode = COUNTRY_CODES[country] || 'us';
    const url = new URL(`${ADZUNA_CONFIG.BASE_URL}/jobs/${countryCode}/history`);
    
    const params = {
      app_id: ADZUNA_CONFIG.APP_ID,
      app_key: ADZUNA_CONFIG.API_KEY,
      what: query,
      where: location
    };
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }
    return await response.json();
  }
};

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

  // API and evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [marketData, setMarketData] = useState(null);

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

  // Helper functions for styling
  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const getPercentileClass = (percentile) => {
    if (percentile >= 75) return 'excellent';
    if (percentile >= 50) return 'good';
    if (percentile >= 25) return 'average';
    return 'poor';
  };

  // Enhanced evaluation function with Adzuna API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.jobTitle || !formData.salary || !formData.country) {
      setApiError('Please fill in all required fields (Job Title, Salary, Country)');
      return;
    }

    if (!ADZUNA_CONFIG.API_KEY || !ADZUNA_CONFIG.APP_ID) {
      // Use fallback data when API is not configured
      console.log('Using fallback market data - API not configured');
      const marketData = {
        ...FALLBACK_MARKET_DATA,
        errors: ['Using demo data - Configure VITE_ADZUNA_API_KEY and VITE_ADZUNA_APP_ID environment variables for real market data']
      };

      setMarketData(marketData);
      const evaluation = evaluateJobOffer(formData, marketData);
      setEvaluationResults(evaluation);
      setIsEvaluating(false);
      return;
    }

    setIsEvaluating(true);
    setApiError(null);
    setEvaluationResults(null);

    try {
      // Fetch market data from Adzuna API
      console.log('Fetching market data for:', formData.jobTitle, 'in', formData.country);
      
      const [jobSearchData, salaryHistogram, salaryHistory] = await Promise.allSettled([
        adzunaAPI.searchJobs(formData.country, formData.jobTitle, formData.city),
        adzunaAPI.getSalaryHistogram(formData.country, formData.jobTitle, formData.city),
        adzunaAPI.getSalaryHistory(formData.country, formData.jobTitle, formData.city)
      ]);

      // Process the API responses
      const marketData = {
        jobs: jobSearchData.status === 'fulfilled' ? jobSearchData.value : null,
        histogram: salaryHistogram.status === 'fulfilled' ? salaryHistogram.value : null,
        history: salaryHistory.status === 'fulfilled' ? salaryHistory.value : null,
        errors: [
          jobSearchData.status === 'rejected' ? `Job Search: ${jobSearchData.reason.message}` : null,
          salaryHistogram.status === 'rejected' ? `Salary Data: ${salaryHistogram.reason.message}` : null,
          salaryHistory.status === 'rejected' ? `Salary History: ${salaryHistory.reason.message}` : null
        ].filter(Boolean)
      };

      setMarketData(marketData);

      // Perform evaluation
      const evaluation = evaluateJobOffer(formData, marketData);
      setEvaluationResults(evaluation);

      console.log('Evaluation completed:', evaluation);

    } catch (error) {
      console.error('Evaluation error:', error);
      setApiError(`Evaluation failed: ${error.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Job offer evaluation logic
  const evaluateJobOffer = (offerData, marketData) => {
    const offerSalary = parseFloat(offerData.salary);
    let evaluation = {
      overall_score: 0,
      salary_analysis: {},
      benefits_score: 0,
      market_insights: {},
      recommendations: []
    };

    // Salary Analysis
    if (marketData.jobs && marketData.jobs.results && marketData.jobs.results.length > 0) {
      const jobs = marketData.jobs.results.filter(job => job.salary_min && job.salary_max);
      
      if (jobs.length > 0) {
        const salaries = jobs.map(job => (job.salary_min + job.salary_max) / 2);
        const avgMarketSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length;
        const minSalary = Math.min(...salaries);
        const maxSalary = Math.max(...salaries);
        
        const percentile = calculatePercentile(offerSalary, salaries);
        
        evaluation.salary_analysis = {
          offer_salary: offerSalary,
          market_average: Math.round(avgMarketSalary),
          market_min: Math.round(minSalary),
          market_max: Math.round(maxSalary),
          percentile: Math.round(percentile),
          difference_from_average: Math.round(offerSalary - avgMarketSalary),
          difference_percentage: Math.round(((offerSalary - avgMarketSalary) / avgMarketSalary) * 100),
          total_jobs_analyzed: jobs.length
        };

        // Salary score (0-40 points)
        if (percentile >= 75) evaluation.overall_score += 40;
        else if (percentile >= 50) evaluation.overall_score += 30;
        else if (percentile >= 25) evaluation.overall_score += 20;
        else evaluation.overall_score += 10;
      }
    }

    // Benefits Analysis (0-30 points)
    const benefits = [
      offerData.healthInsurance,
      offerData.remoteWork,
      offerData.esops,
      offerData.learningBudget,
      offerData.otherInsurance
    ];
    const benefitsCount = benefits.filter(Boolean).length;
    evaluation.benefits_score = benefitsCount * 6; // 6 points per benefit
    evaluation.overall_score += evaluation.benefits_score;

    // Market Insights
    if (marketData.histogram && marketData.histogram.histogram) {
      evaluation.market_insights.salary_distribution = marketData.histogram.histogram;
    }

    if (marketData.history && marketData.history.month) {
      evaluation.market_insights.trend = marketData.history.month;
    }

    // Generate Recommendations
    evaluation.recommendations = generateRecommendations(evaluation);

    // Location factor (0-30 points)
    const locationScore = calculateLocationScore(offerData.city, offerData.country);
    evaluation.overall_score += locationScore;

    // Cap the score at 100
    evaluation.overall_score = Math.min(evaluation.overall_score, 100);

    return evaluation;
  };

  // Helper functions
  const calculatePercentile = (value, array) => {
    const sorted = array.sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    if (index === -1) return 100;
    return (index / sorted.length) * 100;
  };

  const calculateLocationScore = (city, country) => {
    // Simple location scoring - can be enhanced
    const majorCities = ['New York', 'London', 'San Francisco', 'Tokyo', 'Singapore'];
    const majorCountries = ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia'];
    
    let score = 15; // Base score
    if (majorCities.includes(city)) score += 10;
    if (majorCountries.includes(country)) score += 5;
    
    return score;
  };

  const generateRecommendations = (evaluation) => {
    const recommendations = [];
    
    if (evaluation.salary_analysis.percentile) {
      if (evaluation.salary_analysis.percentile < 25) {
        recommendations.push('The salary offer is below market average. Consider negotiating for a higher base salary.');
      } else if (evaluation.salary_analysis.percentile >= 75) {
        recommendations.push('Excellent salary offer! This is above market average.');
      } else {
        recommendations.push('The salary offer is competitive with market rates.');
      }
    }

    if (evaluation.benefits_score < 18) {
      recommendations.push('Consider negotiating for additional benefits like health insurance, remote work options, or learning budget.');
    }

    if (evaluation.overall_score >= 80) {
      recommendations.push('This is an excellent job offer! Strong compensation and benefits package.');
    } else if (evaluation.overall_score >= 60) {
      recommendations.push('This is a good job offer with room for some improvements.');
    } else {
      recommendations.push('This offer may need significant negotiation to match market standards.');
    }

    return recommendations;
  };

  return (
    <>
      <Navbar />

      <div className="job-offer-evaluator">
        {/* Hero Section with Blue Background */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Discover your earning potential</h1>
            <p className="hero-subtitle">
              Evaluate job offers, compare salaries and benefits by industry and location.
            </p>
          </div>
          
          {/* Decorative briefcase icon */}
          <div className="hero-illustration">
            <div className="briefcase-icon">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <rect x="20" y="35" width="60" height="40" rx="4" fill="#d97706" />
                <rect x="35" y="25" width="30" height="15" rx="2" fill="#d97706" />
                <circle cx="50" cy="55" r="3" fill="#fff" />
                <rect x="25" y="40" width="50" height="2" fill="#b45309" />
                <rect x="25" y="65" width="50" height="2" fill="#b45309" />
              </svg>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div className="container">
            <h2 className="section-title">Details</h2>
            
            <form onSubmit={handleSubmit} className="details-form">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    onFocus={() => setShowJobSuggestions(formData.jobTitle.length > 0)}
                    onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                    placeholder="Job title"
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
                <label className="form-label">City</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onFocus={() => setShowCitySuggestions(formData.city.length > 0)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    placeholder="City"
                    className="form-input"
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
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    onFocus={() => setShowCountrySuggestions(formData.country.length > 0)}
                    onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                    placeholder="Country"
                    className="form-input"
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

              <div className="form-group">
                <label className="form-label">Offered Salary</label>
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
                <label className="form-label">Additional Benefits</label>
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

              <button type="submit" className="search-button" disabled={isEvaluating}>
                {isEvaluating ? 'Evaluating...' : 'Evaluate'}
              </button>
            </form>

            {/* API Error Display */}
            {apiError && (
              <div className="error-message">
                <div className="error-content">
                  <h3>⚠️ Error</h3>
                  <p>{apiError}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isEvaluating && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Analyzing market data and evaluating your job offer...</p>
              </div>
            )}

            {/* Evaluation Results */}
            {evaluationResults && (
              <div className="evaluation-results">
                <div className="results-header">
                  <h2>📊 Job Offer Evaluation Results</h2>
                  <div className="overall-score">
                    <span className="score-label">Overall Score:</span>
                    <span className={`score-value ${getScoreClass(evaluationResults.overall_score)}`}>
                      {evaluationResults.overall_score}/100
                    </span>
                  </div>
                </div>

                {/* Salary Analysis */}
                {evaluationResults.salary_analysis.offer_salary && (
                  <div className="analysis-section">
                    <h3>💰 Salary Analysis</h3>
                    <div className="salary-stats">
                      <div className="stat-item">
                        <span className="stat-label">Your Offer:</span>
                        <span className="stat-value">
                          {getCurrentCurrencySymbol()}{evaluationResults.salary_analysis.offer_salary.toLocaleString()}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Market Average:</span>
                        <span className="stat-value">
                          {getCurrentCurrencySymbol()}{evaluationResults.salary_analysis.market_average?.toLocaleString()}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Market Range:</span>
                        <span className="stat-value">
                          {getCurrentCurrencySymbol()}{evaluationResults.salary_analysis.market_min?.toLocaleString()} - {getCurrentCurrencySymbol()}{evaluationResults.salary_analysis.market_max?.toLocaleString()}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Percentile:</span>
                        <span className={`stat-value ${getPercentileClass(evaluationResults.salary_analysis.percentile)}`}>
                          {evaluationResults.salary_analysis.percentile}th percentile
                        </span>
                      </div>
                      {evaluationResults.salary_analysis.difference_from_average !== undefined && (
                        <div className="stat-item">
                          <span className="stat-label">Difference from Average:</span>
                          <span className={`stat-value ${evaluationResults.salary_analysis.difference_from_average >= 0 ? 'positive' : 'negative'}`}>
                            {evaluationResults.salary_analysis.difference_from_average >= 0 ? '+' : ''}
                            {getCurrentCurrencySymbol()}{Math.abs(evaluationResults.salary_analysis.difference_from_average).toLocaleString()} 
                            ({evaluationResults.salary_analysis.difference_percentage >= 0 ? '+' : ''}{evaluationResults.salary_analysis.difference_percentage}%)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="data-source">
                      <small>Based on {evaluationResults.salary_analysis.total_jobs_analyzed} similar job listings</small>
                    </div>
                  </div>
                )}

                {/* Benefits Analysis */}
                <div className="analysis-section">
                  <h3>🎁 Benefits Analysis</h3>
                  <div className="benefits-analysis">
                    <div className="benefits-score-display">
                      <span>Benefits Score: <strong>{evaluationResults.benefits_score}/30</strong></span>
                    </div>
                    <div className="benefits-list">
                      <div className={`benefit-status ${formData.healthInsurance ? 'included' : 'missing'}`}>
                        Health Insurance {formData.healthInsurance ? '✅' : '❌'}
                      </div>
                      <div className={`benefit-status ${formData.remoteWork ? 'included' : 'missing'}`}>
                        Remote Work {formData.remoteWork ? '✅' : '❌'}
                      </div>
                      <div className={`benefit-status ${formData.esops ? 'included' : 'missing'}`}>
                        ESOPs {formData.esops ? '✅' : '❌'}
                      </div>
                      <div className={`benefit-status ${formData.learningBudget ? 'included' : 'missing'}`}>
                        Learning Budget {formData.learningBudget ? '✅' : '❌'}
                      </div>
                      <div className={`benefit-status ${formData.otherInsurance ? 'included' : 'missing'}`}>
                        Other Insurance {formData.otherInsurance ? '✅' : '❌'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Insights */}
                {marketData && (
                  <div className="analysis-section">
                    <h3>📈 Market Insights</h3>
                    <div className="market-insights">
                      {marketData.jobs && (
                        <div className="insight-item">
                          <strong>Job Market:</strong> Found {marketData.jobs.count} job listings for "{formData.jobTitle}" in {formData.country}
                          {!ADZUNA_CONFIG.API_KEY && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#2563eb' }}>
                              💡 <strong>Demo Mode:</strong> This data is simulated. Add your Adzuna API credentials to get real market data.
                            </div>
                          )}
                        </div>
                      )}
                      {marketData.errors.length > 0 && (
                        <div className="api-warnings">
                          <h4>ℹ️ Data Information:</h4>
                          <ul>
                            {marketData.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="analysis-section">
                  <h3>💡 Recommendations</h3>
                  <div className="recommendations-list">
                    {evaluationResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="recommendation-item">
                        <span className="recommendation-bullet">•</span>
                        <span>{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="results-actions">
                  <button 
                    onClick={() => setEvaluationResults(null)} 
                    className="secondary-button"
                  >
                    Evaluate Another Offer
                  </button>
                  <button 
                    onClick={() => window.print()} 
                    className="primary-button"
                  >
                    Print Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobOfferEvaluator;
