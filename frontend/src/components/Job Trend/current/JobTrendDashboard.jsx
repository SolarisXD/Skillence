import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, DollarSign, Save, RefreshCw, AlertCircle,Clock } from 'lucide-react';import {
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
import Navbar from '../../navbar';
import CacheCountdown from './components/CacheCountdown';
import {
  fetchJobList,
  fetchJobAnalysis,
  fetchSkillDemand,
  fetchExperienceDistribution,
  fetchJobTrends,
  fetchCacheInfo,
  clearCache,
  fetchFilterOptions,
  exportData,
  exportChart
} from './services/jobTrendAPIService';
import JobComparison from './components/JobComparison';
import JobTrendAI from './components/JobTrendAI';
import SalaryPredictor from './components/SalaryPredictor';
import { isFeatureEnabled } from './utils/featureFlags';
import './JobTrendDashboard.css';

const JobTrendDashboardEnhanced = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'salary-predictor'
  const [selectedJob, setSelectedJob] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [skillDemand, setSkillDemand] = useState([]);
  const [experienceDistribution, setExperienceDistribution] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5); // minutes

  // Advanced filters state
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    experience_level: '',
    company_size: '',
    employment_type: '',
    salary_min: '',
    salary_max: '',
    experience_min: '',
    experience_max: ''
  });

  // Chart refs for export
  const trendChartRef = useRef();
  const skillsChartRef = useRef();
  const experienceChartRef = useRef();

  // Auto-refresh interval
  useEffect(() => {
    let interval;
    if (autoRefresh && selectedJob) {
      interval = setInterval(() => {
        refreshData();
      }, refreshInterval * 60 * 1000); // Convert minutes to milliseconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedJob]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [jobs, options, cache] = await Promise.all([
          fetchJobList(),
          fetchFilterOptions(),
          fetchCacheInfo()
        ]);
        
        setAvailableJobs(jobs);
        setFilterOptions(options);
        setCacheInfo(cache);
        
        if (jobs.length > 0) {
          setSelectedJob(jobs[0]);
        }
      } catch (err) {
        setError('Failed to load initial data');
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, []);

  // Load job-specific data when filters change
  useEffect(() => {
    if (selectedJob) {
      loadJobData();
    }
  }, [selectedJob, timeRange, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJobData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clean filters (remove empty values)
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '' && value !== null)
      );

      // Load all data in parallel
      const [analysis, skills, experience, trends] = await Promise.all([
        fetchJobAnalysis(selectedJob, timeRange, cleanFilters),
        fetchSkillDemand(selectedJob, 8),
        fetchExperienceDistribution(selectedJob).catch(err => {
          console.warn('Experience distribution API failed, using fallback data:', err);
          // Fallback experience distribution data with salary information
          return [
            { level: 'Entry Level', value: 381, percentage: 25.4, avgSalary: 63133, averageSalary: 63133 },
            { level: 'Mid Level', value: 389, percentage: 25.9, avgSalary: 87955, averageSalary: 87955 },
            { level: 'Senior Level', value: 359, percentage: 23.9, avgSalary: 122187, averageSalary: 122187 },
            { level: 'Executive', value: 373, percentage: 24.8, avgSalary: 187723, averageSalary: 187723 }
          ];
        }),
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
    // Also refresh cache info
    try {
      const cache = await fetchCacheInfo();
      setCacheInfo(cache);
    } catch (err) {
      console.error('Error refreshing cache info:', err);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      const cache = await fetchCacheInfo();
      setCacheInfo(cache);
      await refreshData();
    } catch (err) {
      setError('Failed to clear cache');
      console.error('Error clearing cache:', err);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      industry: '',
      experience_level: '',
      company_size: '',
      employment_type: '',
      salary_min: '',
      salary_max: '',
      experience_min: '',
      experience_max: ''
    });
  };

  const handleExport = async (format) => {
    try {
      const exportFilters = {
        job_title: selectedJob,
        time_range: timeRange,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '' && value !== null)
        )
      };
      
      await exportData(format, exportFilters);
    } catch (err) {
      setError(`Failed to export data as ${format.toUpperCase()}`);
      console.error('Export error:', err);
    }
  };

  const handleChartExport = async (chartRef, chartName) => {
    try {
      await exportChart(chartRef, `${selectedJob}_${chartName}_${timeRange}`);
    } catch (err) {
      setError('Failed to export chart');
      console.error('Chart export error:', err);
    }
  };

  const formatSalary = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIndicator = (score) => {
    if (score >= 90) return { icon: '', label: 'Hot', color: '#EF4444' };
    if (score >= 80) return { icon: '', label: 'Trending', color: '#F59E0B' };
    if (score >= 70) return { icon: '', label: 'Stable', color: '#10B981' };
    return { icon: '', label: 'Cooling', color: '#6B7280' };
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
          <div className="error-icon"><AlertCircle size={48} /></div>
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
  const trendIndicator = getTrendIndicator(jobAnalysis.trendiness);

  return (
    <>
      <Navbar />
      <div className="job-trend-dashboard enhanced">
        {/* Header with Reflection Engine Background Animation */}
        <div className="dashboard-header">
          {/* Custom Reflection Engine Background Animation */}
          <div className="reflection-bg">
            {/* Animated Floating Shapes */}
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <div className="floating-shape shape-4"></div>
            <div className="floating-shape shape-5"></div>
            
            {/* Animated Gradient Beams */}
            <div className="gradient-beam beam-1"></div>
            <div className="gradient-beam beam-2"></div>
            <div className="gradient-beam beam-3"></div>
            
            {/* Particle Effects */}
            <div className="particle-field">
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className={`particle particle-${i + 1}`}></div>
              ))}
            </div>
          </div>
          
          <div className="header-content">
            <h1 className="dashboard-title">
              Enhanced{' '}
              <span style={{
                background: 'var(--accent-gradient)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Job Trend Analysis
              </span>
            </h1>
            <p className="dashboard-subtitle">
              Advanced insights with filtering, export, and auto-refresh capabilities
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="tab-icon"><BarChart3 size={18} /></span>
            Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'salary-predictor' ? 'active' : ''}`}
            onClick={() => setActiveTab('salary-predictor')}
          >
            <span className="tab-icon"><DollarSign size={18} /></span>
            Salary Predictor
          </button>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
        {/* Enhanced Controls Section */}
        <div className="enhanced-controls">
          <div className="primary-controls">
            <div className="control-group">
              <label htmlFor="job-select">Job Role:</label>
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
          </div>

          <div className="action-controls">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            >
              Advanced Filters
            </button>
            
            <button 
              onClick={() => setShowExportPanel(!showExportPanel)} 
              className="export-btn"
            >
              Export
            </button>            <button 
              onClick={refreshData} 
              className="refresh-btn"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Cache Info Banner */}
        {cacheInfo && (
          <div className="cache-info-banner">
            <div className="cache-status">
              {cacheInfo.cached ? (
                <>
                  <span className="cache-indicator cached">
                    <Save size={14} /> Cached Data
                  </span>
                  <span className="cache-time">
                    <Clock size={14} /> Updated: {new Date(cacheInfo.last_updated).toLocaleString()}
                  </span>
                  <span className="cache-expires">
                    Expires in: <CacheCountdown cacheInfo={cacheInfo} />
                  </span>
                </>
              ) : (
                <span className="cache-indicator not-cached">
                  <RefreshCw size={14} /> Live Data
                </span>
              )}
            </div>
            <div className="cache-actions">
              <label className="auto-refresh-toggle">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh every
                <select 
                  value={refreshInterval} 
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="refresh-interval-select"
                >
                  <option value={1}>1min</option>
                  <option value={5}>5min</option>
                  <option value={10}>10min</option>
                  <option value={30}>30min</option>
                </select>
              </label>
              <button onClick={handleClearCache} className="clear-cache-btn">
                Clear Cache
              </button>
            </div>
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showFilters && filterOptions && (
          <div className="filters-panel">
            <div className="filters-header">
              <h3>Advanced Filters</h3>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All
              </button>
            </div>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label>Location:</label>
                <select 
                  value={filters.location} 
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="">All Locations</option>
                  {filterOptions.locations.slice(0, 20).map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Industry:</label>
                <select 
                  value={filters.industry} 
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                  <option value="">All Industries</option>
                  {filterOptions.industries.slice(0, 15).map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Experience Level:</label>
                <select 
                  value={filters.experience_level} 
                  onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                >
                  <option value="">All Levels</option>
                  {filterOptions.experience_levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Company Size:</label>
                <select 
                  value={filters.company_size} 
                  onChange={(e) => handleFilterChange('company_size', e.target.value)}
                >
                  <option value="">All Sizes</option>
                  {filterOptions.company_sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Employment Type:</label>
                <select 
                  value={filters.employment_type} 
                  onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  {filterOptions.employment_types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group range-filter">
                <label>Salary Range (USD):</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder={`Min (${formatSalary(filterOptions.salary_range.min)})`}
                    value={filters.salary_min}
                    onChange={(e) => handleFilterChange('salary_min', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder={`Max (${formatSalary(filterOptions.salary_range.max)})`}
                    value={filters.salary_max}
                    onChange={(e) => handleFilterChange('salary_max', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group range-filter">
                <label>Experience (Years):</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder={`Min (${filterOptions.experience_range.min})`}
                    value={filters.experience_min}
                    onChange={(e) => handleFilterChange('experience_min', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder={`Max (${filterOptions.experience_range.max})`}
                    value={filters.experience_max}
                    onChange={(e) => handleFilterChange('experience_max', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {Object.values(filters).some(v => v !== '' && v !== null) && (
              <div className="active-filters">
                <span className="active-filters-label">Active Filters:</span>
                {Object.entries(filters).map(([key, value]) => 
                  value && (
                    <span key={key} className="filter-tag">
                      {key.replace('_', ' ')}: {value}
                      <button onClick={() => handleFilterChange(key, '')}>×</button>
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Export Panel */}
        {showExportPanel && (
          <div className="export-panel">
            <div className="export-header">
              <h3>Export Options</h3>
            </div>
            
            <div className="export-options">
              <div className="export-section">
                <h4>Data Export</h4>
                <div className="export-buttons">
                  <button onClick={() => handleExport('csv')} className="export-option-btn">
                    Export CSV
                  </button>
                  <button onClick={() => handleExport('json')} className="export-option-btn">
                    Export JSON
                  </button>
                </div>
              </div>
              
              <div className="export-section">
                <h4>Chart Export</h4>
                <div className="export-buttons">
                  <button 
                    onClick={() => handleChartExport(trendChartRef, 'trends')} 
                    className="export-option-btn"
                  >
                    Trend Chart
                  </button>
                  <button 
                    onClick={() => handleChartExport(skillsChartRef, 'skills')} 
                    className="export-option-btn"
                  >
                    Skills Chart
                  </button>
                  <button 
                    onClick={() => handleChartExport(experienceChartRef, 'experience')} 
                    className="export-option-btn"
                  >
                    Experience Chart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

          {/* New Remote Work Metric */}
          {jobAnalysis.remoteWork && (
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Remote Work</span>
              </div>
              <div className="metric-value">{jobAnalysis.remoteWork.remote_percentage}%</div>
              <div className="metric-subtitle">Remote/hybrid jobs</div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Trend Chart */}
          <div className="chart-container trend-chart" ref={trendChartRef}>
            <div className="chart-header">
              <h2 className="chart-title">Job Posting Trends</h2>
              <p className="chart-subtitle">Monthly job posting volume over time</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData} key={`trend-${selectedJob}-${timeRange}`}>
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
          <div className="chart-container skills-chart" ref={skillsChartRef}>
            <div className="chart-header">
              <h2 className="chart-title">Top Skills in Demand</h2>
              <p className="chart-subtitle">Most requested skills for {selectedJob}</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={skillDemand} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} key={`skills-${selectedJob}`}>
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

          {/* Experience Distribution Chart - Enhanced */}
          <div className="chart-container experience-chart" ref={experienceChartRef}>
            <div className="chart-header">
              <h2 className="chart-title">Experience Level Distribution</h2>
              <p className="chart-subtitle">Required experience levels for {selectedJob}</p>
            </div>
            <div className="chart-content">
              <div className="pie-chart-section">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart key={`experience-${selectedJob}`}>
                    <Pie
                      data={experienceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {experienceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="pie-center-text">
                      <tspan x="50%" dy="-0.3em" className="pie-center-label">Total Jobs</tspan>
                      <tspan x="50%" dy="1.2em" className="pie-center-value">
                        {experienceDistribution.reduce((total, item) => total + item.value, 0).toLocaleString()}
                      </tspan>
                    </text>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value.toLocaleString()} jobs (${props.payload.percentage}%)`, 
                        props.payload.level
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="experience-details-sidebar">
                {experienceDistribution.map((item, index) => (
                  <div key={item.level} className="experience-level-card">
                    <div className="level-header">
                      <div 
                        className="level-indicator" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="level-name">{item.level}</span>
                    </div>
                    <div className="level-stats">
                      <div className="stat-row">
                        <span className="stat-label">PERCENTAGE:</span>
                        <span className="stat-value percentage">{item.percentage}%</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">JOBS:</span>
                        <span className="stat-value jobs">{item.value.toLocaleString()}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">AVG SALARY:</span>
                        <span className="stat-value salary">
                          ${(item.avgSalary || item.averageSalary) ? (item.avgSalary || item.averageSalary).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Comparison Feature */}
          {isFeatureEnabled('JOB_COMPARISON') && (
            <JobComparison availableJobs={availableJobs} />
          )}

          {/* AI Insights Feature */}
          {isFeatureEnabled('AI_INSIGHTS') && (
            <JobTrendAI 
              jobData={trendData} 
              selectedFilters={{
                selectedJob,
                timeRange,
                ...filters
              }} 
            />
          )}
        </div>
          </>
        )}

        {/* Salary Predictor Tab Content */}
        {activeTab === 'salary-predictor' && (
          <div className="salary-predictor-container">
            <SalaryPredictor />
          </div>
        )}
      </div>
    </>
  );
};

export default JobTrendDashboardEnhanced;
