import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import SaveSkillButton from './SaveSkillButton';
import { ArrowLeft, BookOpen, ExternalLink, Map, Trophy } from 'lucide-react';
import './SkillLibraries.css';

const SkillDetailPage = () => {
  const { skill_id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, roadmap, courses, practice

  useEffect(() => {
    fetchSkillDetail();
  }, [skill_id]);

  const fetchSkillDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/skills/${skill_id}`);
      if (res.ok) {
        const data = await res.json();
        setSkill(data);
      } else {
        navigate('/skill-libraries');
      }
    } catch (error) {
      console.error('Error fetching skill details', error);
      navigate('/skill-libraries');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !skill) {
    return (
      <div className="skill-libraries-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="sl-loader"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="sl-content-area">
            {skill.image_url && (
              <div style={{width: '100%', height: '300px', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border-color)'}}>
                <img src={skill.image_url} alt={skill.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
            )}
            <h3 className="sl-section-title">What is {skill.name}?</h3>
            <div className="sl-section-box sl-text">
              {skill.description}
            </div>
            <h3 className="sl-section-title">Why Learn It?</h3>
            <div className="sl-section-box sl-text">
              {skill.overview}
            </div>

            {skill.youtube_videos && skill.youtube_videos.length > 0 && (
              <>
                <h3 className="sl-section-title" style={{marginTop: '2rem'}}>Recommended Videos</h3>
                <div className="sl-link-grid">
                  {skill.youtube_videos.map((vid, idx) => (
                    <a key={idx} href={vid.url} target="_blank" rel="noreferrer" className="sl-link-card">
                      <div className="sl-link-top">
                        <span className="sl-platform-badge" style={{color: '#ff0000', backgroundColor: 'rgba(255,0,0,0.1)'}}>YouTube</span>
                        <ExternalLink size={16} color="var(--text-muted)" />
                      </div>
                      <h4 className="sl-link-title">{vid.title}</h4>
                    </a>
                  ))}
                </div>
              </>
            )}

            {skill.articles && skill.articles.length > 0 && (
              <>
                <h3 className="sl-section-title" style={{marginTop: '2rem'}}>Helpful Articles</h3>
                <div className="sl-link-grid">
                  {skill.articles.map((art, idx) => (
                    <a key={idx} href={art.url} target="_blank" rel="noreferrer" className="sl-link-card">
                      <div className="sl-link-top" style={{alignItems: 'center', marginBottom: 0}}>
                        <h4 className="sl-link-title" style={{margin: 0}}>{art.title}</h4>
                        <ExternalLink size={18} color="var(--text-muted)" />
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      case 'roadmap':
        // Parse the roadmap array into a timeline structure
        const parsedRoadmap = [];
        let currentPhase = null;
        skill.roadmap.forEach(item => {
          if (item.startsWith('Phase') || item.match(/^\d+\./)) {
            if (currentPhase) parsedRoadmap.push(currentPhase);
            currentPhase = { title: item, items: [] };
          } else if (item.startsWith('- ')) {
            if (currentPhase) currentPhase.items.push(item.substring(2));
          } else {
            if (currentPhase) currentPhase.items.push(item);
            else currentPhase = { title: item, items: [] };
          }
        });
        if (currentPhase) parsedRoadmap.push(currentPhase);

        return (
          <div className="sl-section-box sl-content-area">
            <h3 className="sl-section-title">
              <Map className="sl-search-icon" /> Custom Learning Roadmap
            </h3>

            <div className="sl-custom-timeline">
              {parsedRoadmap.map((phase, idx) => (
                <div key={idx} className="sl-timeline-node">
                  <div className="sl-node-marker">
                    <div className="sl-node-dot"></div>
                    {idx < parsedRoadmap.length - 1 && <div className="sl-node-line"></div>}
                  </div>
                  <div className="sl-node-content">
                    <h4 className="sl-node-title">{phase.title}</h4>
                    {phase.items.length > 0 ? (
                      <ul className="sl-node-list">
                        {phase.items.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{color: 'var(--text-secondary)'}}>Deep dive into this section by following best practices.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {skill.roadmap_url && (
              <div style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                <p style={{color: 'var(--text-secondary)'}}>An official interactive roadmap is available for this skill.</p>
                <a 
                  href={skill.roadmap_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="sl-big-btn"
                >
                  View Interactive Roadmap on roadmap.sh
                  <ExternalLink size={18} />
                </a>
              </div>
            )}
          </div>
        );
      case 'courses':
        return (
          <div className="sl-content-area">
            <h3 className="sl-section-title">
              <BookOpen className="sl-search-icon" color="var(--accent-color)" /> Recommended Courses
            </h3>
            <div className="sl-link-grid">
              {skill.courses.map((course, idx) => (
                <a key={idx} href={course.url} target="_blank" rel="noreferrer" className="sl-link-card">
                  <div className="sl-link-top">
                    <span className="sl-platform-badge">
                      {course.platform}
                    </span>
                    <ExternalLink size={16} color="var(--text-muted)" />
                  </div>
                  <h4 className="sl-link-title">
                    {course.name}
                  </h4>
                </a>
              ))}
            </div>
          </div>
        );
      case 'practice':
        return (
          <div className="sl-content-area">
            <h3 className="sl-section-title">
              <Trophy className="sl-search-icon" color="var(--success-color)" /> Practice Platforms
            </h3>
            <div className="sl-link-grid">
              {skill.practice.map((prac, idx) => (
                <a key={idx} href={prac.url} target="_blank" rel="noreferrer" className="sl-link-card">
                  <div className="sl-link-top" style={{alignItems: 'center', marginBottom: 0}}>
                    <h4 className="sl-link-title" style={{margin: 0}}>
                      {prac.name}
                    </h4>
                    <ExternalLink size={18} color="var(--text-muted)" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="skill-libraries-page">
      <Navbar />
      
      <div className="sl-detail-container">
        <button 
          onClick={() => navigate('/skill-libraries')}
          className="sl-back-btn"
        >
          <ArrowLeft size={20} />
          Back to Libraries
        </button>
        
        {/* Header Section */}
        <div className="sl-detail-header">
          <div>
            <div className="sl-card-badge" style={{display: 'inline-block', marginBottom: '1rem'}}>
              {skill.category}
            </div>
            <h1 className="sl-detail-title">
              {skill.name}
            </h1>
          </div>
          <div>
            <SaveSkillButton skillId={skill.id} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sl-tabs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'roadmap', label: 'Roadmap' },
            { id: 'courses', label: 'Courses' },
            { id: 'practice', label: 'Practice' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sl-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content area */}
        <div style={{minHeight: '400px'}}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SkillDetailPage;
