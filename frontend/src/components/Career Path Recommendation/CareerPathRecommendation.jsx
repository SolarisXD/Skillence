import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import './CareerPathRecommendation.css';

// SVG Icons
const AnalyzeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18,15 12,9 6,15"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

const CareerPathRecommendation = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [normalizedRecommendations, setNormalizedRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileSummary, setProfileSummary] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [savingCareer, setSavingCareer] = useState(null);
  const [currentCareerPath, setCurrentCareerPath] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    // Load existing career path on component mount
    loadCurrentCareerPath();
  }, [navigate]);

  const loadCurrentCareerPath = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/career-path/get-career-path', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.career_path) {
          setCurrentCareerPath(data.career_path);
        }
      }
    } catch (err) {
      console.error('Error loading career path:', err);
    }
  };

  const normalizeScores = (recommendations) => {
    if (!recommendations || recommendations.length === 0) return [];
    
    const scores = recommendations.map(rec => rec.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;
    
    // Normalize to 30-100 range to ensure visible differences
    return recommendations.map(rec => ({
      ...rec,
      normalizedScore: range > 0 ? 30 + ((rec.score - minScore) / range) * 70 : 85
    }));
  };

  const analyzeCareerPath = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please log in to analyze your career path');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/career-path/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const topRecommendations = (data.recommendations || []).slice(0, 5);
        setRecommendations(topRecommendations);
        setNormalizedRecommendations(normalizeScores(topRecommendations));
        setProfileSummary(data.profile_summary || '');
        setHasAnalyzed(true);
      } else {
        setError(data.message || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Career analysis error:', err);
      setError('Failed to analyze career path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveCareerPath = async (career) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSavingCareer(career.occupation_code);
    
    try {
      const response = await fetch('http://localhost:8000/api/career-path/save-career-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          occupation_code: career.occupation_code,
          title: career.title,
          score: career.score,
          explanation: career.explanation || `This role matches your skills with a ${(career.score * 100).toFixed(1)}% compatibility rating.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentCareerPath(data.career_path);
          // Hide the current recommendations when a career is selected
          setHasAnalyzed(false);
          setExpandedCard(null);
        }
      }
    } catch (err) {
      console.error('Error saving career path:', err);
    } finally {
      setSavingCareer(null);
    }
  };

  const toggleCardExpansion = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="career-path-page">
      <Navbar />
      <div className="career-path-container">
        {/* Header Section */}
        <div className="career-path-header">
          <h1 className="career-path-title">Career Path Intelligence</h1>
          <p className="career-path-subtitle">
            Leverage advanced analytics to discover your most suitable career opportunities based on your professional profile and skill portfolio.
          </p>
        </div>

        {/* Action Section */}
        <div className="analyze-section">
          <button 
            className="analyze-button" 
            onClick={analyzeCareerPath}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Analyzing Profile...
              </>
            ) : (
              <>
                <AnalyzeIcon />
                Discover Career Opportunities
              </>
            )}
          </button>
          <p className="analyze-description">
            Fetch your profile data and receive personalized career recommendations powered by industry analysis.
          </p>
        </div>

        {/* Current Career Path Display */}
        {currentCareerPath && (
          <div className="current-career-path">
            <h3 className="current-career-title">Your Selected Career Path</h3>
            <div className="current-career-card">
              <div className="current-career-info">
                <h4>{currentCareerPath.title}</h4>
                <p className="compatibility-score">
                  {(currentCareerPath.score * 100).toFixed(1)}% Compatible
                </p>
                <p className="career-explanation">{currentCareerPath.explanation}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <div className="loading-animation">
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
              <p className="loading-text">Processing your professional profile and matching against career database...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <h4>Analysis Unavailable</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasAnalyzed && normalizedRecommendations.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">Top 5 Career Matches</h2>
              <p className="results-description">
                Based on comprehensive analysis of your skills, experience, and industry trends.
              </p>
            </div>
            
            <div className="recommendations-grid">
              {normalizedRecommendations.map((rec, index) => (
                <div key={rec.occupation_code} className="recommendation-card">
                  <div className="card-header">
                    <div className="card-rank">#{index + 1}</div>
                    <h3 className="card-title">{rec.title}</h3>
                  </div>
                  
                  <div className="compatibility-section">
                    <div className="compatibility-label">
                      <span>Compatibility Score</span>
                      <span className="compatibility-percentage">
                        {rec.normalizedScore.toFixed(0)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${rec.normalizedScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="expand-button"
                      onClick={() => toggleCardExpansion(index)}
                    >
                      <span>View Details</span>
                      {expandedCard === index ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  </div>

                  {expandedCard === index && (
                    <div className="card-details">
                      <div className="details-content">
                        <div className="match-analysis">
                          <h4>Match Analysis</h4>
                          <p className="match-explanation">
                            This role demonstrates strong alignment with your professional profile, 
                            matching {rec.hot_tech_matches?.length || 0} critical technologies and 
                            {rec.regular_tech_matches?.length || 0} additional technical competencies 
                            from your skill portfolio.
                          </p>
                        </div>

                        {rec.hot_tech_matches && rec.hot_tech_matches.length > 0 && (
                          <div className="skills-section">
                            <h5>High-Demand Technologies</h5>
                            <div className="skills-list">
                              {rec.hot_tech_matches.map((skill, idx) => (
                                <span key={idx} className="skill-tag hot-tech">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.regular_tech_matches && rec.regular_tech_matches.length > 0 && (
                          <div className="skills-section">
                            <h5>Technical Competencies</h5>
                            <div className="skills-list">
                              {rec.regular_tech_matches.map((skill, idx) => (
                                <span key={idx} className="skill-tag regular-tech">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="select-career-section">
                          <button 
                            className="select-career-button"
                            onClick={() => saveCareerPath(rec)}
                            disabled={savingCareer === rec.occupation_code}
                          >
                            {savingCareer === rec.occupation_code ? (
                              <>
                                <LoadingSpinner />
                                Saving Selection...
                              </>
                            ) : currentCareerPath?.occupation_code === rec.occupation_code ? (
                              <>
                                <CheckIcon />
                                Currently Selected
                              </>
                            ) : (
                              'Select This Career Path'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPathRecommendation;
