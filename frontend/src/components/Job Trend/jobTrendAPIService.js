// Job Trend API Service - Real Backend Integration
const API_BASE_URL = 'http://localhost:8000/api/job-trends';

class JobTrendAPIService {
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

  async fetchJobAnalysis(jobTitle, timeRange = '6m') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analysis/${encodeURIComponent(jobTitle)}?time_range=${timeRange}`
      );
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
        timeRange: data.time_range
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
}

// Create singleton instance
const jobTrendService = new JobTrendAPIService();

// Export the service functions
export const fetchJobList = () => jobTrendService.fetchJobList();
export const fetchJobAnalysis = (jobTitle, timeRange) => jobTrendService.fetchJobAnalysis(jobTitle, timeRange);
export const fetchSkillDemand = (jobTitle, limit) => jobTrendService.fetchSkillDemand(jobTitle, limit);
export const fetchExperienceDistribution = (jobTitle) => jobTrendService.fetchExperienceDistribution(jobTitle);
export const fetchJobTrends = (jobTitle, metric) => jobTrendService.fetchJobTrends(jobTitle, metric);
export const fetchMarketOverview = (filters) => jobTrendService.fetchMarketOverview(filters);

export default jobTrendService;
