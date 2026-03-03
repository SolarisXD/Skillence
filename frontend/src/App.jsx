import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainPage from './components/MainPage';
import ResumeDashboard from './components/Dashboard/ResumeDashboard';
import ProfilePage from './components/ProfilePage/ProfilePage';
import JobOfferEvaluator from './components/Job Offer Evaluator/JobOfferEvaluator';
import CareerPathRecommendation from './components/Career Path Recommendation/CareerPathRecommendation';
import JobTrendDashboard from './components/Job Trend/current/JobTrendDashboard';
import ReflectionEngineHome from './components/ReflectionEngineHome';
import ReflectionEngineInterviewDiagnostic from './components/ReflectionEngineInterviewDiagnostic';
import About from './components/About';
import HelpCenter from './components/HelpCenter';
import Contact from './components/Contact';
import Status from './components/Status';
import Blog from './components/Blog';
import PlacementDashboard from './components/Placement/PlacementDashboard';
import StudentCampusPlacement from './components/Placement/StudentCampusPlacement';

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

// Role-based Protected Route
const RoleRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole') || 'student';
  
  const isTestMode = window.location.href.includes('localhost');
  
  if (!token && !isTestMode) {
    return <Navigate to="/" replace />;
  }
  
  if (isTestMode && !token) {
    localStorage.setItem('token', 'test_token_123');
    localStorage.setItem('userId', 'test_user_123');
  }
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/status" element={<Status />} />
          <Route path="/blog" element={<Blog />} />
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
          <Route path="/job-trends" element={<JobTrendDashboard />} />
          <Route path="/reflection-engine" element={<ReflectionEngineHome />} />
          <Route path="/reflection-engine/diagnostic" element={<ReflectionEngineInterviewDiagnostic />} />
          <Route 
            path="/career-path-recommendation" 
            element={
              <ProtectedRoute>
                <CareerPathRecommendation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/placement-dashboard" 
            element={
              <RoleRoute requiredRole="placement_cell">
                <PlacementDashboard />
              </RoleRoute>
            } 
          />
          <Route 
            path="/campus-placement" 
            element={
              <RoleRoute requiredRole="student">
                <StudentCampusPlacement />
              </RoleRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
