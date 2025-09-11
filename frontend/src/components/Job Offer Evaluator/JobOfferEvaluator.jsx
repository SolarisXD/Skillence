import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import './JobOfferEvaluator.css';
// Professional SVG Icons
import {
  BriefcaseIcon,
  WarningIcon,
  CelebrationIcon,
  ThumbsUpIcon,
  BalanceIcon,
  MoneyBagIcon,
  DollarIcon,
  PieChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  HospitalIcon,
  CheckMarkIcon,
  CrossMarkIcon,
  HomeIcon,
  SeedlingIcon,
  BookIcon,
  ShieldIcon,
  CityscapeIcon,
  LocationPinIcon,
  DiningIcon,
  CarIcon,
  LightBulbIcon,
  RefreshIcon,
  PageIcon
} from '../Icons/ProfessionalIcons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Adzuna API configuration
const ADZUNA_CONFIG = {
  BASE_URL: 'https://api.adzuna.com/v1/api',
  API_KEY: import.meta.env.VITE_ADZUNA_API_KEY,
  APP_ID: import.meta.env.VITE_ADZUNA_APP_ID,
};

// Gemini API configuration
const GEMINI_CONFIG = {
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
};

// Country code mapping for Adzuna API
const COUNTRY_CODES = {
  'United States': 'us',
  'United Kingdom': 'gb',
  'Germany': 'de',
  'Canada': 'ca',
  'Australia': 'au',
  'Singapore': 'sg',
  'Netherlands': 'nl',
  'France': 'fr',
  'Switzerland': 'ch',
  'Sweden': 'se',
  'Denmark': 'dk',
  'Norway': 'no',
  'Finland': 'fi',
  'Japan': 'jp',
  'South Korea': 'kr',
  'India': 'in',
  'China': 'cn',
  'Israel': 'il',
  'Ireland': 'ie',
  'Austria': 'at',
  'Belgium': 'be',
  'Spain': 'es',
  'Italy': 'it',
  'Portugal': 'pt',
  'Poland': 'pl'
};

// Fallback market data for demo/development - India specific
const FALLBACK_MARKET_DATA = {
  // Indian Software Engineer salaries in INR
  'India': {
    jobs: {
      count: 450,
      results: [
        { title: 'Senior Software Engineer', salary_min: 1200000, salary_max: 2200000 }, // 12-22 LPA
        { title: 'Software Engineer', salary_min: 800000, salary_max: 1500000 }, // 8-15 LPA  
        { title: 'Full Stack Developer', salary_min: 900000, salary_max: 1800000 }, // 9-18 LPA
        { title: 'Backend Developer', salary_min: 850000, salary_max: 1600000 }, // 8.5-16 LPA
        { title: 'Frontend Developer', salary_min: 700000, salary_max: 1400000 }, // 7-14 LPA
        { title: 'Machine Learning Engineer', salary_min: 1000000, salary_max: 2000000 }, // 10-20 LPA
        { title: 'Data Scientist', salary_min: 900000, salary_max: 1800000 }, // 9-18 LPA
        { title: 'DevOps Engineer', salary_min: 1100000, salary_max: 2100000 }, // 11-21 LPA
        { title: 'Product Manager', salary_min: 1500000, salary_max: 2800000 }, // 15-28 LPA
        { title: 'Software Developer', salary_min: 600000, salary_max: 1200000 }, // 6-12 LPA
      ]
    }
  },
  // US market data in USD
  'United States': {
    jobs: {
      count: 125,
      results: [
        { title: 'Senior Software Engineer', salary_min: 120000, salary_max: 180000 },
        { title: 'Software Developer', salary_min: 80000, salary_max: 120000 },
        { title: 'Full Stack Engineer', salary_min: 95000, salary_max: 140000 },
        { title: 'Data Scientist', salary_min: 110000, salary_max: 160000 },
        { title: 'Product Manager', salary_min: 130000, salary_max: 200000 }
      ]
    }
  }
};

// Adzuna API functions
const adzunaAPI = {
  // Test API connection
  testConnection: async () => {
    try {
  console.log('Testing Adzuna API connection...');
      const url = new URL(`${ADZUNA_CONFIG.BASE_URL}/jobs/in/search/1`);
      url.searchParams.append('app_id', ADZUNA_CONFIG.APP_ID);
      url.searchParams.append('app_key', ADZUNA_CONFIG.API_KEY);
      url.searchParams.append('what', 'software engineer');
      url.searchParams.append('results_per_page', '5');
      
      console.log('Test URL:', url.toString());
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
    console.log('API Test successful:', data);
        return data;
      } else {
        const errorText = await response.text();
  console.error('API Test failed:', response.status, errorText);
        return null;
      }
    } catch (error) {
  console.error('API Test error:', error);
      return null;
    }
  },

  // Search jobs for salary comparison
  searchJobs: async (country, query, location = '') => {
    const countryCode = COUNTRY_CODES[country] || 'in'; // Default to India
    const url = new URL(`${ADZUNA_CONFIG.BASE_URL}/jobs/${countryCode}/search/1`);
    
    const params = {
      app_id: ADZUNA_CONFIG.APP_ID,
      app_key: ADZUNA_CONFIG.API_KEY,
      what: query,
      where: location,
      results_per_page: 20,
      sort_by: 'salary'
    };
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
  console.log('API Call URL:', url.toString());
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} - ${await response.text()}`);
    }
    return await response.json();
  },

  // Get salary histogram data
  getSalaryHistogram: async (country, query, location = '') => {
    const countryCode = COUNTRY_CODES[country] || 'in'; // Default to India
    const url = new URL(`${ADZUNA_CONFIG.BASE_URL}/jobs/${countryCode}/histogram`);
    
    const params = {
      app_id: ADZUNA_CONFIG.APP_ID,
      app_key: ADZUNA_CONFIG.API_KEY,
      what: query,
      where: location
    };
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} - ${await response.text()}`);
    }
    return await response.json();
  },

  // Get salary history/trends
  getSalaryHistory: async (country, query, location = '') => {
    const countryCode = COUNTRY_CODES[country] || 'in'; // Default to India
    const url = new URL(`${ADZUNA_CONFIG.BASE_URL}/jobs/${countryCode}/history`);
    
    const params = {
      app_id: ADZUNA_CONFIG.APP_ID,
      app_key: ADZUNA_CONFIG.API_KEY,
      what: query,
      where: location
    };
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} - ${await response.text()}`);
    }
    return await response.json();
  }
};

// Gemini API functions for cost of living analysis
const geminiAPI = {
  // Get cost of living analysis for a specific city
  getCostOfLivingAnalysis: async (city, country, salary, currency) => {
    try {
  console.log('Fetching cost of living data from Gemini API for:', city, country);
      
      if (!GEMINI_CONFIG.API_KEY || GEMINI_CONFIG.API_KEY === 'your_gemini_api_key') {
        throw new Error('Gemini API key not configured properly');
      }

      const prompt = `Provide ONLY numerical cost of living data for ${city}, ${country} in INR (Indian Rupees) for a SINGLE PERSON in ${new Date().getFullYear()}.

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS (numbers only, no explanations):

Monthly Rent: 25000
Monthly Food: 8000  
Monthly Transport: 3000
Total Monthly Cost: 45000

Use current market rates for a SINGLE PERSON:
- Monthly Rent: Average 1-bedroom apartment or shared accommodation for one person
- Monthly Food: Basic groceries + some dining out for one person
- Monthly Transport: Public transport + occasional taxi for one person
- Total Monthly Cost: All basic living expenses including utilities for one person

