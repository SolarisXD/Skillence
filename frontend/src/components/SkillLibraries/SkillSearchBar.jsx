import React from 'react';
import { Search } from 'lucide-react';

const SkillSearchBar = ({ query, onSearch }) => {
  return (
    <div className="sl-search-container">
      <div className="sl-search-box">
        <Search className="sl-search-icon" size={24} />
        <input 
          type="text" 
          placeholder="Search by skill name, technology, framework, or category..."
          className="sl-search-input"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <div className="sl-filters">
        {['All', 'Programming', 'AI & Data', 'Web Development', 'Cloud & DevOps'].map((cat) => (
          <button 
            key={cat}
            onClick={() => onSearch(cat === 'All' ? '' : cat)}
            className={`sl-filter-btn ${
              (query === '' && cat === 'All') || query === cat ? 'active' : ''
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkillSearchBar;
