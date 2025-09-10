// Job Trend API Service - Real Backend Integration with Advanced Features
const API_BASE_URL = 'http://localhost:8000/api/job-trends';

class JobTrendAPIService {
  
  // Build query string from filters object
  buildQueryString(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    return params.toString();
  }

  async fetchJobList() {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error('Error fetching job list:', error);
      throw new Error('Failed to fetch available jobs');
    }
  }

  async fetchJobAnalysis(jobTitle, timeRange = '6m', filters = {}) {
    try {
      const queryParams = {
        time_range: timeRange,
        ...filters
      };
      const queryString = this.buildQueryString(queryParams);
      const url = `${API_BASE_URL}/analysis/${encodeURIComponent(jobTitle)}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the data to match frontend expectations
      return {
        trendiness: data.trendiness_score,
        growth: data.growth_rate,
        averageSalary: data.salary.average,
        salaryRange: data.salary.range,
        jobCount: data.total_postings,
        benefitsScore: data.benefits_score,
        experience: data.experience,
        locations: data.locations,
        industries: data.industries,
        companySizes: data.company_sizes,
        remoteWork: data.remote_work,
        timeRange: data.time_range,
        filtersApplied: data.filters_applied
      };
    } catch (error) {
      console.error('Error fetching job analysis:', error);
      throw new Error(`Failed to analyze job: ${jobTitle}`);
    }
  }

  async fetchSkillDemand(jobTitle, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/skills/${encodeURIComponent(jobTitle)}?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform skills data for chart consumption
      return data.skills.map(skill => ({
        skill: skill.skill,
        demand: skill.demand_count,
        percentage: skill.percentage
      }));
    } catch (error) {
      console.error('Error fetching skill demand:', error);
      throw new Error(`Failed to fetch skill demand for: ${jobTitle}`);
    }
  }

  async fetchExperienceDistribution(jobTitle) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/experience-distribution/${encodeURIComponent(jobTitle)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform for pie chart
      return data.distribution.map(item => ({
        level: this.formatExperienceLevel(item.level),
        value: item.count,
        percentage: item.percentage
      }));
    } catch (error) {
      console.error('Error fetching experience distribution:', error);
      throw new Error(`Failed to fetch experience distribution for: ${jobTitle}`);
    }
  }

  async fetchJobTrends(jobTitle, metric = 'postings') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/trends/${encodeURIComponent(jobTitle)}?metric=${metric}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform trend data for line chart
      return data.trends.map(point => ({
        month: this.formatTrendDate(point.date),
        value: point.value
      }));
    } catch (error) {
      console.error('Error fetching job trends:', error);
      throw new Error(`Failed to fetch trends for: ${jobTitle}`);
    }
  }

  async fetchMarketOverview(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(
        `${API_BASE_URL}/overview?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      throw new Error('Failed to fetch market overview');
    }
  }

  // Utility functions for data formatting
  formatExperienceLevel(level) {
    const levelMap = {
      'EN': 'Entry Level',
      'MI': 'Mid Level', 
      'SE': 'Senior Level',
      'EX': 'Executive'
    };
    return levelMap[level] || level;
  }

  formatTrendDate(dateStr) {
    try {
      // Handle YYYY-MM format from pandas Period
      const [year, month] = dateStr.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    } catch {
      return dateStr;
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  calculateTrendScore(trendData) {
    if (!Array.isArray(trendData) || trendData.length < 2) return 0;
    
    const recent = trendData.slice(-3);
    const older = trendData.slice(0, 3);
    
    const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
    
    if (olderAvg === 0) return 0;
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }

  // New enhanced methods for advanced functionality
  async fetchCacheInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/cache-info`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cache info:', error);
      throw new Error('Failed to fetch cache information');
    }
  }

  async clearCache() {
    try {
      const response = await fetch(`${API_BASE_URL}/clear-cache`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  async fetchFilterOptions() {
    try {
      const response = await fetch(`${API_BASE_URL}/filter-options`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw new Error('Failed to fetch filter options');
    }
  }

  async exportData(format = 'csv', filters = {}) {
    try {
      const queryString = this.buildQueryString(filters);
      const url = `${API_BASE_URL}/export/${format}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle file download
      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || `job_data.${format}`;
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename.replace(/"/g, ''); // Remove quotes
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(`Failed to export data as ${format.toUpperCase()}`);
    }
  }

  // Chart export functionality
  async exportChart(chartRef, filename = 'chart') {
    try {
      if (!chartRef.current) {
        throw new Error('Chart reference not available');
      }

      // Using html2canvas for chart export (will need to install)
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(chartRef.current);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true, filename: `${filename}.png` };
    } catch (error) {
      console.error('Error exporting chart:', error);
      throw new Error('Failed to export chart');
    }
  }

  // Generate AI insights from job data
  async generateAIInsights(jobData, filters) {
    try {
      console.log('🌐 Making AI insights API call...');
      console.log('📤 Request data:', { data: jobData, filters });
      
      const response = await fetch(`${API_BASE_URL}/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: jobData,
          filters: filters
        })
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`AI insights request failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      return result;
    } catch (error) {
      console.error('💥 Error generating AI insights:', error);
      return { error: 'Failed to generate insights' };
    }
  }
}

// Create singleton instance
const jobTrendService = new JobTrendAPIService();

// Export the service functions (existing)
export const fetchJobList = () => jobTrendService.fetchJobList();
export const fetchJobAnalysis = (jobTitle, timeRange, filters) => jobTrendService.fetchJobAnalysis(jobTitle, timeRange, filters);
export const fetchSkillDemand = (jobTitle, limit) => jobTrendService.fetchSkillDemand(jobTitle, limit);
export const fetchExperienceDistribution = (jobTitle) => jobTrendService.fetchExperienceDistribution(jobTitle);
export const fetchJobTrends = (jobTitle, metric) => jobTrendService.fetchJobTrends(jobTitle, metric);
export const fetchMarketOverview = (filters) => jobTrendService.fetchMarketOverview(filters);

// Export new enhanced functions
export const fetchCacheInfo = () => jobTrendService.fetchCacheInfo();
export const clearCache = () => jobTrendService.clearCache();
export const fetchFilterOptions = () => jobTrendService.fetchFilterOptions();
export const exportData = (format, filters) => jobTrendService.exportData(format, filters);
export const exportChart = (chartRef, filename) => jobTrendService.exportChart(chartRef, filename);
export const generateAIInsights = (jobData, filters) => jobTrendService.generateAIInsights(jobData, filters);

export default jobTrendService;