RESPOND WITH ONLY THE 4 NUMBERS IN INR AS SHOWN ABOVE FOR A SINGLE PERSON.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      };

      const url = `${GEMINI_CONFIG.BASE_URL}?key=${GEMINI_CONFIG.API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const analysisText = data.candidates[0].content.parts[0].text;
  console.log('Cost of living analysis received:', analysisText);
        
        // Parse the response to extract structured data
        const parsedData = parseGeminiCostAnalysis(analysisText, city, country);
        return parsedData;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
  console.error('Cost of living analysis error:', error);
      throw error;
    }
  }
};

// Helper function to parse Gemini's cost of living analysis
const parseGeminiCostAnalysis = (analysisText, city, country) => {
  console.log('Parsing Gemini response:', analysisText);
  
  // Create a structured object from the Gemini response
  const costData = {
    city,
    country,
    currency: 'INR',
    monthlyBreakdown: {
      rent: 0,
      food: 0,
      transport: 0,
      total: 0
    },
    analysis: analysisText.trim(),
    insights: []
  };

  try {
    // Extract numerical values from the structured response
    const lines = analysisText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const cleanLine = line.trim();
      
      if (cleanLine.includes('Monthly Rent:')) {
        const rentMatch = cleanLine.match(/(\d+)/);
        if (rentMatch) {
          costData.monthlyBreakdown.rent = parseInt(rentMatch[1]);
        }
      } else if (cleanLine.includes('Monthly Food:')) {
        const foodMatch = cleanLine.match(/(\d+)/);
        if (foodMatch) {
          costData.monthlyBreakdown.food = parseInt(foodMatch[1]);
        }
      } else if (cleanLine.includes('Monthly Transport:')) {
        const transportMatch = cleanLine.match(/(\d+)/);
        if (transportMatch) {
          costData.monthlyBreakdown.transport = parseInt(transportMatch[1]);
        }
      } else if (cleanLine.includes('Total Monthly Cost:')) {
        const totalMatch = cleanLine.match(/(\d+)/);
        if (totalMatch) {
          costData.monthlyBreakdown.total = parseInt(totalMatch[1]);
        }
      }
    }

    // If structured parsing didn't work, try to extract any numbers
    if (costData.monthlyBreakdown.total === 0) {
    console.log('Structured parsing failed, trying fallback extraction');
      const numbers = analysisText.match(/\d+/g);
      if (numbers && numbers.length >= 4) {
        costData.monthlyBreakdown.rent = parseInt(numbers[0]);
        costData.monthlyBreakdown.food = parseInt(numbers[1]);
        costData.monthlyBreakdown.transport = parseInt(numbers[2]);
        costData.monthlyBreakdown.total = parseInt(numbers[3]);
      }
    }

    // Add some basic insights based on costs
    const totalCost = costData.monthlyBreakdown.total;
    if (totalCost > 50000) {
      costData.insights.push('High cost of living area');
    } else if (totalCost < 25000) {
      costData.insights.push('Budget-friendly location');
    } else {
      costData.insights.push('Moderate cost of living');
    }

  console.log('Parsed cost data:', costData);
    return costData;
  } catch (parseError) {
  console.error('Error parsing cost data:', parseError);
    return {
      ...costData,
      error: 'Could not parse cost data from response'
    };
  }
};

const JobOfferEvaluator = () => {
  const navigate = useNavigate();
  
  // Navbar state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: '',
    salary: '',
    currency: 'INR', // Default to INR since focusing on India
    city: '',
    country: '',
    experienceLevel: 'entry', // New field for experience level
    healthInsurance: false,
    remoteWork: false,
    esops: false,
    learningBudget: false,
    otherInsurance: false
  });

  // API and evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [costOfLivingData, setCostOfLivingData] = useState(null);

  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

  // Job roles data
  const jobRoles = [
    'Software Engineer', 'Software Developer', 'Software Architect',
    'Data Scientist', 'Data Analyst', 'Data Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Cloud Engineer', 'ML Engineer',
    'Product Manager', 'Project Manager', 'Scrum Master',
    'UX Designer', 'UI Designer', 'Graphic Designer',
    'QA Engineer', 'Test Engineer', 'Security Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer',
    'Database Administrator', 'System Administrator', 'Network Engineer'
  ];

  // Cities data - Indian cities and international cities
  const cities = [
    // Indian Cities
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
    'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
    'Tiruchirappalli', 'Bareilly', 'Mysore', 'Tiruppur', 'Gurgaon', 'Aligarh', 'Jalandhar',
    'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur',
    'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad',
    'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela',
    'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni',
    'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 'Mangalore',
    'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon',
    'Udaipur', 'Maheshtala', 'Rajpur Sonarpur', 'Kharagpur', 'Agaratala', 'Shimla',
    
    // International Cities
    // United States
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
    'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
    'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC',
    'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas',
    'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno',
    'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh',
    'Miami', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa',
    
    // United Kingdom
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield',
    'Edinburgh', 'Bristol', 'Cardiff', 'Belfast', 'Leicester', 'Coventry', 'Bradford',
    'Nottingham', 'Kingston upon Hull', 'Newcastle upon Tyne', 'Stoke-on-Trent', 'Southampton',
    'Derby', 'Portsmouth', 'Brighton', 'Plymouth', 'Northampton', 'Reading', 'Luton',
    
    // Canada
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg',
    'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa',
    'Windsor', 'Saskatoon', 'St. Catharines', 'Regina', 'Sherbrooke', 'Barrie',
    
    // Australia
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle',
    'Canberra', 'Sunshine Coast', 'Wollongong', 'Geelong', 'Hobart', 'Townsville',
    'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston',
    
    // Germany
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
    'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg',
    'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
    
    // France
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
    'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Le Havre', 'Toulon',
    'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
    
    // Other Major International Cities
    'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', // Japan
    'Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Hangzhou', 'Wuhan', // China
    'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', // South Korea
    'Singapore', 'Hong Kong', 'Taipei', 'Kaohsiung', 'Bangkok', 'Manila', 'Jakarta',
    'Kuala Lumpur', 'Ho Chi Minh City', 'Hanoi', 'Dubai', 'Abu Dhabi', 'Doha',
    'Tel Aviv', 'Jerusalem', 'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht',
    'Brussels', 'Antwerp', 'Ghent', 'Vienna', 'Zurich', 'Geneva', 'Basel',
    'Stockholm', 'Gothenburg', 'Malmö', 'Copenhagen', 'Aarhus', 'Odense',
    'Oslo', 'Bergen', 'Trondheim', 'Helsinki', 'Espoo', 'Tampere',
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga',
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna',
    'Lisbon', 'Porto', 'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań',
    'Prague', 'Brno', 'Ostrava', 'Budapest', 'Debrecen', 'Szeged',
    'Bucharest', 'Cluj-Napoca', 'Timișoara', 'Sofia', 'Plovdiv', 'Varna',
    'Athens', 'Thessaloniki', 'Patras', 'Istanbul', 'Ankara', 'Izmir',
    'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod',
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
    'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
    'Buenos Aires', 'Córdoba', 'Rosario', 'Santiago', 'Valparaíso',
    'Lima', 'Arequipa', 'Trujillo', 'Bogotá', 'Medellín', 'Cali',
    'Caracas', 'Maracaibo', 'Valencia', 'Cairo', 'Alexandria', 'Giza',
    'Casablanca', 'Rabat', 'Fez', 'Cape Town', 'Johannesburg', 'Durban',
    'Lagos', 'Kano', 'Ibadan', 'Addis Ababa', 'Nairobi', 'Kampala'
  ];

  // Countries data
  const countries = [
    'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia',
    'Singapore', 'Netherlands', 'France', 'Switzerland', 'Sweden',
    'Denmark', 'Norway', 'Finland', 'Japan', 'South Korea',
    'India', 'China', 'Israel', 'Ireland', 'Austria',
    'Belgium', 'Spain', 'Italy', 'Portugal', 'Poland'
  ];

  // Currency symbols
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
  ];

  // City to Country mapping for auto-fill functionality
  const cityToCountryMap = {
    // Indian Cities
    'Mumbai': 'India', 'Delhi': 'India', 'Bangalore': 'India', 'Hyderabad': 'India', 'Pune': 'India',
    'Chennai': 'India', 'Kolkata': 'India', 'Ahmedabad': 'India', 'Surat': 'India', 'Jaipur': 'India',
    'Lucknow': 'India', 'Kanpur': 'India', 'Nagpur': 'India', 'Indore': 'India', 'Thane': 'India',
    'Bhopal': 'India', 'Visakhapatnam': 'India', 'Pimpri-Chinchwad': 'India', 'Patna': 'India',
    'Vadodara': 'India', 'Ghaziabad': 'India', 'Ludhiana': 'India', 'Agra': 'India', 'Nashik': 'India',
    'Faridabad': 'India', 'Meerut': 'India', 'Rajkot': 'India', 'Kalyan-Dombivali': 'India',
    'Vasai-Virar': 'India', 'Varanasi': 'India', 'Srinagar': 'India', 'Aurangabad': 'India',
    'Dhanbad': 'India', 'Amritsar': 'India', 'Navi Mumbai': 'India', 'Allahabad': 'India',
    'Ranchi': 'India', 'Howrah': 'India', 'Coimbatore': 'India', 'Jabalpur': 'India', 'Gwalior': 'India',
    'Vijayawada': 'India', 'Jodhpur': 'India', 'Madurai': 'India', 'Raipur': 'India', 'Kota': 'India',
    'Guwahati': 'India', 'Chandigarh': 'India', 'Solapur': 'India', 'Hubli-Dharwad': 'India',
    'Tiruchirappalli': 'India', 'Bareilly': 'India', 'Mysore': 'India', 'Tiruppur': 'India',
    'Gurgaon': 'India', 'Aligarh': 'India', 'Jalandhar': 'India', 'Bhubaneswar': 'India',
    'Salem': 'India', 'Warangal': 'India', 'Guntur': 'India', 'Bhiwandi': 'India', 'Saharanpur': 'India',
    'Gorakhpur': 'India', 'Bikaner': 'India', 'Amravati': 'India', 'Noida': 'India', 'Jamshedpur': 'India',
    'Bhilai': 'India', 'Cuttack': 'India', 'Firozabad': 'India', 'Kochi': 'India', 'Nellore': 'India',
    'Bhavnagar': 'India', 'Dehradun': 'India', 'Durgapur': 'India', 'Asansol': 'India', 'Rourkela': 'India',
    'Nanded': 'India', 'Kolhapur': 'India', 'Ajmer': 'India', 'Akola': 'India', 'Gulbarga': 'India',
    'Jamnagar': 'India', 'Ujjain': 'India', 'Loni': 'India', 'Siliguri': 'India', 'Jhansi': 'India',
    'Ulhasnagar': 'India', 'Jammu': 'India', 'Sangli-Miraj & Kupwad': 'India', 'Mangalore': 'India',
    'Erode': 'India', 'Belgaum': 'India', 'Ambattur': 'India', 'Tirunelveli': 'India', 'Malegaon': 'India',
    'Gaya': 'India', 'Jalgaon': 'India', 'Udaipur': 'India', 'Maheshtala': 'India', 'Rajpur Sonarpur': 'India',
    'Kharagpur': 'India', 'Agaratala': 'India', 'Shimla': 'India',

    // United States
    'New York': 'United States', 'Los Angeles': 'United States', 'Chicago': 'United States',
    'Houston': 'United States', 'Phoenix': 'United States', 'Philadelphia': 'United States',
    'San Antonio': 'United States', 'San Diego': 'United States', 'Dallas': 'United States',
    'San Jose': 'United States', 'Austin': 'United States', 'Jacksonville': 'United States',
    'Fort Worth': 'United States', 'Columbus': 'United States', 'Charlotte': 'United States',
    'San Francisco': 'United States', 'Indianapolis': 'United States', 'Seattle': 'United States',
    'Denver': 'United States', 'Washington DC': 'United States', 'Boston': 'United States',
    'El Paso': 'United States', 'Nashville': 'United States', 'Detroit': 'United States',
    'Oklahoma City': 'United States', 'Portland': 'United States', 'Las Vegas': 'United States',
    'Memphis': 'United States', 'Louisville': 'United States', 'Baltimore': 'United States',
    'Milwaukee': 'United States', 'Albuquerque': 'United States', 'Tucson': 'United States',
    'Fresno': 'United States', 'Sacramento': 'United States', 'Kansas City': 'United States',
    'Mesa': 'United States', 'Atlanta': 'United States', 'Omaha': 'United States',
    'Colorado Springs': 'United States', 'Raleigh': 'United States', 'Miami': 'United States',
    'Virginia Beach': 'United States', 'Oakland': 'United States', 'Minneapolis': 'United States',
    'Tulsa': 'United States', 'Arlington': 'United States', 'Tampa': 'United States',

    // United Kingdom
    'London': 'United Kingdom', 'Birmingham': 'United Kingdom', 'Manchester': 'United Kingdom',
    'Glasgow': 'United Kingdom', 'Liverpool': 'United Kingdom', 'Leeds': 'United Kingdom',
    'Sheffield': 'United Kingdom', 'Edinburgh': 'United Kingdom', 'Bristol': 'United Kingdom',
    'Cardiff': 'United Kingdom', 'Belfast': 'United Kingdom', 'Leicester': 'United Kingdom',
    'Coventry': 'United Kingdom', 'Bradford': 'United Kingdom', 'Nottingham': 'United Kingdom',
    'Kingston upon Hull': 'United Kingdom', 'Newcastle upon Tyne': 'United Kingdom',
    'Stoke-on-Trent': 'United Kingdom', 'Southampton': 'United Kingdom', 'Derby': 'United Kingdom',
    'Portsmouth': 'United Kingdom', 'Brighton': 'United Kingdom', 'Plymouth': 'United Kingdom',
    'Northampton': 'United Kingdom', 'Reading': 'United Kingdom', 'Luton': 'United Kingdom',

    // Canada
    'Toronto': 'Canada', 'Montreal': 'Canada', 'Vancouver': 'Canada', 'Calgary': 'Canada',
    'Edmonton': 'Canada', 'Ottawa': 'Canada', 'Winnipeg': 'Canada', 'Quebec City': 'Canada',
    'Hamilton': 'Canada', 'Kitchener': 'Canada', 'Victoria': 'Canada', 'Halifax': 'Canada',
    'Oshawa': 'Canada', 'Windsor': 'Canada', 'Saskatoon': 'Canada', 'St. Catharines': 'Canada',
    'Regina': 'Canada', 'Sherbrooke': 'Canada', 'Barrie': 'Canada',

    // Australia
    'Sydney': 'Australia', 'Melbourne': 'Australia', 'Brisbane': 'Australia', 'Perth': 'Australia',
    'Adelaide': 'Australia', 'Gold Coast': 'Australia', 'Newcastle': 'Australia', 'Canberra': 'Australia',
    'Sunshine Coast': 'Australia', 'Wollongong': 'Australia', 'Geelong': 'Australia', 'Hobart': 'Australia',
    'Townsville': 'Australia', 'Cairns': 'Australia', 'Darwin': 'Australia', 'Toowoomba': 'Australia',
    'Ballarat': 'Australia', 'Bendigo': 'Australia', 'Albury': 'Australia', 'Launceston': 'Australia',

    // Germany
    'Berlin': 'Germany', 'Hamburg': 'Germany', 'Munich': 'Germany', 'Cologne': 'Germany',
    'Frankfurt': 'Germany', 'Stuttgart': 'Germany', 'Düsseldorf': 'Germany', 'Dortmund': 'Germany',
    'Essen': 'Germany', 'Leipzig': 'Germany', 'Bremen': 'Germany', 'Dresden': 'Germany',
    'Hanover': 'Germany', 'Nuremberg': 'Germany', 'Duisburg': 'Germany', 'Bochum': 'Germany',
    'Wuppertal': 'Germany', 'Bielefeld': 'Germany', 'Bonn': 'Germany', 'Münster': 'Germany',

    // France
    'Paris': 'France', 'Marseille': 'France', 'Lyon': 'France', 'Toulouse': 'France',
    'Nice': 'France', 'Nantes': 'France', 'Strasbourg': 'France', 'Montpellier': 'France',
    'Bordeaux': 'France', 'Lille': 'France', 'Rennes': 'France', 'Reims': 'France',
    'Saint-Étienne': 'France', 'Le Havre': 'France', 'Toulon': 'France', 'Grenoble': 'France',
    'Dijon': 'France', 'Angers': 'France', 'Nîmes': 'France', 'Villeurbanne': 'France',

    // Japan
    'Tokyo': 'Japan', 'Osaka': 'Japan', 'Kyoto': 'Japan', 'Yokohama': 'Japan', 'Nagoya': 'Japan',
    'Sapporo': 'Japan', 'Fukuoka': 'Japan',

    // China
    'Shanghai': 'China', 'Beijing': 'China', 'Shenzhen': 'China', 'Guangzhou': 'China',
    'Chengdu': 'China', 'Hangzhou': 'China', 'Wuhan': 'China',

    // South Korea
    'Seoul': 'South Korea', 'Busan': 'South Korea', 'Incheon': 'South Korea', 'Daegu': 'South Korea',
    'Daejeon': 'South Korea', 'Gwangju': 'South Korea',

    // Other major countries
    'Singapore': 'Singapore', 'Hong Kong': 'Hong Kong', 'Taipei': 'Taiwan', 'Kaohsiung': 'Taiwan',
    'Bangkok': 'Thailand', 'Manila': 'Philippines', 'Jakarta': 'Indonesia', 'Kuala Lumpur': 'Malaysia',
    'Ho Chi Minh City': 'Vietnam', 'Hanoi': 'Vietnam', 'Dubai': 'United Arab Emirates',
    'Abu Dhabi': 'United Arab Emirates', 'Doha': 'Qatar', 'Tel Aviv': 'Israel', 'Jerusalem': 'Israel',
    'Amsterdam': 'Netherlands', 'Rotterdam': 'Netherlands', 'The Hague': 'Netherlands', 'Utrecht': 'Netherlands',
    'Brussels': 'Belgium', 'Antwerp': 'Belgium', 'Ghent': 'Belgium', 'Vienna': 'Austria',
    'Zurich': 'Switzerland', 'Geneva': 'Switzerland', 'Basel': 'Switzerland',
    'Stockholm': 'Sweden', 'Gothenburg': 'Sweden', 'Malmö': 'Sweden',
    'Copenhagen': 'Denmark', 'Aarhus': 'Denmark', 'Odense': 'Denmark',
    'Oslo': 'Norway', 'Bergen': 'Norway', 'Trondheim': 'Norway',
    'Helsinki': 'Finland', 'Espoo': 'Finland', 'Tampere': 'Finland',
    'Madrid': 'Spain', 'Barcelona': 'Spain', 'Valencia': 'Spain', 'Seville': 'Spain',
    'Zaragoza': 'Spain', 'Málaga': 'Spain',
    'Rome': 'Italy', 'Milan': 'Italy', 'Naples': 'Italy', 'Turin': 'Italy', 'Palermo': 'Italy',
    'Genoa': 'Italy', 'Bologna': 'Italy',
    'Lisbon': 'Portugal', 'Porto': 'Portugal',
    'Warsaw': 'Poland', 'Kraków': 'Poland', 'Łódź': 'Poland', 'Wrocław': 'Poland', 'Poznań': 'Poland',
    'Prague': 'Czech Republic', 'Brno': 'Czech Republic', 'Ostrava': 'Czech Republic',
    'Budapest': 'Hungary', 'Debrecen': 'Hungary', 'Szeged': 'Hungary',
    'Bucharest': 'Romania', 'Cluj-Napoca': 'Romania', 'Timișoara': 'Romania',
    'Sofia': 'Bulgaria', 'Plovdiv': 'Bulgaria', 'Varna': 'Bulgaria',
    'Athens': 'Greece', 'Thessaloniki': 'Greece', 'Patras': 'Greece',
    'Istanbul': 'Turkey', 'Ankara': 'Turkey', 'Izmir': 'Turkey',
    'Moscow': 'Russia', 'Saint Petersburg': 'Russia', 'Novosibirsk': 'Russia',
    'Yekaterinburg': 'Russia', 'Nizhny Novgorod': 'Russia',
    'São Paulo': 'Brazil', 'Rio de Janeiro': 'Brazil', 'Brasília': 'Brazil', 'Salvador': 'Brazil',
    'Fortaleza': 'Brazil',
    'Mexico City': 'Mexico', 'Guadalajara': 'Mexico', 'Monterrey': 'Mexico', 'Puebla': 'Mexico',
    'Tijuana': 'Mexico',
    'Buenos Aires': 'Argentina', 'Córdoba': 'Argentina', 'Rosario': 'Argentina',
    'Santiago': 'Chile', 'Valparaíso': 'Chile',
    'Lima': 'Peru', 'Arequipa': 'Peru', 'Trujillo': 'Peru',
    'Bogotá': 'Colombia', 'Medellín': 'Colombia', 'Cali': 'Colombia',
    'Caracas': 'Venezuela', 'Maracaibo': 'Venezuela', 'Valencia': 'Venezuela',
    'Cairo': 'Egypt', 'Alexandria': 'Egypt', 'Giza': 'Egypt',
    'Casablanca': 'Morocco', 'Rabat': 'Morocco', 'Fez': 'Morocco',
    'Cape Town': 'South Africa', 'Johannesburg': 'South Africa', 'Durban': 'South Africa',
    'Lagos': 'Nigeria', 'Kano': 'Nigeria', 'Ibadan': 'Nigeria',
    'Addis Ababa': 'Ethiopia', 'Nairobi': 'Kenya', 'Kampala': 'Uganda'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => {
      const newFormData = {
        ...prevState,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-fill country when exact city match is found while typing
      if (name === 'city' && cityToCountryMap[value]) {
        newFormData.country = cityToCountryMap[value];
      }
      
      return newFormData;
    });

    // Handle suggestions visibility
    if (name === 'jobTitle') {
      setShowJobSuggestions(value.length > 0);
    } else if (name === 'city') {
      setShowCitySuggestions(value.length > 0);
    } else if (name === 'country') {
      setShowCountrySuggestions(value.length > 0);
    }
  };

  const handleSuggestionClick = (field, value) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // Auto-fill country when city is selected
      if (field === 'city' && cityToCountryMap[value]) {
        newFormData.country = cityToCountryMap[value];
      }
      
      return newFormData;
    });
    
    if (field === 'jobTitle') setShowJobSuggestions(false);
    if (field === 'city') {
      setShowCitySuggestions(false);
      setShowCountrySuggestions(false); // Hide country suggestions since it's auto-filled
    }
    if (field === 'country') setShowCountrySuggestions(false);
  };

  const filterSuggestions = (list, query) => {
    return list.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  const getCurrentCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.currency);
    return currency ? currency.symbol : '$';
  };

  // Helper functions for styling
  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const getPercentileClass = (percentile) => {
    if (percentile >= 75) return 'excellent';
    if (percentile >= 50) return 'good';
    if (percentile >= 25) return 'average';
    return 'poor';
  };

  // Enhanced evaluation function with Adzuna API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.jobTitle || !formData.salary || !formData.country) {
      setApiError('Please fill in all required fields (Job Title, Salary, Country)');
      return;
    }

    setIsEvaluating(true);
    setApiError(null);
    setEvaluationResults(null);
    setCostOfLivingData(null);

    try {
      let marketData;
      
      // Check if we have valid API credentials (not placeholder values)
      const hasValidCredentials = ADZUNA_CONFIG.API_KEY && 
                                 ADZUNA_CONFIG.APP_ID && 
                                 ADZUNA_CONFIG.API_KEY !== 'your_adzuna_api_key' && 
                                 ADZUNA_CONFIG.APP_ID !== 'your_adzuna_app_id' &&
                                 ADZUNA_CONFIG.API_KEY.length > 10;

      console.log('API Configuration Check:');
      console.log('API_KEY:', ADZUNA_CONFIG.API_KEY);
      console.log('APP_ID:', ADZUNA_CONFIG.APP_ID);
      console.log('Has valid credentials:', hasValidCredentials);

      if (hasValidCredentials) {
        console.log('✅ Using Adzuna API - Fetching real market data for:', formData.jobTitle, 'in', formData.country);
        
        // Fetch market data from Adzuna API
        const [jobSearchData, salaryHistogram, salaryHistory] = await Promise.allSettled([
          adzunaAPI.searchJobs(formData.country, formData.jobTitle, formData.city),
          adzunaAPI.getSalaryHistogram(formData.country, formData.jobTitle, formData.city),
          adzunaAPI.getSalaryHistory(formData.country, formData.jobTitle, formData.city)
        ]);

        console.log('API Responses:', { jobSearchData, salaryHistogram, salaryHistory });

        // Process the API responses
        marketData = {
          jobs: jobSearchData.status === 'fulfilled' ? jobSearchData.value : null,
          histogram: salaryHistogram.status === 'fulfilled' ? salaryHistogram.value : null,
          history: salaryHistory.status === 'fulfilled' ? salaryHistory.value : null,
          errors: [
            jobSearchData.status === 'rejected' ? `Job Search: ${jobSearchData.reason.message}` : null,
            salaryHistogram.status === 'rejected' ? `Salary Data: ${salaryHistogram.reason.message}` : null,
            salaryHistory.status === 'rejected' ? `Salary History: ${salaryHistory.reason.message}` : null
          ].filter(Boolean),
          isRealData: true
        };

        // If all API calls failed, fall back to demo data
        if (!marketData.jobs && !marketData.histogram && !marketData.history) {
          console.log('⚠️ All API calls failed, using fallback data');
          const countryFallbackData = FALLBACK_MARKET_DATA[formData.country] || FALLBACK_MARKET_DATA['India'];
          marketData = {
            ...countryFallbackData,
            errors: ['All API calls failed. Using demo data as fallback.'],
            isRealData: false
          };
        }
      } else {
        // Use fallback data when API is not configured
        console.log('⚠️ Using fallback market data - API not configured properly');
        const countryFallbackData = FALLBACK_MARKET_DATA[formData.country] || FALLBACK_MARKET_DATA['India'];
        marketData = {
          ...countryFallbackData,
          errors: ['Using demo data - Configure VITE_ADZUNA_API_KEY and VITE_ADZUNA_APP_ID environment variables for real market data'],
          isRealData: false
        };
      }

      setMarketData(marketData);

      // Fetch cost of living analysis using Gemini API
      let costOfLivingAnalysis = null;
      try {
        if (formData.city && GEMINI_CONFIG.API_KEY && GEMINI_CONFIG.API_KEY !== 'your_gemini_api_key') {
          console.log('✅ Using Gemini API - Fetching cost of living data for:', formData.city, formData.country);
          costOfLivingAnalysis = await geminiAPI.getCostOfLivingAnalysis(
            formData.city,
            formData.country,
            formData.salary,
            formData.currency
          );
          setCostOfLivingData(costOfLivingAnalysis);
          console.log('Cost of living analysis completed:', costOfLivingAnalysis);
        } else if (!formData.city) {
          console.log('⚠️ City not specified - skipping cost of living analysis');
        } else {
          console.log('⚠️ Gemini API key not configured - skipping cost of living analysis');
        }
      } catch (costError) {
        console.error('❌ Cost of living analysis failed:', costError);
        // Don't fail the entire evaluation if cost of living fails
        setCostOfLivingData({
          error: `Cost of living analysis failed: ${costError.message}`,
          city: formData.city,
          country: formData.country
        });
      }

      // Perform evaluation
      const evaluation = evaluateJobOffer(formData, marketData, costOfLivingAnalysis);
      setEvaluationResults(evaluation);

      console.log('Evaluation completed:', evaluation);

    } catch (error) {
      console.error('Evaluation error:', error);
      setApiError(`Evaluation failed: ${error.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Job offer evaluation logic with proper Indian salary filtering
  const evaluateJobOffer = (offerData, marketData, costOfLivingData) => {
    const offerSalary = parseFloat(offerData.salary);
    let evaluation = {
      overall_score: 0,
      salary_analysis: {},
      benefits_score: 0,
      market_insights: {},
      cost_of_living: costOfLivingData || null,
      recommendations: []
    };

    console.log('💰 Starting salary evaluation for:', {
      offerSalary,
      country: offerData.country,
      jobTitle: offerData.jobTitle,
      rawMarketData: marketData.jobs
    });

    // Salary Analysis with Indian market specific filtering
    if (marketData.jobs && marketData.jobs.results && marketData.jobs.results.length > 0) {
      let jobs = marketData.jobs.results.filter(job => job.salary_min && job.salary_max);
      
      console.log('📊 Raw jobs before filtering:', jobs.length);
      
      if (jobs.length > 0) {
        // Calculate average salaries for each job
        let salaries = jobs.map(job => {
          const avgSalary = (job.salary_min + job.salary_max) / 2;
          return {
            title: job.title,
            salary: avgSalary,
            min: job.salary_min,
            max: job.salary_max
          };
        });

        console.log('💵 Raw salary data:', salaries);

        // Filter out unrealistic salaries for Indian market
        if (offerData.country === 'India') {
          // For India, filter salaries to reasonable ranges (2 lacs to 50 lacs)
          salaries = salaries.filter(job => {
            const isReasonable = job.salary >= 200000 && job.salary <= 5000000;
            if (!isReasonable) {
              console.log('🚫 Filtered out unrealistic salary:', job);
            }
            return isReasonable;
          });

          // Further filter based on job title similarity and experience level
          const offerJobTitle = offerData.jobTitle.toLowerCase();
          const experienceLevel = offerData.experienceLevel;

          // Filter based on selected experience level
          if (experienceLevel === 'entry') {
            // For entry level, filter out senior roles and high salaries
            salaries = salaries.filter(job => {
              const jobTitle = job.title.toLowerCase();
              const isSenior = jobTitle.includes('senior') || 
                             jobTitle.includes('lead') || 
                             jobTitle.includes('principal') || 
                             jobTitle.includes('architect') ||
                             job.salary > 2000000; // Above 20 lacs likely senior for entry level
              
              if (isSenior) {
                console.log('🎓 Filtered out senior role for entry-level:', job);
              }
              return !isSenior;
            });
          } else if (experienceLevel === 'mid') {
            // For mid level, filter out very junior and very senior roles
            salaries = salaries.filter(job => {
              const isVerySenior = job.salary > 3000000 || // Above 30 lacs
                                 job.title.toLowerCase().includes('principal') ||
                                 job.title.toLowerCase().includes('architect');
              const isVeryJunior = job.salary < 600000; // Below 6 lacs
              
              if (isVerySenior) {
                console.log('🎓 Filtered out very senior role for mid-level:', job);
              }
              if (isVeryJunior) {
                console.log('🎓 Filtered out junior role for mid-level:', job);
              }
              return !isVerySenior && !isVeryJunior;
            });
          }
          // For senior level, we keep most roles but still filter extreme outliers
        }

        console.log('✅ Filtered salary data for analysis:', salaries);

        if (salaries.length > 0) {
          const salaryValues = salaries.map(job => job.salary);
          const avgMarketSalary = salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length;
          const minSalary = Math.min(...salaryValues);
          const maxSalary = Math.max(...salaryValues);
          
          const percentile = calculatePercentile(offerSalary, salaryValues);
          
          console.log('📈 Calculated market metrics:', {
            avgMarketSalary: Math.round(avgMarketSalary),
            minSalary: Math.round(minSalary),
            maxSalary: Math.round(maxSalary),
            percentile: Math.round(percentile),
            totalJobsAnalyzed: salaries.length
          });
          
          evaluation.salary_analysis = {
            offer_salary: offerSalary,
            market_average: Math.round(avgMarketSalary),
            market_min: Math.round(minSalary),
            market_max: Math.round(maxSalary),
            percentile: Math.round(percentile),
            difference_from_average: Math.round(offerSalary - avgMarketSalary),
            difference_percentage: Math.round(((offerSalary - avgMarketSalary) / avgMarketSalary) * 100),
            total_jobs_analyzed: salaries.length,
            filtered_jobs_count: jobs.length - salaries.length
          };

          // Salary score (0-40 points)
          if (percentile >= 75) evaluation.overall_score += 40;
          else if (percentile >= 50) evaluation.overall_score += 30;
          else if (percentile >= 25) evaluation.overall_score += 20;
          else evaluation.overall_score += 10;
        } else {
          console.log('⚠️ No valid salary data after filtering, using fallback');
          // Use fallback data if no valid salaries found
          const countryFallbackData = FALLBACK_MARKET_DATA[offerData.country] || FALLBACK_MARKET_DATA['India'];
          return evaluateJobOffer(offerData, countryFallbackData);
        }
      }
    }

    // Benefits Analysis (0-30 points)
    const benefits = [
      offerData.healthInsurance,
      offerData.remoteWork,
      offerData.esops,
      offerData.learningBudget,
      offerData.otherInsurance
    ];
    const benefitsCount = benefits.filter(Boolean).length;
    evaluation.benefits_score = benefitsCount * 6; // 6 points per benefit
    evaluation.overall_score += evaluation.benefits_score;

    // Market Insights
    if (marketData.histogram && marketData.histogram.histogram) {
      evaluation.market_insights.salary_distribution = marketData.histogram.histogram;
    }

    if (marketData.history && marketData.history.month) {
      evaluation.market_insights.trend = marketData.history.month;
    }

    // Generate Recommendations
    evaluation.recommendations = generateRecommendations(evaluation);

    // Location factor (0-30 points)
    const locationScore = calculateLocationScore(offerData.city, offerData.country);
    evaluation.overall_score += locationScore;

    // Cap the score at 100
    evaluation.overall_score = Math.min(evaluation.overall_score, 100);

    console.log('✅ Final evaluation result:', evaluation);
    return evaluation;
  };

  // Helper functions
  const calculatePercentile = (value, array) => {
    const sorted = array.sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    if (index === -1) return 100;
    return (index / sorted.length) * 100;
  };

  const calculateLocationScore = (city, country) => {
    // Major Indian cities scoring
    const majorCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida'];
    const majorCountries = ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia'];
    
    let score = 15; // Base score
    if (majorCities.includes(city)) score += 10;
    if (majorCountries.includes(country)) score += 5;
    
    return score;
  };

  const generateRecommendations = (evaluation) => {
    const recommendations = [];
    
    if (evaluation.salary_analysis.percentile) {
      if (evaluation.salary_analysis.percentile < 25) {
        recommendations.push('The salary offer is below market average. Consider negotiating for a higher base salary.');
      } else if (evaluation.salary_analysis.percentile >= 75) {
        recommendations.push('Excellent salary offer! This is above market average.');
      } else {
        recommendations.push('The salary offer is competitive with market rates.');
      }
    }

    if (evaluation.benefits_score < 18) {
      recommendations.push('Consider negotiating for additional benefits like health insurance, remote work options, or learning budget.');
    }

    // Add cost of living recommendations
    if (evaluation.cost_of_living && !evaluation.cost_of_living.error) {
      if (evaluation.cost_of_living.insights && evaluation.cost_of_living.insights.length > 0) {
        if (evaluation.cost_of_living.insights.includes('High cost of living area')) {
          recommendations.push('This is a high cost of living area. Ensure your salary covers living expenses comfortably.');
        }
        if (evaluation.cost_of_living.insights.includes('Budget-friendly location')) {
          recommendations.push('This location offers good value for money with reasonable living costs.');
        }
        if (evaluation.cost_of_living.insights.includes('Good public transportation available')) {
          recommendations.push('Take advantage of good public transportation to save on commuting costs.');
        }
      }
      
      // Add general cost of living advice
      recommendations.push('Review the detailed cost of living breakdown to plan your budget effectively.');
    }

    if (evaluation.overall_score >= 80) {
      recommendations.push('This is an excellent job offer! Strong compensation and benefits package.');
    } else if (evaluation.overall_score >= 60) {
      recommendations.push('This is a good job offer with room for some improvements.');
    } else {
      recommendations.push('This offer may need significant negotiation to match market standards.');
    }

    return recommendations;
  };

  return (
    <>
      <Navbar />

      <div className="job-offer-evaluator">
        {/* Hero Section with Blue Background */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Discover your earning potential</h1>
            <p className="joboffer-hero-subtitle">
              Evaluate job offers, compare salaries and benefits by industry and location.
            </p>
          </div>
          
          {/* Decorative briefcase icon */}
          <div className="hero-illustration">
            <div className="briefcase-icon" style={{ fontSize: 48 }} aria-hidden="true">
              <BriefcaseIcon size={48} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div className="container">
            <h2 className="section-title">Details</h2>
            
            <form onSubmit={handleSubmit} className="details-form">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    onFocus={() => setShowJobSuggestions(formData.jobTitle.length > 0)}
                    onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                    placeholder="Job title"
                    className="form-input"
                  />
                  {showJobSuggestions && (
                    <div className="suggestions-dropdown">
                      {filterSuggestions(jobRoles, formData.jobTitle).map((role, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onMouseDown={() => handleSuggestionClick('jobTitle', role)}
                        >
                          {role}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onFocus={() => setShowCitySuggestions(formData.city.length > 0)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    placeholder="City"
                    className="form-input"
                  />
                  {showCitySuggestions && (
                    <div className="suggestions-dropdown">
                      {filterSuggestions(cities, formData.city).map((city, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onMouseDown={() => handleSuggestionClick('city', city)}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <div className="autocomplete-container">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    onFocus={() => setShowCountrySuggestions(formData.country.length > 0)}
                    onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                    placeholder="Country"
                    className="form-input"
                  />
                  {showCountrySuggestions && (
                    <div className="suggestions-dropdown">
                      {filterSuggestions(countries, formData.country).map((country, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onMouseDown={() => handleSuggestionClick('country', country)}
                        >
                          {country}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Experience Level
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>
                    (affects salary comparison)
                  </span>
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (2-5 years)</option>
                  <option value="senior">Senior Level (5+ years)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Offered Salary 
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>
                    (Annual gross salary)
                  </span>
                </label>
                <div className="salary-input-container">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="currency-select"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., 100000 (annual)"
                    className="form-input salary-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Benefits</label>
                <div className="benefits-container">
                  <div className="benefit-item">
                    <input
                      type="checkbox"
                      id="healthInsurance"
                      name="healthInsurance"
                      checked={formData.healthInsurance}
                      onChange={handleInputChange}
                      className="benefit-checkbox"
                    />
                    <label htmlFor="healthInsurance" className="benefit-label">
                      Health Insurance
                    </label>
                  </div>

                  <div className="benefit-item">
                    <input
                      type="checkbox"
                      id="remoteWork"
                      name="remoteWork"
                      checked={formData.remoteWork}
                      onChange={handleInputChange}
                      className="benefit-checkbox"
                    />
                    <label htmlFor="remoteWork" className="benefit-label">
                      Remote Work
                    </label>
                  </div>

                  <div className="benefit-item">
                    <input
                      type="checkbox"
                      id="esops"
                      name="esops"
                      checked={formData.esops}
                      onChange={handleInputChange}
                      className="benefit-checkbox"
                    />
                    <label htmlFor="esops" className="benefit-label">
                      ESOPs
                    </label>
                  </div>

                  <div className="benefit-item">
                    <input
                      type="checkbox"
                      id="learningBudget"
                      name="learningBudget"
                      checked={formData.learningBudget}
                      onChange={handleInputChange}
                      className="benefit-checkbox"
                    />
                    <label htmlFor="learningBudget" className="benefit-label">
                      Learning Budget
                    </label>
                  </div>

                  <div className="benefit-item">
                    <input
                      type="checkbox"
                      id="otherInsurance"
                      name="otherInsurance"
                      checked={formData.otherInsurance}
                      onChange={handleInputChange}
                      className="benefit-checkbox"
                    />
                    <label htmlFor="otherInsurance" className="benefit-label">
                      Other Insurance Benefits
                    </label>
                  </div>
                </div>
              </div>

              <button type="submit" className="search-button" disabled={isEvaluating}>
                {isEvaluating ? 'Evaluating...' : 'Evaluate'}
              </button>
            </form>

            {/* API Error Display */}
            {apiError && (
              <div className="error-message">
                <div className="error-content">
                  <h3><WarningIcon size={20} className="inline mr-2" /> Error</h3>
                  <p>{apiError}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isEvaluating && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Analyzing market data and evaluating your job offer...</p>
              </div>
            )}

            {/* Evaluation Results */}
            {evaluationResults && (
              <div className="results-dashboard">
                {/* Hero Results Section */}
                <div className="results-hero">
                  <div className="results-hero-content">
                    <div className="score-showcase">
                      <div className="score-circle">
                        <div className="score-inner">
                          <span className="score-number">{evaluationResults.overall_score || 0}</span>
                        </div>
                      </div>
                      <div className="score-details">
                        <h2>Job Offer Evaluation</h2>
                        <p className="score-description">
                          {evaluationResults.overall_score >= 80 ? 
                            <><CelebrationIcon size={16} className="inline mr-1" /> Excellent offer!</> :
                           evaluationResults.overall_score >= 60 ? 
                            <><ThumbsUpIcon size={16} className="inline mr-1" /> Good offer!</> :
                           evaluationResults.overall_score >= 40 ? 
                            <><BalanceIcon size={16} className="inline mr-1" /> Average offer</> :
                           <><WarningIcon size={16} className="inline mr-1" /> Consider negotiating</>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Dashboard */}
                <div className="analytics-dashboard">
                  <div className="dashboard-container">
                    
                    {/* Salary Analytics Card */}
                    {evaluationResults.salary_analysis.offer_salary && (
                      <div className="analytics-card salary-card">
                        <div className="card-header">
                          <h3><MoneyBagIcon size={20} className="inline mr-2" /> Salary Analysis</h3>
                          <div className="percentile-badge">
                            {evaluationResults.salary_analysis.percentile}th percentile
                          </div>
                        </div>
                        <div className="card-content">
                          <div className="salary-chart-container">
                            <Bar
                              data={{
                                labels: ['Market Min', 'Your Offer', 'Market Avg', 'Market Max'],
                                datasets: [{
                                  data: [
                                    evaluationResults.salary_analysis.market_min || 0,
                                    evaluationResults.salary_analysis.offer_salary,
                                    evaluationResults.salary_analysis.market_average || 0,
                                    evaluationResults.salary_analysis.market_max || 0
                                  ],
                                  backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                                  borderRadius: 8,
                                  borderWidth: 0
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: { display: false },
                                  tooltip: {
                                    callbacks: {
                                      label: (context) => `${getCurrentCurrencySymbol()}${context.parsed.y.toLocaleString()}`
                                    }
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      callback: (value) => `${getCurrentCurrencySymbol()}${(value/1000).toFixed(0)}k`
                                    }
                                  },
                                  x: {
                                    grid: { display: false }
                                  }
                                },
                                animation: {
                                  duration: 2000,
                                  easing: 'easeInOutQuart'
                                }
                              }}
                              height={200}
                            />
                          </div>
                          <div className="salary-stats-grid">
                            <div className="stat-card your-offer">
                              <div className="stat-icon"><DollarIcon size={20} /></div>
                              <div className="stat-info">
                                <span className="stat-label">Your Offer</span>
                                <span className="stat-value">{getCurrentCurrencySymbol()}{evaluationResults.salary_analysis.offer_salary.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="stat-card market-avg">
                              <div className="stat-icon"><PieChartIcon size={20} /></div>
                              <div className="stat-info">
                                <span className="stat-label">Market Average</span>
                                <span className="stat-value">{getCurrentCurrencySymbol()}{evaluationResults.salary_analysis.market_average?.toLocaleString()}</span>
                              </div>
                            </div>
                            {evaluationResults.salary_analysis.difference_from_average !== undefined && (
                              <div className={`stat-card difference ${evaluationResults.salary_analysis.difference_from_average >= 0 ? 'positive' : 'negative'}`}>
                                <div className="stat-icon">
                                  {evaluationResults.salary_analysis.difference_from_average >= 0 ? 
                                    <TrendingUpIcon size={20} /> : 
                                    <TrendingDownIcon size={20} />
                                  }
                                </div>
                                <div className="stat-info">
                                  <span className="stat-label">Difference</span>
                                  <span className="stat-value">
                                    {evaluationResults.salary_analysis.difference_from_average >= 0 ? '+' : ''}
                                    {evaluationResults.salary_analysis.difference_percentage}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="data-source">
                            <small>Based on {evaluationResults.salary_analysis.total_jobs_analyzed} similar job listings</small>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Benefits Analysis Card */}
                    <div className="analytics-card benefits-card">
                      <div className="card-header">
                        <h3><TrendingUpIcon size={20} className="inline mr-2" /> Benefits Analysis</h3>
                        <div className="benefits-score-badge">
                          {evaluationResults.benefits_score}/30 points
                        </div>
                      </div>
                      <div className="card-content">
                        <div className="benefits-chart-container">
                          <Doughnut
                            data={{
                              labels: ['Health Insurance', 'Remote Work', 'ESOPs', 'Learning Budget', 'Other Insurance'],
                              datasets: [{
                                data: [
                                  formData.healthInsurance ? 8 : 0,
                                  formData.remoteWork ? 6 : 0,
                                  formData.esops ? 8 : 0,
                                  formData.learningBudget ? 4 : 0,
                                  formData.otherInsurance ? 4 : 0
                                ],
                                backgroundColor: [
                                  formData.healthInsurance ? '#10b981' : '#e5e7eb',
                                  formData.remoteWork ? '#3b82f6' : '#e5e7eb',
                                  formData.esops ? '#8b5cf6' : '#e5e7eb',
                                  formData.learningBudget ? '#f59e0b' : '#e5e7eb',
                                  formData.otherInsurance ? '#ef4444' : '#e5e7eb'
                                ],
                                borderWidth: 0,
                                cutout: '70%'
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  callbacks: {
                                    label: (context) => `${context.label}: ${context.parsed > 0 ? 'Included' : 'Not Included'}`
                                  }
                                }
                              },
                              animation: {
                                duration: 2000,
                                easing: 'easeInOutQuart'
                              }
                            }}
                            height={200}
                          />
                          <div className="benefits-score-center">
                            <span className="benefits-score-number">{evaluationResults.benefits_score}</span>
                            <span className="benefits-score-total">/30</span>
                          </div>
                        </div>
                        <div className="benefits-list-modern">
                          <div className={`benefit-item ${formData.healthInsurance ? 'included' : 'excluded'}`}>
                            <div className="benefit-icon"><HospitalIcon size={20} /></div>
                            <span className="benefit-name">Health Insurance</span>
                            <div className="benefit-status">
                              {formData.healthInsurance ? <CheckMarkIcon size={16} /> : <CrossMarkIcon size={16} />}
                            </div>
                          </div>
                          <div className={`benefit-item ${formData.remoteWork ? 'included' : 'excluded'}`}>
                            <div className="benefit-icon"><HomeIcon size={20} /></div>
                            <span className="benefit-name">Remote Work</span>
                            <div className="benefit-status">
                              {formData.remoteWork ? <CheckMarkIcon size={16} /> : <CrossMarkIcon size={16} />}
                            </div>
                          </div>
                          <div className={`benefit-item ${formData.esops ? 'included' : 'excluded'}`}>
                            <div className="benefit-icon"><SeedlingIcon size={20} /></div>
                            <span className="benefit-name">ESOPs</span>
                            <div className="benefit-status">
                              {formData.esops ? <CheckMarkIcon size={16} /> : <CrossMarkIcon size={16} />}
                            </div>
                          </div>
                          <div className={`benefit-item ${formData.learningBudget ? 'included' : 'excluded'}`}>
                            <div className="benefit-icon"><BookIcon size={20} /></div>
                            <span className="benefit-name">Learning Budget</span>
                            <div className="benefit-status">
                              {formData.learningBudget ? <CheckMarkIcon size={16} /> : <CrossMarkIcon size={16} />}
                            </div>
                          </div>
                          <div className={`benefit-item ${formData.otherInsurance ? 'included' : 'excluded'}`}>
                            <div className="benefit-icon"><ShieldIcon size={20} /></div>
                            <span className="benefit-name">Other Insurance</span>
                            <div className="benefit-status">
                              {formData.otherInsurance ? <CheckMarkIcon size={16} /> : <CrossMarkIcon size={16} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost of Living Card */}
                    {costOfLivingData && (
                      <div className="analytics-card cost-card">
                        <div className="card-header">
                          <h3><CityscapeIcon size={20} className="inline mr-2" /> Cost of Living</h3>
                          <div className="location-badge">
                            <LocationPinIcon size={16} className="inline mr-1" /> {costOfLivingData.city}, {costOfLivingData.country}
                          </div>
                        </div>
                        <div className="card-content">
                          {costOfLivingData.error ? (
                              <div className="cost-error-modern">
                              <div className="error-icon"><WarningIcon size={24} /></div>
                              <div className="error-text">
                                <p>{costOfLivingData.error}</p>
                                {!GEMINI_CONFIG.API_KEY && (
                                  <p className="config-hint">Configure VITE_GEMINI_API_KEY for cost analysis</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="cost-chart-container">
                                <Doughnut
                                  data={{
                                    labels: ['Rent', 'Food', 'Transport'],
                                    datasets: [{
                                      data: [
                                        costOfLivingData.monthlyBreakdown.rent || 0,
                                        costOfLivingData.monthlyBreakdown.food || 0,
                                        costOfLivingData.monthlyBreakdown.transport || 0
                                      ],
                                      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                                      borderWidth: 0,
                                      cutout: '60%'
                                    }]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: {
                                        callbacks: {
                                          label: (context) => `${context.label}: ₹${context.parsed.toLocaleString()}`
                                        }
                                      }
                                    },
                                    animation: {
                                      duration: 2000,
                                      easing: 'easeInOutQuart'
                                    }
                                  }}
                                  height={200}
                                />
                                <div className="cost-total-center">
                                  <span className="cost-total-number">
                                    ₹{costOfLivingData.monthlyBreakdown.total > 0 
                                      ? (costOfLivingData.monthlyBreakdown.total/1000).toFixed(0) + 'k'
                                      : 'N/A'
                                    }
                                  </span>
                                  <span className="cost-total-label">Monthly</span>
                                </div>
                              </div>
                              <div className="cost-breakdown-modern">
                  <div className="cost-item-modern rent">
                    <div className="cost-icon"><HomeIcon size={20} /></div>
                                  <div className="cost-details">
                                    <span className="cost-label">Rent</span>
                                    <span className="cost-value">
                                      ₹{costOfLivingData.monthlyBreakdown.rent > 0 
                                        ? costOfLivingData.monthlyBreakdown.rent.toLocaleString() 
                                        : 'N/A'
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className="cost-item-modern food">
                                  <div className="cost-icon"><DiningIcon size={20} /></div>
                                  <div className="cost-details">
                                    <span className="cost-label">Food</span>
                                    <span className="cost-value">
                                      ₹{costOfLivingData.monthlyBreakdown.food > 0 
                                        ? costOfLivingData.monthlyBreakdown.food.toLocaleString() 
                                        : 'N/A'
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className="cost-item-modern transport">
                                  <div className="cost-icon"><CarIcon size={20} /></div>
                                  <div className="cost-details">
                                    <span className="cost-label">Transport</span>
                                    <span className="cost-value">
                                      ₹{costOfLivingData.monthlyBreakdown.transport > 0 
                                        ? costOfLivingData.monthlyBreakdown.transport.toLocaleString() 
                                        : 'N/A'
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {costOfLivingData.insights && costOfLivingData.insights.length > 0 && (
                                <div className="cost-insights-modern">
                                  <h4><LightBulbIcon size={16} className="inline mr-2" /> Key Insights</h4>
                                  <div className="insights-tags">
                                    {costOfLivingData.insights.map((insight, index) => (
                                      <span key={index} className="insight-tag">{insight}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations Card */}
                    <div className="analytics-card recommendations-card">
                      <div className="card-header">
                        <h3><LightBulbIcon size={20} className="inline mr-2" /> Recommendations</h3>
                      </div>
                      <div className="card-content">
                        <div className="recommendations-modern">
                          {evaluationResults.recommendations.map((recommendation, index) => (
                            <div key={index} className="recommendation-modern">
                              <div className="rec-number">{index + 1}</div>
                              <div className="rec-content">{recommendation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Action Buttons */}
                <div className="results-actions-modern">
                  <button 
                    onClick={() => {
                      setEvaluationResults(null);
                      setCostOfLivingData(null);
                    }} 
                    className="action-btn secondary"
                  >
                    <span className="btn-icon"><RefreshIcon size={16} /></span>
                    Evaluate Another Offer
                  </button>
                  <button 
                    onClick={() => window.print()} 
                    className="action-btn primary"
                  >
                    <span className="btn-icon"><PageIcon size={16} /></span>
                    Download Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobOfferEvaluator;
