import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  fetchJobList,
  fetchJobAnalysis,
  fetchSkillDemand,
  fetchExperienceDistribution,
  fetchJobTrends
} from './jobTrendAPIService';
import './JobTrendDashboard.css';

const JobTrendDashboard = () => {
  const [selectedJob, setSelectedJob] = useState('AI Engineer');
  const [timeRange, setTimeRange] = useState('6m');
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [skillDemand, setSkillDemand] = useState([]);
  const [experienceDistribution, setExperienceDistribution] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [error, setError] = useState(null);

  // Load initial data on component mount
  useEffect(() => {
    loadAvailableJobs();
  }, []);

  // Load job-specific data when selected job or time range changes
  useEffect(() => {
    if (selectedJob) {
      loadJobData();
    }
  }, [selectedJob, timeRange]);

  const loadAvailableJobs = async () => {
    try {
      const jobs = await fetchJobList();
      setAvailableJobs(jobs);
      if (jobs.length > 0 && !selectedJob) {
        setSelectedJob(jobs[0]);
      }
    } catch (err) {
      setError('Failed to load available jobs');
      console.error('Error loading jobs:', err);
    }
  };

  const loadJobData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [analysis, skills, experience, trends] = await Promise.all([
        fetchJobAnalysis(selectedJob, timeRange),
        fetchSkillDemand(selectedJob, 8),
        fetchExperienceDistribution(selectedJob),
        fetchJobTrends(selectedJob, 'postings')
      ]);

      setJobAnalysis(analysis);
      setSkillDemand(skills);
      setExperienceDistribution(experience);
      setTrendData(trends);
    } catch (err) {
      setError(`Failed to load data for ${selectedJob}. Please try again.`);
      console.error('Error loading job data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadJobData();
  };

  if (loading) {
    return (
      <div className="job-trend-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading job trend data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-trend-dashboard">
        <div className="error-container">
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={refreshData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!jobAnalysis || loading) {
    return null;
  }

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const formatSalary = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIndicator = (score) => {
    if (score >= 90) return { icon: '🔥', label: 'Hot', color: '#EF4444' };
    if (score >= 80) return { icon: '📈', label: 'Trending', color: '#F59E0B' };
    if (score >= 70) return { icon: '📊', label: 'Stable', color: '#10B981' };
    return { icon: '📉', label: 'Cooling', color: '#6B7280' };
  };

  const trendIndicator = getTrendIndicator(jobAnalysis.trendiness);

  return (
    <div className="job-trend-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            AI Job Trend Intelligence
          </h1>
          <p className="dashboard-subtitle">
            Real-time insights into AI career opportunities, skill demands, and market trends
          </p>
        </div>
      </div>

      {/* Job Selection Controls */}
      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="job-select">Select Job Role:</label>
          <select 
            id="job-select"
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            className="control-select"
          >
            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="AI Architect">AI Architect</option>
            <option value="NLP Engineer">NLP Engineer</option>
            <option value="Computer Vision Engineer">Computer Vision Engineer</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="time-range">Time Range:</label>
          <select 
            id="time-range"
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="control-select"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="24months">Last 2 Years</option>
          </select>
        </div>
      </div>

      {/* Job Metrics Cards */}
      <div className="metrics-grid">
        {Object.entries(jobMetrics).map(([job, metrics]) => {
          const trend = getTrendIndicator(metrics.trendScore);
          const isSelected = job === selectedJob;
          
          return (
            <div 
              key={job}
              className={`metric-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedJob(job)}
            >
              <div className="metric-header">
                <h3 className="metric-title">{job}</h3>
                <div className="trend-indicator" style={{ color: trend.color }}>
                  <span className="trend-icon">{trend.icon}</span>
                  <span className="trend-label">{trend.label}</span>
                </div>
              </div>
              
              <div className="metric-stats">
                <div className="stat-item">
                  <span className="stat-label">Trend Score</span>
                  <span className="stat-value trend-score">{metrics.trendScore}/100</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Growth</span>
                  <span className="stat-value growth">{metrics.growth}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Salary</span>
                  <span className="stat-value salary">{formatSalary(metrics.avgSalary)}</span>
                </div>
              </div>
              
              <div className="hot-skills">
                <span className="skills-label">Hot Skills:</span>
                <div className="skills-tags">
                  {metrics.hotSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="charts-section">
        {/* Trend Chart */}
        <div className="chart-container trend-chart">
          <div className="chart-header">
            <h2 className="chart-title">Job Trendiness Over Time</h2>
            <p className="chart-subtitle">Comparative trend scores for AI roles</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={jobTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 12 }}
                domain={[60, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ML Engineer" 
                stroke="#2563EB" 
                strokeWidth={3}
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Data Scientist" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="AI Architect" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="NLP Engineer" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Demand Chart */}
        <div className="chart-container skills-chart">
          <div className="chart-header">
            <h2 className="chart-title">Skills in Demand</h2>
            <p className="chart-subtitle">Market demand vs average salary</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={skillDemandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="skill" 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
                formatter={(value, name) => [
                  name === 'demand' ? `${value}% of jobs` : formatSalary(value),
                  name === 'demand' ? 'Market Demand' : 'Avg Salary'
                ]}
              />
              <Bar 
                dataKey="demand" 
                fill="#2563EB" 
                radius={[4, 4, 0, 0]}
                name="demand"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Experience Level Distribution */}
      <div className="charts-section">
        <div className="chart-container experience-chart">
          <div className="chart-header">
            <h2 className="chart-title">Experience Level Distribution</h2>
            <p className="chart-subtitle">Job opportunities by experience level</p>
          </div>
          <div className="experience-content">
            <ResponsiveContainer width="50%" height={300}>
              <PieChart>
                <Pie
                  data={experienceLevelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="percentage"
                >
                  {experienceLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="experience-details">
              {experienceLevelData.map((item, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <div 
                      className="experience-color" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="experience-level">{item.level}</span>
                  </div>
                  <div className="experience-stats">
                    <div className="experience-stat">
                      <span className="stat-label">Jobs Available:</span>
                      <span className="stat-value">{item.jobs.toLocaleString()}</span>
                    </div>
                    <div className="experience-stat">
                      <span className="stat-label">Avg Salary:</span>
                      <span className="stat-value">{formatSalary(item.salary)}</span>
                    </div>
                    <div className="experience-stat">
                      <span className="stat-label">Market Share:</span>
                      <span className="stat-value">{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h2 className="insights-title">Key Market Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🚀</div>
            <h3>Fastest Growing Skills</h3>
            <p>MLOps and NLP leading with 23% growth each, driven by production AI deployments</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <h3>Salary Premiums</h3>
            <p>PyTorch skills command highest premiums, with Computer Vision roles seeing 17% growth</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <h3>Experience Balance</h3>
            <p>Market shows healthy distribution across all experience levels, with strong entry opportunities</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🔥</div>
            <h3>Hot Market</h3>
            <p>AI job market remains robust with 900+ monthly postings and increasing benefits competition</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTrendDashboard;
