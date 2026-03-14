import React from 'react';
import SkillCard from './SkillCard';

const SkillGrid = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="sl-grid">
      {skills.map(skill => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
};

export default SkillGrid;
