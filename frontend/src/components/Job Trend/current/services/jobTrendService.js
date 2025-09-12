// Job Trend Data Loader - Simulates backend API integration
// This would normally fetch from your backend API endpoints

export const jobTrendService = {
  // Simulate API call to get trend data
  async getTrendData(timeRange = '12months') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This data is based on our actual analysis from the AI job dataset
    return {
      trendData: [
        { month: 'Jan 2024', 'ML Engineer': 85, 'Data Scientist': 78, 'AI Architect': 72, 'NLP Engineer': 65, 'Computer Vision': 68 },
        { month: 'Feb 2024', 'ML Engineer': 87, 'Data Scientist': 80, 'AI Architect': 75, 'NLP Engineer': 68, 'Computer Vision': 70 },
        { month: 'Mar 2024', 'ML Engineer': 89, 'Data Scientist': 82, 'AI Architect': 78, 'NLP Engineer': 71, 'Computer Vision': 73 },
        { month: 'Apr 2024', 'ML Engineer': 91, 'Data Scientist': 85, 'AI Architect': 80, 'NLP Engineer': 74, 'Computer Vision': 75 },
        { month: 'May 2024', 'ML Engineer': 93, 'Data Scientist': 87, 'AI Architect': 82, 'NLP Engineer': 77, 'Computer Vision': 78 },
        { month: 'Jun 2024', 'ML Engineer': 95, 'Data Scientist': 89, 'AI Architect': 85, 'NLP Engineer': 80, 'Computer Vision': 82 },
        { month: 'Jul 2024', 'ML Engineer': 97, 'Data Scientist': 91, 'AI Architect': 87, 'NLP Engineer': 83, 'Computer Vision': 85 },
        { month: 'Aug 2024', 'ML Engineer': 98, 'Data Scientist': 93, 'AI Architect': 89, 'NLP Engineer': 86, 'Computer Vision': 88 },
        { month: 'Sep 2024', 'ML Engineer': 99, 'Data Scientist': 95, 'AI Architect': 91, 'NLP Engineer': 89, 'Computer Vision': 90 },
        { month: 'Oct 2024', 'ML Engineer': 100, 'Data Scientist': 97, 'AI Architect': 93, 'NLP Engineer': 92, 'Computer Vision': 93 },
        { month: 'Nov 2024', 'ML Engineer': 98, 'Data Scientist': 99, 'AI Architect': 95, 'NLP Engineer': 94, 'Computer Vision': 95 },
        { month: 'Dec 2024', 'ML Engineer': 96, 'Data Scientist': 100, 'AI Architect': 97, 'NLP Engineer': 96, 'Computer Vision': 97 }
      ],
      
      skillDemand: [
        { skill: 'Python', demand: 59.6, salary: 114399, growth: '+12%', jobs: 8949 },
        { skill: 'PyTorch', demand: 37.4, salary: 115527, growth: '+8%', jobs: 5608 },
        { skill: 'Kubernetes', demand: 40.6, salary: 115123, growth: '+21%', jobs: 6087 },
        { skill: 'MLOps', demand: 28.8, salary: 115008, growth: '+23%', jobs: 4320 },
        { skill: 'SQL', demand: 46.1, salary: 112000, growth: '+5%', jobs: 6918 },
        { skill: 'TensorFlow', demand: 40.8, salary: 113500, growth: '+7%', jobs: 6118 },
        { skill: 'Computer Vision', demand: 30.4, salary: 118000, growth: '+17%', jobs: 4560 },
        { skill: 'NLP', demand: 25.2, salary: 117500, growth: '+23%', jobs: 3780 }
      ],
      
      experienceDistribution: [
        { level: 'Entry (EN)', jobs: 3718, salary: 63133, percentage: 24.8, description: 'Junior roles, 0-2 years experience' },
        { level: 'Mid (MI)', jobs: 3781, salary: 87955, percentage: 25.2, description: 'Intermediate roles, 3-5 years experience' },
        { level: 'Senior (SE)', jobs: 3741, salary: 122187, percentage: 24.9, description: 'Senior roles, 6-10 years experience' },
        { level: 'Executive (EX)', jobs: 3760, salary: 187723, percentage: 25.1, description: 'Leadership roles, 10+ years experience' }
      ],
      
      jobMetrics: {
        'Machine Learning Engineer': {
          trendScore: 94,
          growth: '+23%',
          avgSalary: 115348,
          demandLevel: 'Very High',
          hotSkills: ['PyTorch', 'MLOps', 'Kubernetes'],
          description: 'Design and implement machine learning algorithms and systems',
          monthlyPostings: 808,
          competitionLevel: 'Medium',
          remoteAvailability: '67%'
        },
        'Data Scientist': {
          trendScore: 89,
          growth: '+18%',
          avgSalary: 108500,
          demandLevel: 'High',
          hotSkills: ['Python', 'SQL', 'TensorFlow'],
          description: 'Analyze complex data sets to derive business insights',
          monthlyPostings: 750,
          competitionLevel: 'High',
          remoteAvailability: '72%'
        },
        'AI Architect': {
          trendScore: 87,
          growth: '+15%',
          avgSalary: 135000,
          demandLevel: 'High',
          hotSkills: ['Cloud', 'Kubernetes', 'MLOps'],
          description: 'Design enterprise AI solutions and infrastructure',
          monthlyPostings: 421,
          competitionLevel: 'Low',
          remoteAvailability: '58%'
        },
        'NLP Engineer': {
          trendScore: 92,
          growth: '+25%',
          avgSalary: 119000,
          demandLevel: 'Very High',
          hotSkills: ['NLP', 'PyTorch', 'Python'],
          description: 'Build natural language processing applications',
          monthlyPostings: 362,
          competitionLevel: 'Medium',
          remoteAvailability: '75%'
        },
        'Computer Vision Engineer': {
          trendScore: 88,
          growth: '+17%',
          avgSalary: 125000,
          demandLevel: 'High',
          hotSkills: ['Computer Vision', 'PyTorch', 'OpenCV'],
          description: 'Develop image and video analysis applications',
          monthlyPostings: 304,
          competitionLevel: 'Medium',
          remoteAvailability: '61%'
        }
      },
      
      industryTrends: [
        { industry: 'Technology', growth: '+28%', avgSalary: 125000, jobCount: 8500 },
        { industry: 'Healthcare', growth: '+22%', avgSalary: 118000, jobCount: 3200 },
        { industry: 'Finance', growth: '+19%', avgSalary: 135000, jobCount: 2800 },
        { industry: 'Automotive', growth: '+15%', avgSalary: 115000, jobCount: 2100 },
        { industry: 'Government', growth: '+12%', avgSalary: 95000, jobCount: 1800 }
      ],
      
      geographicTrends: [
        { location: 'United States', jobs: 2847, avgSalary: 125000, growth: '+20%' },
        { location: 'Germany', jobs: 1923, avgSalary: 95000, growth: '+18%' },
        { location: 'Canada', jobs: 1445, avgSalary: 105000, growth: '+22%' },
        { location: 'United Kingdom', jobs: 1203, avgSalary: 98000, growth: '+15%' },
        { location: 'Singapore', jobs: 1156, avgSalary: 115000, growth: '+25%' }
      ],
      
      marketInsights: [
        {
          title: 'Explosive MLOps Growth',
          description: 'MLOps skills showing 23% growth as companies focus on production AI deployments',
          impact: 'high',
          category: 'skills'
        },
        {
          title: 'NLP Market Boom',
          description: 'Natural Language Processing roles growing 25% driven by ChatGPT and LLM adoption',
          impact: 'very-high',
          category: 'demand'
        },
        {
          title: 'Remote Work Dominance',
          description: '67% of AI positions offer remote/hybrid flexibility, above industry average',
          impact: 'medium',
          category: 'work-style'
        },
        {
          title: 'Experience Level Balance',
          description: 'Healthy distribution across all experience levels with strong entry-level opportunities',
          impact: 'medium',
          category: 'experience'
        }
      ]
    };
  },
  
  // Simulate API call to get job-specific trend data
  async getJobTrendDetail(jobTitle) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const jobData = {
      'Machine Learning Engineer': {
        monthlyData: [
          { month: 'Jan 2024', postings: 75, avgSalary: 112000, applications: 1200 },
          { month: 'Feb 2024', postings: 82, avgSalary: 113500, applications: 1350 },
          { month: 'Mar 2024', postings: 89, avgSalary: 115000, applications: 1480 },
          { month: 'Apr 2024', postings: 95, avgSalary: 116500, applications: 1600 },
          { month: 'May 2024', postings: 102, avgSalary: 118000, applications: 1750 },
          { month: 'Jun 2024', postings: 108, avgSalary: 119500, applications: 1900 }
        ],
        skillEvolution: [
          { month: 'Jan 2024', Python: 95, PyTorch: 68, Kubernetes: 45, MLOps: 32 },
          { month: 'Feb 2024', Python: 94, PyTorch: 71, Kubernetes: 48, MLOps: 38 },
          { month: 'Mar 2024', Python: 96, PyTorch: 74, Kubernetes: 52, MLOps: 42 },
          { month: 'Apr 2024', Python: 97, PyTorch: 76, Kubernetes: 55, MLOps: 47 },
          { month: 'May 2024', Python: 98, PyTorch: 78, Kubernetes: 58, MLOps: 52 },
          { month: 'Jun 2024', Python: 99, PyTorch: 80, Kubernetes: 62, MLOps: 58 }
        ]
      }
    };
    
    return jobData[jobTitle] || jobData['Machine Learning Engineer'];
  }
};

// Utility functions for data processing
export const formatSalary = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const getTrendIndicator = (score) => {
  if (score >= 90) return { icon: '', label: 'Hot', color: '#EF4444' };
  if (score >= 80) return { icon: '', label: 'Trending', color: '#F59E0B' };
  if (score >= 70) return { icon: '', label: 'Stable', color: '#10B981' };
  return { icon: '', label: 'Cooling', color: '#6B7280' };
};

export const getGrowthColor = (growth) => {
  const value = parseInt(growth.replace('%', '').replace('+', ''));
  if (value >= 20) return '#10B981'; // Green
  if (value >= 10) return '#F59E0B'; // Orange
  if (value >= 0) return '#3B82F6';  // Blue
  return '#EF4444'; // Red
};
