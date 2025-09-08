import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthModal.css';

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('user', JSON.stringify({ email: formData.email, name: formData.name }));
          // Notify parent (Navbar) about successful auth so it can update UI immediately
          if (typeof onSuccess === 'function') {
            try {
              const storedUser = JSON.parse(localStorage.getItem('user')) || { email: formData.email, name: formData.name };
              onSuccess(storedUser);
            } catch (err) {
              onSuccess({ email: formData.email, name: formData.name });
            }
          }
          onClose();
          // Stay on landing page after signup
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Registration failed');
        }
      } else {
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('userId', data.user_id);
          // Try to persist some user info. If API returns user info prefer that, otherwise fall back to email.
          const userToStore = data.user || { email: formData.email };
          localStorage.setItem('user', JSON.stringify(userToStore));
          // Notify parent (Navbar) about successful auth so it can update UI immediately
          if (typeof onSuccess === 'function') {
            try {
              const storedUser = JSON.parse(localStorage.getItem('user')) || userToStore;
              onSuccess(storedUser);
            } catch (err) {
              onSuccess(userToStore);
            }
          }
          onClose();
          // Stay on landing page after login
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal opens/closes or mode changes
  React.useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {mode === 'login' 
              ? 'Sign in to your Skillence account' 
              : 'Join Skillence and start your journey'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength="6"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm your password"
                minLength="6"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="auth-switch-btn"
              onClick={onSwitchMode}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {mode === 'login' && (
          <div className="forgot-password">
            <button type="button" className="forgot-password-btn">
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;