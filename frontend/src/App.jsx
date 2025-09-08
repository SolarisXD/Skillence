import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainPage from './components/MainPage';
import ResumeDashboard from './components/Dashboard/ResumeDashboard';
import ProfilePage from './components/ProfilePage';
import JobOfferEvaluator from './components/Job Offer Evaluator/JobOfferEvaluator';
import CareerPathRecommendation from './components/Career Path Recommendation/CareerPathRecommendation';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Temporary bypass for testing - remove in production
  const isTestMode = window.location.href.includes('localhost');
  
  if (!token && !isTestMode) {
    return <Navigate to="/" replace />;
  }
  
  // For test mode, create a temporary token
  if (isTestMode && !token) {
    localStorage.setItem('token', 'test_token_123');
    localStorage.setItem('userId', 'test_user_123');
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route 
            path="/dashboard/resume" 
            element={
              <ProtectedRoute>
                <ResumeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route path="/job-offer-evaluator" element={<JobOfferEvaluator />} />
          <Route 
            path="/career-path-recommendation" 
            element={
              <ProtectedRoute>
                <CareerPathRecommendation />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
