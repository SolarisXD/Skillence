import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const SkillCard = ({ skill }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="sl-card"
      onClick={() => navigate(`/skill-libraries/${skill.id}`)}
    >
      <div className="sl-card-header">
        <div className="sl-card-icon">
          <BookOpen size={24} />
        </div>
        <span className="sl-card-badge">
          {skill.category}
        </span>
      </div>
      
      <h3 className="sl-card-title">
        {skill.name}
      </h3>
      
      <p className="sl-card-desc">
        {skill.description}
      </p>

      <div className="sl-card-footer">
        Explore skill <ArrowRight size={16} />
      </div>
    </div>
  );
};

export default SkillCard;
