import React, { useState, useCallback } from 'react';
import { isFeatureEnabled } from '../utils/featureFlags';
import { apiUrl } from '../../../../utils/api';

const JobTrendAI = ({ selectedFilters }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(async () => {
    if (!isFeatureEnabled('AI_INSIGHTS')) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(apiUrl('/api/job-trends/ai-insights-gemini'), {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          margin: '0',
          fontSize: '1.4rem',
          fontWeight: '600',
          textAlign: 'center',
          width: '100%'
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
            animation: 'spin 1s linear infinite',
            position: 'absolute',
            right: '24px'
          }} />
        )}
      </div>

      {/* Simple tagline without separate box */}
      <p style={{ 
        color: 'var(--text-secondary)', 
        margin: '0 0 20px 0',
        fontSize: '1rem',
        textAlign: 'center',
        lineHeight: '1.5'
      }}>
        Get AI-powered insights about market trends, career advice, and skill recommendations for your selected job role.
      </p>

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
            <div style={{ 
              display: 'grid', 
              gap: '20px',
              border: '2px solid white',
              borderRadius: '12px',
              padding: '20px'
            }}>
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
                  <div style={{ 
                    margin: '0', 
                    color: 'var(--text-secondary)'
                  }}>
                    {insights.careerAdvice.map((advice, index) => (
                      <p key={index} style={{ 
                        marginBottom: '12px',
                        lineHeight: '1.6',
                        margin: '0 0 12px 0'
                      }}>
                        {advice}
                      </p>
                    ))}
                  </div>
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
      ) : null}

      <button
        onClick={generateInsights}
        disabled={loading}
        style={{
          background: loading ? 'var(--bg-secondary)' : 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          color: loading ? 'var(--text-secondary)' : 'var(--bg-primary)',
          padding: '12px 24px',
          borderRadius: '8px',
          marginTop: '20px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '0.95rem',
          fontWeight: '600',
          width: '100%',
          boxShadow: 'var(--shadow-md)'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.background = 'var(--text-secondary)';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = 'var(--shadow-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.background = 'var(--text-primary)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }
        }}
      >
        {loading ? 'Generating AI Insights...' : (insights && !insights.error ? 'Generate New Insights' : 'Generate AI Insights')}
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
