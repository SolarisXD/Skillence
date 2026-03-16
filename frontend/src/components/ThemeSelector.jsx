import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import '../styles/ThemeSelector.css';

const ThemeSelector = ({ isOpen, onClose, onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Get current theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    
    // Ensure theme is applied to document
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeSelect = (theme, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    
    // Apply theme immediately
    const finalTheme = theme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    
    document.documentElement.setAttribute('data-theme', finalTheme);
    onThemeChange(theme);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="theme-selector-dropdown" onClick={(e) => e.stopPropagation()}>
      <div 
        className="theme-option-compact" 
        onClick={(e) => handleThemeSelect('light', e)}
      >
        <div className="theme-icon">
          <Sun size={20} />
        </div>
        <span>Light</span>
        {currentTheme === 'light' && <div className="check-indicator"><Check size={16} /></div>}
      </div>
      
      <div 
        className="theme-option-compact" 
        onClick={(e) => handleThemeSelect('dark', e)}
      >
        <div className="theme-icon">
          <Moon size={20} />
        </div>
        <span>Dark</span>
        {currentTheme === 'dark' && <div className="check-indicator"><Check size={16} /></div>}
      </div>
      
      <div 
        className="theme-option-compact" 
        onClick={(e) => handleThemeSelect('auto', e)}
      >
        <div className="theme-icon">
          <Monitor size={20} />
        </div>
        <span>Auto</span>
        {currentTheme === 'auto' && <div className="check-indicator"><Check size={16} /></div>}
      </div>
    </div>
  );
};

export default ThemeSelector;