import React, { useState, useCallback } from 'react';
import { isFeatureEnabled } from '../utils/featureFlags';

const JobTrendAI = ({ selectedFilters }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(async () => {
    if (!isFeatureEnabled('AI_INSIGHTS')) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/job-trends/ai-insights-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: selectedFilters?.selectedJob || "Software Engineer",
          location: selectedFilters?.location || "Remote",
          experience_level: selectedFilters?.experience_level || "Mid-level",
          industry: selectedFilters?.industry || "Technology",
          filters: selectedFilters
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const aiInsights = await response.json();
      
      if (aiInsights && !aiInsights.error) {
        setInsights(aiInsights);
      } else {
        setInsights({ error: aiInsights?.error || 'Failed to generate insights' });
      }
    } catch (error) {
      console.error('AI insights failed:', error);
      setInsights({ error: 'Failed to generate insights. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [selectedFilters]);

  if (!isFeatureEnabled('AI_INSIGHTS')) {
    return null;
  }

  return (
    <div className="job-trend-ai-insights" style={{
      padding: '24px',
      background: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      margin: '20px 0',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          margin: '0',
          fontSize: '1.4rem',
          fontWeight: '600'
        }}>
          AI Market Insights
        </h3>
        {loading && (
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
      </div>

      {insights ? (
        <div style={{ marginTop: '20px' }}>
          {insights.error ? (
            <div style={{ 
              padding: '16px', 
              background: 'var(--error-bg)', 
              borderRadius: '8px',
              border: '1px solid var(--error-border)'
            }}>
              <h4 style={{ color: 'var(--error-text)', margin: '0 0 8px 0' }}>Unable to Generate Insights</h4>
              <p style={{ color: 'var(--error-text)', margin: '0' }}>{insights.error}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {insights.marketOverview && (
                <div style={{ 
                  padding: '20px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    margin: '0 0 12px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Market Overview
                  </h4>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    {insights.marketOverview}
                  </p>
                </div>
              )}
              
              {insights.careerAdvice && insights.careerAdvice.length > 0 && (
                <div style={{ 
                  padding: '20px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    margin: '0 0 16px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Career Recommendations
                  </h4>
                  <ul style={{ 
                    margin: '0', 
                    paddingLeft: '20px',
                    color: 'var(--text-secondary)'
                  }}>
                    {insights.careerAdvice.map((advice, index) => (
                      <li key={index} style={{ 
                        marginBottom: '8px',
                        lineHeight: '1.5'
                      }}>
                        {advice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {insights.skillsRecommendations && insights.skillsRecommendations.length > 0 && (
                <div style={{ 
                  padding: '20px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    margin: '0 0 16px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Skills to Focus On
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                  }}>
                    {insights.skillsRecommendations.map((skill, index) => (
                      <span key={index} style={{
                        background: 'var(--accent-color)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {insights.salaryInsights && (
                <div style={{ 
                  padding: '20px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    margin: '0 0 12px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Salary Insights
                  </h4>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    {insights.salaryInsights}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ 
            color: 'var(--text-secondary)', 
            margin: '0 0 20px 0',
            fontSize: '1rem'
          }}>
            Get AI-powered insights about market trends, career advice, and skill recommendations for your selected job role.
          </p>
        </div>
      )}

      <button
        onClick={generateInsights}
        disabled={loading}
        style={{
          background: loading ? 'var(--bg-secondary)' : 'var(--accent-color)',
          border: '1px solid var(--border-color)',
          color: loading ? 'var(--text-secondary)' : 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          marginTop: '20px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '0.95rem',
          fontWeight: '500',
          width: '100%'
        }}
      >
        {loading ? 'Generating AI Insights...' : 'Generate AI Insights'}
      </button>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JobTrendAI;
