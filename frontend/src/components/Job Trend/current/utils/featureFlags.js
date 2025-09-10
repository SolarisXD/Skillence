// Feature flags for safe development
export const FEATURE_FLAGS = {
  // Job Trend Features (your safe zone)
  JOB_COMPARISON: true,        // ✅ Enabled for testing
  FILTER_PRESETS: true,
  PDF_EXPORT: true,
  AI_INSIGHTS: true,           // ✅ Enabled for testing
  GEOGRAPHIC_MAP: false,
  TREND_PREDICTIONS: false,
  
  // Emergency killswitches
  ENHANCED_DASHBOARD: true,
  ADVANCED_FILTERING: true,
  AUTO_REFRESH: true
};

// Safe feature check utility
export const isFeatureEnabled = (featureName) => {
  const enabled = FEATURE_FLAGS[featureName] || false;
  console.log(`Feature flag check: ${featureName} = ${enabled}`);
  return enabled;
};

// Development override (only in development)
if (import.meta.env.DEV) {
  // Allow URL parameters to override flags
  const urlParams = new URLSearchParams(window.location.search);
  Object.keys(FEATURE_FLAGS).forEach(flag => {
    if (urlParams.has(flag.toLowerCase())) {
      FEATURE_FLAGS[flag] = urlParams.get(flag.toLowerCase()) === 'true';
    }
  });
}
