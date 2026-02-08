import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SalaryPredictor.css';

// SVG Icon Components
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const RobotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const LightBulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"></line>
    <line x1="10" y1="22" x2="14" y2="22"></line>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
  </svg>
);

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813 6.088.387-4.773 3.869 1.679 5.931L12 15.497 7.094 19l1.679-5.931-4.773-3.869 6.088-.387L12 3z"></path>
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m5.657-13.657l-4.243 4.243m-6.828 6.828l-4.243 4.243m15.556 0l-4.243-4.243m-6.828-6.828L1.686 2.343"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/job-trends';

// API Functions (consolidated from salaryPredictorAPI.js)
const predictSalary = async (profileData) => {
  const params = new URLSearchParams();
  
  if (profileData.skills && Array.isArray(profileData.skills)) {
    profileData.skills.forEach(skill => params.append('skills', skill));
  }
  
  if (profileData.experience_years) params.append('experience_years', profileData.experience_years);
  if (profileData.location) params.append('location', profileData.location);
  if (profileData.industry) params.append('industry', profileData.industry);
  if (profileData.job_title) params.append('job_title', profileData.job_title);
  if (profileData.company_size) params.append('company_size', profileData.company_size);
  if (profileData.education) params.append('education', profileData.education);
  if (profileData.employment_type) params.append('employment_type', profileData.employment_type);
  if (profileData.experience_level) params.append('experience_level', profileData.experience_level);

  const response = await fetch(`${API_BASE_URL}/predict-salary?${params.toString()}`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

const getSalaryTrendsML = async (jobTitle, months = 12) => {
  const response = await fetch(
    `${API_BASE_URL}/salary-trends-ml/${encodeURIComponent(jobTitle)}?months=${months}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

const getMLModelStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/ml-status`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

const SalaryPredictor = () => {
  const [formData, setFormData] = useState({
    skills: [],
    skillInput: '',
    experience_years: '',
    location: '',
    industry: '',
    job_title: '',
    company_size: 'Medium',
    education: "Bachelor's Degree",
    employment_type: 'Full-time',
    experience_level: 'Mid-Level'
  });

  const [prediction, setPrediction] = useState(null);
  const [salaryTrends, setSalaryTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  
  const skillInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // All 24 valid skills recognized by the ML model
  const validSkills = [
    'python', 'sql', 'tensorflow', 'kubernetes', 'pytorch', 'scala', 
    'linux', 'git', 'java', 'gcp', 'hadoop', 'r', 'tableau', 
    'computer vision', 'data visualization', 'spark', 'mlops', 'azure', 
    'deep learning', 'nlp', 'aws', 'mathematics', 'docker', 'statistics'
  ];

  // Filter suggestions based on input
  const filteredSuggestions = validSkills.filter(skill => 
    skill.toLowerCase().includes(formData.skillInput.toLowerCase()) &&
    !formData.skills.includes(skill)
  );

  // Load ML model status on mount
  useEffect(() => {
    const loadModelStatus = async () => {
      try {
        const status = await getMLModelStatus();
        setModelStatus(status);
      } catch (err) {
        console.error('Failed to load model status:', err);
      }
    };
    loadModelStatus();
  }, []);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        skillInputRef.current &&
        !skillInputRef.current.contains(event.target)
      ) {
        setShowSkillSuggestions(false);
      }
    };

    if (showSkillSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSkillSuggestions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = (skillToAdd = null, event = null) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const skill = (skillToAdd || formData.skillInput).trim().toLowerCase();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
        skillInput: ''
      }));
      setShowSkillSuggestions(false);
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAddSkill();
    } else if (e.key === 'Escape') {
      setShowSkillSuggestions(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    
    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    if (!formData.experience_years || !formData.location || !formData.industry) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);
    setSalaryTrends(null);

    try {
      // Get salary prediction
      const predictionResult = await predictSalary({
        skills: formData.skills,
        experience_years: parseFloat(formData.experience_years),
        location: formData.location,
        industry: formData.industry,
        job_title: formData.job_title || undefined,
        company_size: formData.company_size,
        education: formData.education,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level
      });

      setPrediction(predictionResult);

      // If job title provided, fetch salary trends
      if (formData.job_title) {
        try {
          const trends = await getSalaryTrendsML(formData.job_title, 12);
          setSalaryTrends(trends);
        } catch (err) {
          console.warn('Could not fetch salary trends:', err);
        }
      }

    } catch (err) {
      setError('Failed to predict salary. Please check your inputs and try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#059669';
    if (confidence >= 0.4) return '#d97706';
    return '#dc2626';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="salary-predictor">
      <div className="predictor-header">
        <h2><RobotIcon /> AI Salary Predictor</h2>
        <p>Get personalized salary predictions powered by machine learning</p>
        {modelStatus?.salary_predictor?.loaded && (
          <div className="model-badge">
            <span className="badge-icon"><CheckCircleIcon /></span>
            <span>ML Model Active</span>
          </div>
        )}
      </div>

      <form onSubmit={handlePredict} className="predictor-form">
        {/* Skills Input */}
        <div className="form-section">
          <label className="form-label required">Your Skills</label>
          <p className="skill-hint"><LightBulbIcon /> Start typing to see {validSkills.length} recognized skills, or add any custom skill</p>
          <div className="skills-input-wrapper">
            <div className="skills-input-container" ref={skillInputRef}>
              <input
                type="text"
                name="skillInput"
                value={formData.skillInput}
                onChange={handleInputChange}
                onFocus={() => setShowSkillSuggestions(true)}
                placeholder="Type a skill (e.g., python, react, docker) and press Enter"
                className="form-input"
                autoComplete="off"
                onKeyDown={handleSkillKeyDown}
              />
              <button
                type="button"
                onClick={(e) => handleAddSkill(null, e)}
                className="btn-add-skill"
              >
                Add Skill
              </button>
            </div>
            
            {/* Skill Suggestions Dropdown */}
            {showSkillSuggestions && formData.skillInput && filteredSuggestions.length > 0 && (
              <div className="skill-suggestions" ref={dropdownRef}>
              <div className="suggestions-header">
                <span className="suggestions-title"><SparklesIcon /> Recognized Skills</span>
                <span className="suggestions-count">{filteredSuggestions.length} matches</span>
              </div>
              {filteredSuggestions.slice(0, 8).map(skill => (
                <div
                  key={skill}
                  className="skill-suggestion-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddSkill(skill);
                  }}
                >
                  <span className="suggestion-icon"><CheckIcon /></span>
                  {skill}
                </div>
              ))}
              </div>
            )}
            
            {/* Show all valid skills when input is empty */}
            {showSkillSuggestions && !formData.skillInput && (
              <div className="skill-suggestions all-skills" ref={dropdownRef}>
              <div className="suggestions-header">
                <span className="suggestions-title"><BookIcon /> All Recognized Skills ({validSkills.length})</span>
                <button 
                  type="button" 
                  className="close-suggestions"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSkillSuggestions(false);
                  }}
                >
                  <XIcon />
                </button>
              </div>
              <div className="all-skills-grid">
                {validSkills
                  .filter(skill => !formData.skills.includes(skill))
                  .map(skill => (
                    <div
                      key={skill}
                      className="skill-chip-suggestion"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSkill(skill);
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="skill-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {formData.skills.length === 0 && (
            <p className="form-hint">Add your technical and soft skills</p>
          )}
        </div>

        {/* Required Fields */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleInputChange}
              placeholder="e.g., 3.5"
              step="0.5"
              min="0"
              max="50"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., New York, San Francisco"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Industry</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Consulting">Consulting</option>
              <option value="Media">Media</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Job Title (Optional)</label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleInputChange}
              placeholder="e.g., Software Engineer, Data Scientist"
              className="form-input"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-toggle-advanced"
        >
          {showAdvanced ? '▼' : '▶'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="advanced-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Size</label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Small">Small (1-50)</option>
                  <option value="Medium">Medium (51-500)</option>
                  <option value="Large">Large (500+)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="High School">High School</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Entry-Level">Entry-Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon"><AlertTriangleIcon /></span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || formData.skills.length === 0}
          className="btn-predict"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Predicting...
            </>
          ) : (
            <>
              <span className="btn-icon"><TargetIcon /></span>
              Predict My Salary
            </>
          )}
        </button>
      </form>

      {/* Prediction Results */}
      {prediction && (
        <div className="prediction-results">
          <div className="result-header">
            <h3><ChartIcon /> Your Salary Prediction</h3>
          </div>

          <div className="result-main">
            <div className="predicted-salary">
              <div className="salary-label">Predicted Salary</div>
              <div className="salary-value">
                {formatCurrency(prediction.ml_prediction.predicted_salary)}
              </div>
              <div className="salary-annual">per year</div>
            </div>

            <div className="confidence-meter">
              <div className="confidence-header">
                <span className="confidence-title">Prediction Confidence</span>
                <span className="confidence-badge" style={{ background: getConfidenceColor(prediction.ml_prediction.confidence) }}>
                  {getConfidenceLabel(prediction.ml_prediction.confidence)}
                </span>
              </div>
              
              <div className="confidence-visual">
                <div className="confidence-circle-wrapper">
                  <svg className="confidence-circle" viewBox="0 0 120 120">
                    <circle
                      className="confidence-circle-bg"
                      cx="60"
                      cy="60"
                      r="50"
                    />
                    <circle
                      className="confidence-circle-progress"
                      cx="60"
                      cy="60"
                      r="50"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 50}`,
                        strokeDashoffset: `${2 * Math.PI * 50 * (1 - prediction.ml_prediction.confidence)}`,
                        stroke: getConfidenceColor(prediction.ml_prediction.confidence)
                      }}
                    />
                  </svg>
                  <div className="confidence-percentage-circle">
                    <span className="percentage-value">{(prediction.ml_prediction.confidence * 100).toFixed(0)}</span>
                    <span className="percentage-symbol">%</span>
                  </div>
                </div>
                
                {prediction.ml_prediction.confidence_breakdown && (
                  <div className="confidence-breakdown">
                    <div className="breakdown-title">Confidence Factors</div>
                    <div className="breakdown-items">
                      {prediction.ml_prediction.confidence_breakdown.skills !== undefined && (
                        <div className="breakdown-item">
                          <div className="breakdown-item-header">
                            <span className="breakdown-icon"><TargetIcon /></span>
                            <span className="breakdown-label">Skills Match</span>
                          </div>
                          <div className="breakdown-bar">
                            <div 
                              className="breakdown-fill"
                              style={{ width: `${(prediction.ml_prediction.confidence_breakdown.skills / 0.4) * 100}%` }}
                            />
                          </div>
                          <span className="breakdown-value">{(prediction.ml_prediction.confidence_breakdown.skills * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {prediction.ml_prediction.confidence_breakdown.experience !== undefined && (
                        <div className="breakdown-item">
                          <div className="breakdown-item-header">
                            <span className="breakdown-icon"><BriefcaseIcon /></span>
                            <span className="breakdown-label">Experience</span>
                          </div>
                          <div className="breakdown-bar">
                            <div 
                              className="breakdown-fill"
                              style={{ width: `${(prediction.ml_prediction.confidence_breakdown.experience / 0.15) * 100}%` }}
                            />
                          </div>
                          <span className="breakdown-value">{(prediction.ml_prediction.confidence_breakdown.experience * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {prediction.ml_prediction.confidence_breakdown.location !== undefined && (
                        <div className="breakdown-item">
                          <div className="breakdown-item-header">
                            <span className="breakdown-icon"><MapPinIcon /></span>
                            <span className="breakdown-label">Location</span>
                          </div>
                          <div className="breakdown-bar">
                            <div 
                              className="breakdown-fill"
                              style={{ width: `${(prediction.ml_prediction.confidence_breakdown.location / 0.15) * 100}%` }}
                            />
                          </div>
                          <span className="breakdown-value">{(prediction.ml_prediction.confidence_breakdown.location * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {prediction.ml_prediction.confidence_breakdown.industry !== undefined && (
                        <div className="breakdown-item">
                          <div className="breakdown-item-header">
                            <span className="breakdown-icon"><BuildingIcon /></span>
                            <span className="breakdown-label">Industry</span>
                          </div>
                          <div className="breakdown-bar">
                            <div 
                              className="breakdown-fill"
                              style={{ width: `${(prediction.ml_prediction.confidence_breakdown.industry / 0.15) * 100}%` }}
                            />
                          </div>
                          <span className="breakdown-value">{(prediction.ml_prediction.confidence_breakdown.industry * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {prediction.ml_prediction.confidence_breakdown.optional_details !== undefined && (
                        <div className="breakdown-item">
                          <div className="breakdown-item-header">
                            <span className="breakdown-icon"><SettingsIcon /></span>
                            <span className="breakdown-label">Details</span>
                          </div>
                          <div className="breakdown-bar">
                            <div 
                              className="breakdown-fill"
                              style={{ width: `${(prediction.ml_prediction.confidence_breakdown.optional_details / 0.15) * 100}%` }}
                            />
                          </div>
                          <span className="breakdown-value">{(prediction.ml_prediction.confidence_breakdown.optional_details * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Market Comparison */}
          <div className="market-comparison">
            <h4>Market Comparison</h4>
            <div className="comparison-grid">
              <div className="comparison-item">
                <div className="comparison-label">Market Average</div>
                <div className="comparison-value">
                  {formatCurrency(prediction.market_comparison.average)}
                </div>
              </div>
              <div className="comparison-item">
                <div className="comparison-label">Market Median</div>
                <div className="comparison-value">
                  {formatCurrency(prediction.market_comparison.median)}
                </div>
              </div>
              <div className="comparison-item">
                <div className="comparison-label">Salary Range</div>
                <div className="comparison-value">
                  {formatCurrency(prediction.market_comparison.min)} - {formatCurrency(prediction.market_comparison.max)}
                </div>
              </div>
              {prediction.market_comparison.percentile && (
                <div className="comparison-item">
                  <div className="comparison-label">Your Percentile</div>
                  <div className="comparison-value">
                    Top {100 - prediction.market_comparison.percentile}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Insights */}
          {prediction.insights && (
            <div className={`insights ${prediction.insights.above_market ? 'positive' : 'neutral'}`}>
              <div className="insights-icon">
                {prediction.insights.above_market ? <TrendingUpIcon /> : <ChartIcon />}
              </div>
              <div className="insights-text">
                {prediction.insights.above_market ? (
                  <>
                    Your predicted salary is <strong>{prediction.insights.difference_percent}%</strong> above market average!
                  </>
                ) : (
                  <>
                    Your predicted salary is aligned with market standards.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Matched Skills */}
          {prediction.ml_prediction.matched_skills && prediction.ml_prediction.matched_skills.length > 0 && (
            <div className="matched-skills">
              <h5><CheckIcon /> Skills Recognized by ML Model</h5>
              <div className="matched-skills-list">
                {prediction.ml_prediction.matched_skills.map((skill, index) => (
                  <span key={index} className="matched-skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unmatched Skills Warning */}
          {prediction.ml_prediction.unmatched_skills && prediction.ml_prediction.unmatched_skills.length > 0 && (
            <div className="unmatched-skills-warning">
              <div className="warning-header">
                <span className="warning-icon">ℹ️</span>
                <h5>Skills Not Recognized by Model</h5>
              </div>
              <p className="warning-text">
                The following {prediction.ml_prediction.unmatched_skills.length} skill(s) were not recognized by the ML model and may not affect the prediction. 
                The model was trained on 24 specific technical skills.
              </p>
              <div className="unmatched-skills-list">
                {prediction.ml_prediction.unmatched_skills.map((skill, index) => (
                  <span key={index} className="unmatched-skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="warning-note">
                <LightBulbIcon /> Tip: Try skills like python, sql, tensorflow, docker, aws, azure, etc. for better predictions.
              </p>
            </div>
          )}

          {/* Salary Trends Chart */}
          {salaryTrends && salaryTrends.historical_trends && (
            <div className="salary-trends-section">
              <h4><TrendingUpIcon /> Salary Trends: {salaryTrends.job_title}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salaryTrends.historical_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="average_salary"
                    stroke="var(--accent-color)"
                    strokeWidth={2}
                    name="Average Salary"
                  />
                  <Line
                    type="monotone"
                    dataKey="median_salary"
                    stroke="var(--success-color)"
                    strokeWidth={2}
                    name="Median Salary"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="trends-summary">
                <div>Growth Rate: <strong>{salaryTrends.summary.growth_rate_percent}%</strong></div>
                <div>Current Avg: <strong>{formatCurrency(salaryTrends.summary.current_avg)}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryPredictor;
