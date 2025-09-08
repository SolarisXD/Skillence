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
import Navbar from '../navbar';
import {
  fetchJobList,
  fetchJobAnalysis,
  fetchSkillDemand,
  fetchExperienceDistribution,
  fetchJobTrends
} from './jobTrendAPIService';
import './JobTrendDashboard.css';

const JobTrendDashboard = () => {
  const [selectedJob, setSelectedJob] = useState('');
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
    const loadAvailableJobs = async () => {
      try {
        const jobs = await fetchJobList();
        setAvailableJobs(jobs);
        if (jobs.length > 0) {
          setSelectedJob(jobs[0]);
        }
      } catch (err) {
        setError('Failed to load available jobs');
        console.error('Error loading jobs:', err);
      }
    };

    loadAvailableJobs();
  }, []);

  // Load job-specific data when selected job or time range changes
  useEffect(() => {
    if (selectedJob) {
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

      loadJobData();
    }
  }, [selectedJob, timeRange]);

  const refreshData = async () => {
    if (selectedJob) {
      const loadJobData = async () => {
        try {
          setLoading(true);
          setError(null);

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
          setError(`Failed to refresh data for ${selectedJob}`);
          console.error('Error refreshing data:', err);
        } finally {
          setLoading(false);
        }
      };

      await loadJobData();
    }
  };

  if (loading) {
    return (
      <div className="job-trend-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading job trend data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-trend-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error Loading Data</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={refreshData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!jobAnalysis || !selectedJob) {
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
    <>
      <Navbar />
      <div className="job-trend-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <span className="title-icon">📊</span>
              Job Trend Analysis
            </h1>
            <p className="dashboard-subtitle">
              Real-time insights into career opportunities, skill demands, and market trends
            </p>
          </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="job-select">Select Job Role:</label>
          <select 
            id="job-select"
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            className="control-select"
          >
            {availableJobs.map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
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
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <button 
          onClick={refreshData} 
          className="refresh-btn"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-overview">
        <div className="metric-card primary-metric">
          <div className="metric-header">
            <span className="metric-title">Trendiness Score</span>
            <span className="trend-indicator" style={{ color: trendIndicator.color }}>
              {trendIndicator.icon} {trendIndicator.label}
            </span>
          </div>
          <div className="metric-value">{jobAnalysis.trendiness}%</div>
          <div className="metric-subtitle">Market demand index</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Growth Rate</span>
          </div>
          <div className="metric-value">+{jobAnalysis.growth}%</div>
          <div className="metric-subtitle">Year over year</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Average Salary</span>
          </div>
          <div className="metric-value">{formatSalary(jobAnalysis.averageSalary)}</div>
          <div className="metric-subtitle">Per year</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Job Postings</span>
          </div>
          <div className="metric-value">{jobAnalysis.jobCount.toLocaleString()}</div>
          <div className="metric-subtitle">Available positions</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Trend Chart */}
        <div className="chart-container trend-chart">
          <div className="chart-header">
            <h2 className="chart-title">Job Posting Trends</h2>
            <p className="chart-subtitle">Monthly job posting volume over time</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563EB" 
                strokeWidth={3}
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                name="Job Postings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Demand Chart */}
        <div className="chart-container skills-chart">
          <div className="chart-header">
            <h2 className="chart-title">Top Skills in Demand</h2>
            <p className="chart-subtitle">Most requested skills for {selectedJob}</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={skillDemand} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="skill" 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
                formatter={(value) => [
                  `${value} jobs (${skillDemand.find(s => s.demand === value)?.percentage || 0}%)`,
                  'Demand'
                ]}
              />
              <Bar 
                dataKey="demand" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Experience Distribution Chart */}
        <div className="chart-container experience-chart">
          <div className="chart-header">
            <h2 className="chart-title">Experience Level Distribution</h2>
            <p className="chart-subtitle">Required experience levels for {selectedJob}</p>
          </div>
          <div className="pie-chart-container">
            <ResponsiveContainer width="60%" height={300}>
              <PieChart>
                <Pie
                  data={experienceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {experienceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${props.payload.percentage}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="legend-container">
              <h4 className="legend-title">Experience Levels</h4>
              {experienceDistribution.map((item, index) => (
                <div key={item.level} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="legend-label">{item.level}</span>
                  <span className="legend-value">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default JobTrendDashboard;
