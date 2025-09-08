// Adzuna API Configuration
export const ADZUNA_CONFIG = {
  BASE_URL: 'https://api.adzuna.com/v1/api',
  API_KEY: import.meta.env.VITE_ADZUNA_API_KEY,
  APP_ID: import.meta.env.VITE_ADZUNA_APP_ID,
};

// Validate API configuration
export const isAdzunaConfigured = () => {
  return !!(ADZUNA_CONFIG.API_KEY && ADZUNA_CONFIG.APP_ID);
};

// Country code mapping for Adzuna API
export const COUNTRY_CODES = {
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

// Get country code for Adzuna API
export const getCountryCode = (countryName) => {
  return COUNTRY_CODES[countryName] || 'us';
};

// Development fallback data (for when API is not configured)
export const FALLBACK_MARKET_DATA = {
  jobs: {
    count: 125,
    results: [
      {
        title: 'Senior Software Engineer',
        salary_min: 90000,
        salary_max: 130000,
        location: { display_name: 'San Francisco, CA' }
      },
      {
        title: 'Software Developer',
        salary_min: 70000,
        salary_max: 100000,
        location: { display_name: 'Austin, TX' }
      },
      {
        title: 'Full Stack Engineer',
        salary_min: 85000,
        salary_max: 120000,
        location: { display_name: 'New York, NY' }
      }
    ]
  },
  histogram: null,
  history: null,
  errors: ['Using fallback data - API not configured']
};
