import React, { useState, useEffect, useCallback } from 'react';
import { isFeatureEnabled } from '../utils/featureFlags';

// ✅ SAFE: New feature component in your Job Trend folder
const JobComparison = ({ availableJobs }) => {
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  const addJobToComparison = (jobTitle) => {
    if (selectedJobs.length < 3 && !selectedJobs.includes(jobTitle)) {
      setSelectedJobs([...selectedJobs, jobTitle]);
    }
  };

  const removeJobFromComparison = (jobTitle) => {
    setSelectedJobs(selectedJobs.filter(job => job !== jobTitle));
  };

  const loadComparisonData = useCallback(async () => {
    try {
      // ✅ SAFE: Only call your job trend API endpoints
      const comparisons = await Promise.all(
        selectedJobs.map(job => 
          fetch(`http://localhost:8000/api/job-trends/analysis/${encodeURIComponent(job)}`)
            .then(res => res.json())
        )
      );
      setComparisonData(comparisons);
    } catch (error) {
      console.error('Comparison failed:', error);
      // ✅ SAFE: Graceful failure doesn't affect other features
    }
  }, [selectedJobs]);

  useEffect(() => {
    if (selectedJobs.length > 0) {
      loadComparisonData();
    }
  }, [selectedJobs, loadComparisonData]);

  // Feature flag guard - safe exit if disabled
  if (!isFeatureEnabled('JOB_COMPARISON')) {
    return null; // Feature disabled, no impact on existing functionality
  }

  return (
    <div className="job-comparison-panel" style={{
      padding: '24px',
      background: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      margin: '20px 0',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div className="comparison-header">
        <h3 style={{ 
          color: 'var(--text-primary)', 
          margin: '0 0 8px 0',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Job Market Analysis
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          margin: '0',
          fontSize: '0.95rem'
        }}>
          Select up to 3 jobs to compare salaries, trends, and market demand
        </p>
      </div>

      <div className="job-selector" style={{ marginTop: '20px' }}>
        <select 
          onChange={(e) => addJobToComparison(e.target.value)}
          value=""
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          <option value="">+ Add job to comparison...</option>
          {availableJobs
            .filter(job => !selectedJobs.includes(job))
            .map(job => (
              <option key={job} value={job}>{job}</option>
            ))
          }
        </select>
      </div>

      <div className="selected-jobs" style={{ marginTop: '20px' }}>
        <h4 style={{ 
          color: 'var(--text-primary)', 
          margin: '0 0 12px 0',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          Selected Jobs ({selectedJobs.length}/3):
        </h4>
        {selectedJobs.length === 0 ? (
          <p style={{ 
            opacity: 0.7, 
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            margin: '0'
          }}>
            No jobs selected yet. Choose from the dropdown above.
          </p>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap', 
            marginTop: '12px' 
          }}>
            {selectedJobs.map(job => (
              <div key={job} style={{
                background: 'var(--accent-color)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {job}
                <button 
                  onClick={() => removeJobFromComparison(job)}
                  style={{
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJobs.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          {comparisonData.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-color)',
                borderTop: '4px solid var(--accent-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px auto'
              }} />
              <p style={{ 
                color: 'var(--text-secondary)', 
                margin: '0',
                fontSize: '1rem'
              }}>
                Loading comparison data...
              </p>
            </div>
          ) : comparisonData.length > 0 ? (
            <div className="comparison-results">
              <h4 style={{ 
                color: 'var(--text-primary)', 
                margin: '0 0 20px 0',
                fontSize: '1.3rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Detailed Market Comparison
              </h4>
              
              {/* Quick Stats Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px', 
                marginBottom: '24px' 
              }}>
                {comparisonData.map((data, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      height: '4px',
                      background: `linear-gradient(90deg, ${
                        idx === 0 ? '#3b82f6' : 
                        idx === 1 ? '#10b981' : '#f59e0b'
                      }, ${
                        idx === 0 ? '#1d4ed8' : 
                        idx === 1 ? '#059669' : '#d97706'
                      })`
                    }} />
                    
                    <h5 style={{ 
                      color: 'var(--text-primary)', 
                      margin: '0 0 16px 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '8px'
                    }}>
                      {selectedJobs[idx]}
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Market Demand</span>
                        <span style={{ 
                          fontWeight: '600',
                          background: 'var(--accent-color)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {data?.total_postings || 0} jobs
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Avg Salary</span>
                        <span style={{ 
                          color: 'var(--text-primary)', 
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}>
                          ${data?.salary?.average ? Math.round(data.salary.average).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Experience</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                          {data?.experience?.average_years ? `${data.experience.average_years.toFixed(1)}y` : 'N/A'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Trend Score</span>
                        <span style={{ 
                          fontWeight: '600',
                          background: data?.trendiness_score > 70 ? '#10b981' : 
                                     data?.trendiness_score > 40 ? '#f59e0b' : '#ef4444',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {data?.trendiness_score || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Comparison Table */}
              <div style={{ 
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '16px 20px',
                  background: 'var(--accent-color)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Comprehensive Analysis
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-primary)' }}>
                        <th style={{ 
                          padding: '16px 20px', 
                          border: '1px solid var(--border-color)',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                          fontSize: '0.95rem'
                        }}>
                          Metrics
                        </th>
                        {selectedJobs.map((job, idx) => (
                          <th key={job} style={{ 
                            padding: '16px 20px', 
                            border: '1px solid var(--border-color)',
                            textAlign: 'center',
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            background: idx === 0 ? 'rgba(59, 130, 246, 0.1)' : 
                                       idx === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                          }}>
                            {job}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { 
                          label: 'Job Postings', 
                          key: 'total_postings',
                          format: (val) => val?.toLocaleString() || 'N/A'
                        },
                        { 
                          label: 'Average Salary', 
                          key: 'salary.average',
                          format: (val) => val ? `$${Math.round(val).toLocaleString()}` : 'N/A'
                        },
                        { 
                          label: 'Salary Range', 
                          key: 'salary.range',
                          format: (data) => data?.min && data?.max ? 
                            `$${Math.round(data.min).toLocaleString()} - $${Math.round(data.max).toLocaleString()}` : 'N/A'
                        },
                        { 
                          label: 'Median Salary', 
                          key: 'salary.range.median',
                          format: (val) => val ? `$${Math.round(val).toLocaleString()}` : 'N/A'
                        },
                        { 
                          label: 'Experience Required', 
                          key: 'experience.average_years',
                          format: (val) => val ? `${val.toFixed(1)} years` : 'N/A'
                        },
                        { 
                          label: 'Growth Trend', 
                          key: 'trendiness_score',
                          format: (val) => val ? `${val}%` : 'N/A'
                        },
                        { 
                          label: 'Remote Opportunities', 
                          key: 'remote_work.remote_percentage',
                          format: (val) => val ? `${Math.round(val)}%` : 'N/A'
                        }
                      ].map((metric, rowIdx) => (
                        <tr key={metric.label} style={{ 
                          background: rowIdx % 2 === 0 ? 'var(--bg-secondary)' : 'transparent' 
                        }}>
                          <td style={{ 
                            padding: '12px 20px', 
                            border: '1px solid var(--border-color)',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          }}>
                            {metric.label}
                          </td>
                          {comparisonData.map((data, idx) => {
                            const value = metric.key.includes('.') ? 
                              metric.key.split('.').reduce((obj, key) => obj?.[key], data) : 
                              data?.[metric.key];
                            
                            return (
                              <td key={idx} style={{ 
                                padding: '12px 20px', 
                                border: '1px solid var(--border-color)',
                                textAlign: 'center',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                              }}>
                                {metric.format(value)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <p style={{ 
                color: 'var(--text-secondary)', 
                margin: '0',
                fontSize: '1rem'
              }}>
                No comparison data available. Try selecting different jobs.
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JobComparison;
