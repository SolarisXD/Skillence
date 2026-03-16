import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { apiUrl } from '../utils/api';
import '../styles/AuthModal.css';

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

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

        const response = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('userRole', formData.role || 'student');
          localStorage.setItem('user', JSON.stringify({ email: formData.email, name: formData.name, role: formData.role }));
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
        const response = await fetch(apiUrl('/api/auth/login'), {
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
          localStorage.setItem('userRole', data.role || 'student');
          // Try to persist some user info. If API returns user info prefer that, otherwise fall back to email.
          const userToStore = data.user || { email: formData.email, role: data.role || 'student' };
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
      confirmPassword: '',
      role: 'student'
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

          {mode === 'signup' && (
            <div className="form-group">
              <label>I am a</label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>
                  Student
                </button>
                <button
                  type="button"
                  className={`role-option ${formData.role === 'placement_cell' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'placement_cell' }))}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Placement Cell
                </button>
              </div>
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

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setGoogleLoading(true);
              setError('');
              try {
                const response = await fetch(apiUrl('/api/auth/google-login'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: credentialResponse.credential }),
                });
                if (response.ok) {
                  const data = await response.json();
                  localStorage.setItem('token', data.access_token);
                  localStorage.setItem('userRole', data.role || 'student');
                  if (data.user) {
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('user', JSON.stringify(data.user));
                  }
                  if (typeof onSuccess === 'function') {
                    onSuccess(data.user || { email: '' });
                  }
                  onClose();
                } else {
                  const errorData = await response.json();
                  setError(errorData.detail || 'Google sign-in failed');
                }
              } catch (err) {
                setError('Network error during Google sign-in');
              } finally {
                setGoogleLoading(false);
              }
            }}
            onError={() => {
              setError('Google sign-in was unsuccessful');
            }}
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
            shape="rectangular"
            theme="outline"
          />
          {googleLoading && <p className="google-loading-text">Signing in with Google...</p>}
        </div>

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