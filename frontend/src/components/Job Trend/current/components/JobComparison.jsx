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
    console.log('JobComparison: Feature disabled via flag');
    return null; // Feature disabled, no impact on existing functionality
  }

  console.log('JobComparison: Rendering with availableJobs:', availableJobs);

  return (
    <div className="job-comparison-panel" style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      borderRadius: '12px',
      color: 'white',
      margin: '20px 0',
      border: '3px solid #ff0000' // DEBUG: Red border to make it visible
    }}>
      <div className="comparison-header">
        <h3>🔄 Compare Job Titles (DEBUG: WORKING!)</h3>
        <p>Select up to 3 jobs to compare side by side. Available: {availableJobs?.length || 0} jobs</p>
      </div>

      <div className="job-selector">
        <select 
          onChange={(e) => addJobToComparison(e.target.value)}
          value=""
        >
          <option value="">Add job to comparison...</option>
          {availableJobs
            .filter(job => !selectedJobs.includes(job))
            .map(job => (
              <option key={job} value={job}>{job}</option>
            ))
          }
        </select>
      </div>

      <div className="selected-jobs" style={{ marginTop: '15px' }}>
        <h4>Selected Jobs ({selectedJobs.length}/3):</h4>
        {selectedJobs.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No jobs selected yet. Choose from the dropdown above.</p>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {selectedJobs.map(job => (
              <div key={job} style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 15px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {job}
                <button 
                  onClick={() => removeJobFromComparison(job)}
                  style={{
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Section */}
      <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
        <h4>🔍 DEBUG: Comparison Data</h4>
        <p>Selected Jobs: {selectedJobs.length}</p>
        <p>Comparison Data: {comparisonData.length}</p>
        <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '100px' }}>
          {JSON.stringify({ selectedJobs, comparisonData }, null, 2)}
        </pre>
      </div>

      {selectedJobs.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          {comparisonData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Loading comparison data...</p>
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '10px auto'
              }} />
            </div>
          ) : comparisonData.length > 0 ? (
            <div className="comparison-table">
              <h4>📊 Comparison Results</h4>
              <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <th style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>Metric</th>
                      {selectedJobs.map(job => (
                        <th key={job} style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>
                          {job}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
                        Total Postings
                      </td>
                      {comparisonData.map((data, idx) => (
                        <td key={idx} style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>
                          {data?.total_postings || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
                        Avg Salary
                      </td>
                      {comparisonData.map((data, idx) => (
                        <td key={idx} style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>
                          ${data?.salary?.average?.toLocaleString() || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
                        Experience Level
                      </td>
                      {comparisonData.map((data, idx) => (
                        <td key={idx} style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>
                          {data?.experience?.average_years ? `${data.experience.average_years.toFixed(1)} years` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
                        Trendiness Score
                      </td>
                      {comparisonData.map((data, idx) => (
                        <td key={idx} style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>
                          {data?.trendiness_score || 'N/A'}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.8 }}>
              No comparison data available. Try selecting different jobs.
            </p>
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
