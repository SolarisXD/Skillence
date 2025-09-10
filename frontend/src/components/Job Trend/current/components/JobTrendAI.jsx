import React, { useState, useCallback } from 'react';
import { isFeatureEnabled } from '../utils/featureFlags';
import { generateAIInsights } from '../services/jobTrendAPIService';

// ✅ SAFE: AI-powered insights component - isolated in your Job Trend folder
const JobTrendAI = ({ jobData, selectedFilters }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(async () => {
    // Feature flag guard - safe exit if disabled
    if (!isFeatureEnabled('AI_INSIGHTS')) {
      return;
    }

    setLoading(true);
    console.log('🤖 Starting AI insights generation...');
    console.log(' Filters:', selectedFilters);
    
    try {
      // ✅ Create proper data structure for AI insights API
      // The backend expects job postings with job_title field
      const formattedData = [
        {
          job_title: selectedFilters?.selectedJob || "Software Engineer",
          location: selectedFilters?.location || "Remote", 
          experience_level: selectedFilters?.experience_level || "Mid-level",
          industry: selectedFilters?.industry || "Technology",
          company_size: selectedFilters?.company_size || "Medium"
        }
      ];
      
      console.log('📤 Formatted data for AI:', formattedData);
      
      // ✅ SAFE: Use the API service for consistent error handling
      const aiInsights = await generateAIInsights(
        formattedData, // Use formatted data instead of raw trend data
        selectedFilters
      );
      
      console.log('📈 AI insights response:', aiInsights);
      
      if (aiInsights && !aiInsights.error) {
        console.log('✅ Setting insights:', aiInsights);
        setInsights(aiInsights);
      } else {
        console.error('❌ AI insights error:', aiInsights?.error);
        setInsights({ error: aiInsights?.error || 'Unknown error' });
      }
    } catch (error) {
      console.error('💥 AI insights failed:', error);
      setInsights({ error: 'Failed to generate insights' });
      // ✅ SAFE: Graceful failure doesn't affect other features
    } finally {
      console.log('🏁 AI insights generation completed');
      setLoading(false);
    }
  }, [selectedFilters]); // Removed jobData dependency since we create our own formatted data

  // Removed automatic useEffect - make it manual only for better user control
  // useEffect(() => {
  //   if (jobData && jobData.length > 0) {
  //     generateInsights();
  //   }
  // }, [jobData, selectedFilters, generateInsights]);

  // Feature flag guard - safe exit if disabled
  if (!isFeatureEnabled('AI_INSIGHTS')) {
    console.log('JobTrendAI: Feature disabled via flag');
    return null;
  }

  console.log('JobTrendAI: Rendering with jobData:', jobData, 'selectedFilters:', selectedFilters);

  return (
    <div className="job-trend-ai-insights" style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      color: 'white',
      margin: '20px 0',
      border: '3px solid #00ff00' // DEBUG: Green border to make it visible
    }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        🤖 AI Insights (DEBUG: WORKING!)
        {loading && <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />}
      </h3>
      <p>DEBUG: Selected job: {selectedFilters?.selectedJob || 'None'}, Filters: {JSON.stringify(selectedFilters)}</p>

      {insights ? (
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
            <h4>🔍 DEBUG: Insights Data</h4>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(insights, null, 2)}
            </pre>
          </div>
          
          {insights.error ? (
            <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,0,0,0.2)', borderRadius: '5px' }}>
              <h4>❌ Error</h4>
              <p>{insights.error}</p>
            </div>
          ) : (
            <>
              {insights.trends && (
                <div style={{ marginBottom: '15px' }}>
                  <h4>📈 Market Trends</h4>
                  <p>{insights.trends}</p>
                </div>
              )}
              
              {insights.recommendations && Array.isArray(insights.recommendations) && (
                <div style={{ marginBottom: '15px' }}>
                  <h4>💡 Recommendations</h4>
                  <ul style={{ paddingLeft: '20px' }}>
                    {insights.recommendations.map((rec, index) => (
                      <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {insights.skills && Array.isArray(insights.skills) && (
                <div>
                  <h4>🎯 In-Demand Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {insights.skills.map((skill, index) => (
                      <span key={index} style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : !loading && (
        <p style={{ opacity: 0.8 }}>Click "Generate AI Insights" to get intelligent analysis of current job trends.</p>
      )}

      <button
        onClick={generateInsights}
        disabled={loading || !jobData?.length}
        style={{
          background: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.5)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          marginTop: '15px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (!loading) e.target.style.background = 'rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          if (!loading) e.target.style.background = 'rgba(255,255,255,0.2)';
        }}
      >
        {loading ? 'Generating...' : '🔄 Generate AI Insights'}
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
