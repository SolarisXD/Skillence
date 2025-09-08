import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import './CareerPathRecommendation.css';

const CareerPathRecommendation = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileSummary, setProfileSummary] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
  }, [navigate]);

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
        setRecommendations(data.recommendations || []);
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

  return (
    <div>
      <Navbar />
      <div className="career-path-container">
        <h1>Career Path Recommendation</h1>
        <p>Analyze your profile to get personalized career recommendations.</p>
        
        <button 
          className="analyze-button" 
          onClick={analyzeCareerPath}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Career Path'}
        </button>
        
        {loading && (
          <div className="loading-message">
            Analyzing your career path... This may take a moment.
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {hasAnalyzed && recommendations.length > 0 && (
          <div>
            <h2>Your Career Recommendations</h2>
            
            {profileSummary && (
              <p><strong>Profile Summary:</strong> {profileSummary}</p>
            )}
            
            {recommendations.map((rec, index) => (
              <div key={rec.occupation_code} className="recommendation-card">
                <h3 className="recommendation-title">
                  #{index + 1}: {rec.title}
                </h3>
                
                <div className="recommendation-score">
                  Overall Score: {(rec.score * 100).toFixed(1)}%
                </div>
                
                <div className="scores-breakdown">
                  Tech: {(rec.tech_score * 100).toFixed(1)}% | Skills: {(rec.traditional_score * 100).toFixed(1)}% | AI: {(rec.ai_score * 100).toFixed(1)}%
                </div>
                
                {rec.hot_tech_matches && rec.hot_tech_matches.length > 0 && (
                  <div className="skills-section">
                    <strong>🔥 Hot Technologies ({rec.hot_tech_matches.length}):</strong>
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
                    <strong>💻 Other Tech Skills ({rec.regular_tech_matches.length}):</strong>
                    <div className="skills-list">
                      {rec.regular_tech_matches.map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {rec.required_skills && rec.required_skills.length > 0 && (
                  <div className="skills-section">
                    <strong>🎯 Required Skills:</strong>
                    <div className="skills-list">
                      {rec.required_skills.slice(0, 8).map((skill, idx) => (
                        <span key={idx} className="skill-tag skill-required">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {rec.explanation && (
                  <div className="skills-section">
                    <p><strong>Why this matches:</strong> {rec.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPathRecommendation;
