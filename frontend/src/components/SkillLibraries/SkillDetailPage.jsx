import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import SaveSkillButton from './SaveSkillButton';
import {
  ArrowLeft, BookOpen, ExternalLink, Map, Trophy, Play,
  Eye, Clock, Calendar, CheckSquare, Square, ChevronDown,
  ChevronUp, Zap, Target, Layers, Code2, Rocket
} from 'lucide-react';
import './SkillLibraries.css';

const PHASE_ICONS = [Layers, Code2, Target, Zap, Rocket];
const PHASE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

const SkillDetailPage = () => {
  const { skill_id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [ytVideos, setYtVideos] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [expandedPhases, setExpandedPhases] = useState({});

  useEffect(() => { fetchSkillDetail(); }, [skill_id]);

  const fetchSkillDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/skills/${skill_id}`);
      if (res.ok) {
        const data = await res.json();
        setSkill(data);
        // Load completed steps from localStorage
        const saved = localStorage.getItem(`roadmap_${skill_id}`);
        if (saved) setCompletedSteps(JSON.parse(saved));
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

  const fetchYouTubeVideos = useCallback(async () => {
    if (ytVideos.length > 0 || ytLoading) return;
    setYtLoading(true);
    try {
      const res = await fetch(`/api/skills/youtube/${skill_id}`);
      if (res.ok) {
        const data = await res.json();
        setYtVideos(data.videos || []);
      }
    } catch (e) {
      console.error('YouTube fetch error', e);
    } finally {
      setYtLoading(false);
    }
  }, [skill_id, ytVideos.length, ytLoading]);

  // Lazy load YouTube when Overview tab is active
  useEffect(() => {
    if (activeTab === 'overview' && skill) fetchYouTubeVideos();
  }, [activeTab, skill]);

  const toggleStep = (stepKey) => {
    setCompletedSteps(prev => {
      const next = prev.includes(stepKey) ? prev.filter(s => s !== stepKey) : [...prev, stepKey];
      localStorage.setItem(`roadmap_${skill_id}`, JSON.stringify(next));
      // Persist to server
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/skills/user/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ skill_id, is_saved: true, completed_steps: next })
        }).catch(() => {});
      }
      return next;
    });
  };

  const togglePhaseExpand = (idx) => {
    setExpandedPhases(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const parseRoadmap = () => {
    if (!skill?.roadmap) return [];
    const phases = [];
    let current = null;
    skill.roadmap.forEach(item => {
      if (item.startsWith('Phase') || item.match(/^\d+\./)) {
        if (current) phases.push(current);
        current = { title: item, items: [] };
      } else if (item.startsWith('- ')) {
        if (current) current.items.push(item.substring(2));
      } else {
        if (current) current.items.push(item);
        else current = { title: item, items: [] };
      }
    });
    if (current) phases.push(current);
    return phases;
  };

  if (isLoading || !skill) {
    return (
      <div className="skill-libraries-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="sl-skeleton-page">
          <div className="sl-skeleton-bar" style={{width: '30%', height: '20px'}}></div>
          <div className="sl-skeleton-bar" style={{width: '60%', height: '40px', marginTop: '1rem'}}></div>
          <div className="sl-skeleton-bar" style={{width: '100%', height: '300px', marginTop: '2rem', borderRadius: '1rem'}}></div>
        </div>
      </div>
    );
  }

  const parsedRoadmap = parseRoadmap();
  const totalSteps = parsedRoadmap.reduce((sum, p) => sum + p.items.length, 0);
  const completedCount = completedSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="sl-content-area">
            {skill.image_url && (
              <div className="sl-hero-image">
                <img src={skill.image_url} alt={skill.name} />
                <div className="sl-hero-overlay">
                  <div className="sl-hero-badges">
                    {skill.difficulty && <span className="sl-difficulty-badge">{skill.difficulty}</span>}
                    {skill.estimated_time && <span className="sl-time-badge"><Clock size={14} /> {skill.estimated_time}</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="sl-overview-grid">
              <div className="sl-section-box">
                <h3 className="sl-section-title">What is {skill.name}?</h3>
                <p className="sl-text">{skill.description}</p>
              </div>
              <div className="sl-section-box">
                <h3 className="sl-section-title">Why Learn It?</h3>
                <p className="sl-text">{skill.overview}</p>
              </div>
            </div>

            {skill.prerequisites && skill.prerequisites.length > 0 && (
              <div className="sl-section-box" style={{marginTop: '1.5rem'}}>
                <h3 className="sl-section-title">Prerequisites</h3>
                <div className="sl-tag-list">
                  {skill.prerequisites.map((p, i) => <span key={i} className="sl-tag">{p}</span>)}
                </div>
              </div>
            )}

            {skill.career_roles && skill.career_roles.length > 0 && (
              <div className="sl-section-box" style={{marginTop: '1.5rem'}}>
                <h3 className="sl-section-title">Career Roles</h3>
                <div className="sl-tag-list">
                  {skill.career_roles.map((r, i) => <span key={i} className="sl-tag career">{r}</span>)}
                </div>
              </div>
            )}

            {skill.use_cases && skill.use_cases.length > 0 && (
              <div className="sl-section-box" style={{marginTop: '1.5rem'}}>
                <h3 className="sl-section-title">Industry Use Cases</h3>
                <div className="sl-tag-list">
                  {skill.use_cases.map((u, i) => <span key={i} className="sl-tag usecase">{u}</span>)}
                </div>
              </div>
            )}

            {/* YouTube Videos */}
            <div style={{marginTop: '2rem'}}>
              <h3 className="sl-section-title"><Play size={20} color="#ff0000" /> Top Learning Videos</h3>
              {ytLoading ? (
                <div className="sl-video-grid">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="sl-video-card sl-skeleton-card">
                      <div className="sl-skeleton-bar" style={{width:'100%', height:'140px', borderRadius:'10px'}}></div>
                      <div className="sl-skeleton-bar" style={{width:'80%', height:'14px', marginTop:'0.8rem'}}></div>
                      <div className="sl-skeleton-bar" style={{width:'50%', height:'12px', marginTop:'0.5rem'}}></div>
                    </div>
                  ))}
                </div>
              ) : ytVideos.length > 0 ? (
                <div className="sl-video-grid">
                  {ytVideos.map((vid, idx) => (
                    <a key={idx} href={vid.url} target="_blank" rel="noreferrer" className="sl-video-card">
                      <div className="sl-video-thumb">
                        <img src={vid.thumbnail} alt={vid.title} loading="lazy" />
                        <div className="sl-play-overlay"><Play size={32} /></div>
                        {vid.duration && <span className="sl-duration-badge">{vid.duration}</span>}
                      </div>
                      <div className="sl-video-info">
                        <h4 className="sl-video-title">{vid.title}</h4>
                        <p className="sl-video-channel">{vid.channel}</p>
                        <div className="sl-video-meta">
                          {vid.view_count && <span><Eye size={13} /> {vid.view_count}</span>}
                          {vid.published_at && <span><Calendar size={13} /> {vid.published_at}</span>}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="sl-link-grid">
                  {skill.youtube_videos?.map((vid, idx) => (
                    <a key={idx} href={vid.url} target="_blank" rel="noreferrer" className="sl-link-card">
                      <div className="sl-link-top">
                        <span className="sl-platform-badge" style={{color: '#ff0000', backgroundColor: 'rgba(255,0,0,0.1)'}}>YouTube</span>
                        <ExternalLink size={16} color="var(--text-muted)" />
                      </div>
                      <h4 className="sl-link-title">{vid.title}</h4>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {skill.articles?.length > 0 && (
              <div style={{marginTop: '2rem'}}>
                <h3 className="sl-section-title">Helpful Articles & Documentation</h3>
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
              </div>
            )}
          </div>
        );

      case 'roadmap':
        return (
          <div className="sl-section-box sl-content-area">
            <div className="sl-roadmap-header">
              <h3 className="sl-section-title">
                <Map className="sl-search-icon" /> Interactive Learning Roadmap
              </h3>
              <div className="sl-progress-section">
                <div className="sl-progress-bar-outer">
                  <div className="sl-progress-bar-inner" style={{width: `${progressPercent}%`}}></div>
                </div>
                <span className="sl-progress-label">{progressPercent}% Complete ({completedCount}/{totalSteps} topics)</span>
              </div>
            </div>

            <div className="sl-custom-timeline">
              {parsedRoadmap.map((phase, idx) => {
                const PhaseIcon = PHASE_ICONS[idx % PHASE_ICONS.length];
                const phaseColor = PHASE_COLORS[idx % PHASE_COLORS.length];
                const isExpanded = expandedPhases[idx] !== false; // default expanded
                const phaseCompleted = phase.items.every(item => completedSteps.includes(`${idx}-${item}`));

                return (
                  <div key={idx} className={`sl-timeline-node ${phaseCompleted ? 'completed' : ''}`}>
                    <div className="sl-node-marker">
                      <div className="sl-node-dot" style={{
                        backgroundColor: phaseCompleted ? '#22c55e' : phaseColor,
                        boxShadow: `0 0 16px ${phaseCompleted ? '#22c55e' : phaseColor}40`
                      }}>
                        <PhaseIcon size={10} color="white" />
                      </div>
                      {idx < parsedRoadmap.length - 1 && <div className="sl-node-line"></div>}
                    </div>
                    <div className="sl-node-content">
                      <div className="sl-phase-header" onClick={() => togglePhaseExpand(idx)}>
                        <h4 className="sl-node-title" style={{color: phaseColor}}>{phase.title}</h4>
                        <div className="sl-phase-right">
                          <span className="sl-phase-count">
                            {phase.items.filter(item => completedSteps.includes(`${idx}-${item}`)).length}/{phase.items.length}
                          </span>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                      {isExpanded && phase.items.length > 0 && (
                        <ul className="sl-node-list interactive">
                          {phase.items.map((it, i) => {
                            const stepKey = `${idx}-${it}`;
                            const isDone = completedSteps.includes(stepKey);
                            return (
                              <li key={i}
                                className={`sl-step-item ${isDone ? 'done' : ''}`}
                                onClick={() => toggleStep(stepKey)}
                              >
                                {isDone ? <CheckSquare size={18} className="sl-check-icon done" /> : <Square size={18} className="sl-check-icon" />}
                                <span>{it}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {skill.roadmap_url && (
              <div className="sl-roadmap-footer">
                <p>An official interactive roadmap is available for this skill.</p>
                <a href={skill.roadmap_url} target="_blank" rel="noreferrer" className="sl-big-btn">
                  View Interactive Roadmap on roadmap.sh <ExternalLink size={18} />
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
            <div className="sl-course-grid">
              {skill.courses.map((course, idx) => (
                <a key={idx} href={course.url} target="_blank" rel="noreferrer" className="sl-course-card">
                  <div className="sl-course-header">
                    <span className={`sl-platform-badge ${course.platform.toLowerCase().replace(/\s/g, '')}`}>
                      {course.platform}
                    </span>
                    <ExternalLink size={16} color="var(--text-muted)" />
                  </div>
                  <h4 className="sl-course-title">{course.name}</h4>
                  <div className="sl-course-meta">
                    {course.rating && <span className="sl-course-rating">⭐ {course.rating}</span>}
                    {course.duration && <span className="sl-course-duration"><Clock size={14} /> {course.duration}</span>}
                  </div>
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
            <div className="sl-practice-grid">
              {skill.practice.map((prac, idx) => (
                <a key={idx} href={prac.url} target="_blank" rel="noreferrer" className="sl-practice-card">
                  <div className="sl-practice-icon">
                    <Code2 size={24} />
                  </div>
                  <h4 className="sl-practice-title">{prac.name}</h4>
                  {prac.difficulty && (
                    <span className={`sl-difficulty-tag ${prac.difficulty}`}>{prac.difficulty}</span>
                  )}
                  <ExternalLink size={16} className="sl-practice-link-icon" />
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
        <button onClick={() => navigate('/skill-libraries')} className="sl-back-btn">
          <ArrowLeft size={20} /> Back to Libraries
        </button>
        
        {/* Header Section */}
        <div className="sl-detail-header">
          <div>
            <div className="sl-card-badge" style={{display: 'inline-block', marginBottom: '1rem'}}>
              {skill.category}
            </div>
            <h1 className="sl-detail-title">{skill.name}</h1>
            {totalSteps > 0 && (
              <div className="sl-header-progress">
                <div className="sl-mini-progress-bar">
                  <div className="sl-mini-progress-fill" style={{width: `${progressPercent}%`}}></div>
                </div>
                <span className="sl-mini-progress-text">{progressPercent}% learned</span>
              </div>
            )}
          </div>
          <div>
            <SaveSkillButton skillId={skill.id} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sl-tabs">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'roadmap', label: 'Roadmap', icon: Map },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'practice', label: 'Practice', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sl-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {React.createElement(tab.icon, { size: 16 })}
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
