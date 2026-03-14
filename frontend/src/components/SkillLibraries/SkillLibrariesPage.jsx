import React, { useState, useEffect } from 'react';
import Navbar from '../navbar';
import SkillSearchBar from './SkillSearchBar';
import SkillGrid from './SkillGrid';
import './SkillLibraries.css';

const SkillLibrariesPage = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
        setFilteredSkills(data);
      } else {
        setError('Failed to load skills. Server returned ' + res.status);
      }
    } catch (error) {
      console.error('Failed to fetch skills', error);
      setError('Could not connect to the server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setFilteredSkills(skills);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/api/skills/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setFilteredSkills(data);
      }
    } catch (error) {
      console.error('Failed to search skills', error);
      // Fallback to client-side filter
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = skills.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        s.category.toLowerCase().includes(lowerQuery)
      );
      setFilteredSkills(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="skill-libraries-page">
      <Navbar />
      
      <main className="sl-main">
        <div className="sl-header">
          <h1 className="sl-title">
            Skill Libraries
          </h1>
          <p className="sl-subtitle">
            Explore the global digital learning ecosystem. Discover new tech stacks, follow curated roadmaps, and track your progress.
          </p>
        </div>

        <SkillSearchBar query={query} onSearch={handleSearch} />

        {isLoading ? (
          <div className="sl-loader"></div>
        ) : error ? (
          <div className="sl-error">
            <h3>{error}</h3>
          </div>
        ) : skills.length === 0 ? (
          <div className="sl-empty">
            <h3>No skills found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <SkillGrid skills={filteredSkills} />
        )}
      </main>
    </div>
  );
};

export default SkillLibrariesPage;
