import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../JobTrendNavigation.css';

const JobTrendNavigation = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Job Trend Analysis',
      description: 'Comprehensive analysis of AI job market trends',
      icon: '',
      path: '/job-trends',
      highlights: ['Real-time trend scoring', 'Salary analysis', 'Skill demand tracking']
    },
    {
      title: 'Market Intelligence',
      description: 'Deep insights into job market dynamics',
      icon: '',
      path: '/job-trends',
      highlights: ['Geographic trends', 'Industry growth', 'Experience level demand']
    },
    {
      title: 'Career Guidance',
      description: 'Data-driven career decision support',
      icon: '',
      path: '/job-trends',
      highlights: ['Skill gap analysis', 'Growth opportunities', 'Salary benchmarks']
    }
  ];

  return (
    <div className="job-trend-navigation">
      <div className="navigation-header">
        <h1 className="navigation-title">
          AI Career Intelligence Hub
        </h1>
        <p className="navigation-subtitle">
          Explore data-driven insights into the AI job market and make informed career decisions
        </p>
      </div>

      <div className="features-showcase">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="feature-showcase-card"
            onClick={() => navigate(feature.path)}
          >
            <div className="feature-showcase-icon">{feature.icon}</div>
            <h3 className="feature-showcase-title">{feature.title}</h3>
            <p className="feature-showcase-description">{feature.description}</p>
            <ul className="feature-highlights">
              {feature.highlights.map((highlight, idx) => (
                <li key={idx}>{highlight}</li>
              ))}
            </ul>
            <button className="feature-cta">
              Explore Feature →
            </button>
          </div>
        ))}
      </div>

      <div className="demo-section">
        <div className="demo-card">
          <h2 className="demo-title">
            Live Demo Available
          </h2>
          <p className="demo-description">
            Experience our job trend analysis with real data from 30,000+ AI job postings
          </p>
          <div className="demo-stats">
            <div className="demo-stat">
              <span className="stat-number">30K+</span>
              <span className="stat-label">Job Postings Analyzed</span>
            </div>
            <div className="demo-stat">
              <span className="stat-number">20+</span>
              <span className="stat-label">AI Job Categories</span>
            </div>
            <div className="demo-stat">
              <span className="stat-number">16</span>
              <span className="stat-label">Months of Data</span>
            </div>
          </div>
          <button 
            className="demo-cta"
            onClick={() => navigate('/job-trends')}
          >
            View Job Trends Dashboard
          </button>
        </div>
      </div>

      <div className="insights-preview">
        <h2 className="preview-title">Key Market Insights</h2>
        <div className="insights-grid">
          <div className="insight-preview">
            <div className="insight-metric">+23%</div>
            <div className="insight-label">MLOps Growth</div>
          </div>
          <div className="insight-preview">
            <div className="insight-metric">$115K</div>
            <div className="insight-label">Avg AI Salary</div>
          </div>
          <div className="insight-preview">
            <div className="insight-metric">67%</div>
            <div className="insight-label">Remote Options</div>
          </div>
          <div className="insight-preview">
            <div className="insight-metric">25%</div>
            <div className="insight-label">NLP Demand Growth</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTrendNavigation;
