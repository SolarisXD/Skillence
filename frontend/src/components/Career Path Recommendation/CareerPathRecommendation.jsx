import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import ProgressBar, { PhaseProgressBar, DetailedProgressBar } from '../ProgressBar';
import './CareerPathRecommendation.css';

// SVG Icons
const AnalyzeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18,15 12,9 6,15"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

// Learning Plan SVG Icons
const BookOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6l2 2h10v14H2z"/>
    <path d="M8 21v-5h8v5"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
    <polyline points="17,6 23,6 23,12"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v15A2.5 2.5 0 0 0 9.5 22h5a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 14.5 2z"/>
    <path d="M9 9h6m-6 4h6"/>
  </svg>
);

const CertificateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
  </svg>
);

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16,18 22,12 16,6"/>
    <polyline points="8,6 2,12 8,18"/>
  </svg>
);

const ResourcesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15,3 21,3 21,9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const MLIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const CareerPathRecommendation = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileSummary, setProfileSummary] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [savingCareer, setSavingCareer] = useState(null);
  const [currentCareerPath, setCurrentCareerPath] = useState(null);
  const [learningPlan, setLearningPlan] = useState(null);
  const [loadingLearningPlan, setLoadingLearningPlan] = useState(false);
  const [collapsedPhases, setCollapsedPhases] = useState({ 1: true, 2: true, 3: true }); // Default collapsed
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [addingSkills, setAddingSkills] = useState(false);
  const [learnedSkills, setLearnedSkills] = useState(new Set());
  const [hasStartedRoadmap, setHasStartedRoadmap] = useState(false);

  const [mlRecommendations, setMlRecommendations] = useState(null);
  const [careerPathChanged, setCareerPathChanged] = useState(false);

  // Utility function to generate appropriate URLs for programming resources
  const getResourceUrl = (resourceName) => {
    const name = resourceName.toLowerCase();
    
    // Documentation and official sites
    if (name.includes('react')) return 'https://react.dev/';
    if (name.includes('javascript') || name.includes('js')) return 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';
    if (name.includes('typescript') || name.includes('ts')) return 'https://www.typescriptlang.org/docs/';
    if (name.includes('python')) return 'https://docs.python.org/3/';
    if (name.includes('node.js') || name.includes('nodejs')) return 'https://nodejs.org/en/docs/';
    if (name.includes('html')) return 'https://developer.mozilla.org/en-US/docs/Web/HTML';
    if (name.includes('css')) return 'https://developer.mozilla.org/en-US/docs/Web/CSS';
    if (name.includes('sql') || name.includes('database')) return 'https://www.w3schools.com/sql/';
    if (name.includes('git')) return 'https://git-scm.com/doc';
    if (name.includes('docker')) return 'https://docs.docker.com/';
    if (name.includes('kubernetes') || name.includes('k8s')) return 'https://kubernetes.io/docs/';
    if (name.includes('aws')) return 'https://docs.aws.amazon.com/';
    if (name.includes('azure')) return 'https://docs.microsoft.com/en-us/azure/';
    if (name.includes('mongodb')) return 'https://docs.mongodb.com/';
    if (name.includes('express')) return 'https://expressjs.com/';
    if (name.includes('vue')) return 'https://vuejs.org/guide/';
    if (name.includes('angular')) return 'https://angular.io/docs';
    if (name.includes('django')) return 'https://docs.djangoproject.com/';
    if (name.includes('flask')) return 'https://flask.palletsprojects.com/';
    if (name.includes('spring')) return 'https://spring.io/guides';
    if (name.includes('java')) return 'https://docs.oracle.com/en/java/';
    if (name.includes('c#') || name.includes('csharp')) return 'https://docs.microsoft.com/en-us/dotnet/csharp/';
    if (name.includes('go') || name.includes('golang')) return 'https://golang.org/doc/';
    if (name.includes('rust')) return 'https://doc.rust-lang.org/';
    if (name.includes('php')) return 'https://www.php.net/docs.php';
    if (name.includes('redis')) return 'https://redis.io/documentation';
    if (name.includes('postgresql') || name.includes('postgres')) return 'https://www.postgresql.org/docs/';
    if (name.includes('mysql')) return 'https://dev.mysql.com/doc/';
    if (name.includes('firebase')) return 'https://firebase.google.com/docs';
    if (name.includes('graphql')) return 'https://graphql.org/learn/';
    if (name.includes('api') || name.includes('rest')) return 'https://restfulapi.net/';
    if (name.includes('testing') || name.includes('jest')) return 'https://jestjs.io/docs/getting-started';
    if (name.includes('cypress')) return 'https://docs.cypress.io/';
    if (name.includes('webpack')) return 'https://webpack.js.org/concepts/';
    if (name.includes('vite')) return 'https://vitejs.dev/guide/';
    if (name.includes('tailwind')) return 'https://tailwindcss.com/docs';
    if (name.includes('bootstrap')) return 'https://getbootstrap.com/docs/';
    
    // Learning platforms for generic resources
    if (name.includes('course') || name.includes('tutorial')) return 'https://www.freecodecamp.org/';
    if (name.includes('book') || name.includes('reading')) return 'https://www.oreilly.com/';
    if (name.includes('practice') || name.includes('coding')) return 'https://leetcode.com/';
    if (name.includes('project') || name.includes('build')) return 'https://github.com/topics/beginner-project';
    
    // Default to a comprehensive programming resource
    return 'https://developer.mozilla.org/';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    // Load existing career path and roadmap progress on component mount
    loadCurrentCareerPath();
  }, [navigate]);

  const loadCurrentCareerPath = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/career-path/get-career-path', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.career_path) {
          setCurrentCareerPath(data.career_path);
          // Restore saved learning plan if it exists
          if (data.career_path.saved_learning_plan) {
            setLearningPlan(data.career_path.saved_learning_plan);
            setHasStartedRoadmap(true);
            if (data.career_path.saved_learning_plan.ml_skill_recommendations) {
              setMlRecommendations(data.career_path.saved_learning_plan.ml_skill_recommendations);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading career path:', err);
    }
  };

  const loadLearningPlan = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoadingLearningPlan(true);
    setHasStartedRoadmap(true);
    try {
      const response = await fetch('http://localhost:8000/api/career-path/learning-plan', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.learning_plan) {
          setLearningPlan(data.learning_plan);
          if (data.learning_plan.ml_skill_recommendations) {
            setMlRecommendations(data.learning_plan.ml_skill_recommendations);
          }
        }
      }
    } catch (err) {
      console.error('Error loading learning plan:', err);
    } finally {
      setLoadingLearningPlan(false);
    }
  };

  // Convert backend scores (0-1 range) to percentage (0-100)
  const convertToPercentage = (score) => {
    return Math.max(5, Math.min(100, score * 100)); // Ensure minimum 5% and maximum 100%
  };

  const analyzeCareerPath = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please log in to analyze your career path');
      return;
    }

    setLoading(true);
    setError('');
    
    // Clear both learning plan AND current career path when discovering new opportunities
    setLearningPlan(null);
    setCurrentCareerPath(null);
    setCollapsedPhases({ 1: true, 2: true, 3: true }); // Reset to collapsed state
    
    try {
      const response = await fetch('http://localhost:8000/api/career-path/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const topRecommendations = (data.recommendations || []).slice(0, 5);
        setRecommendations(topRecommendations);
        setProfileSummary(data.profile_summary || '');
        setHasAnalyzed(true);
        
        // Log for debugging - check if recommendations show updated scores
        console.log('Career recommendations loaded:', topRecommendations.map(r => ({
          title: r.title,
          score: (r.score * 100).toFixed(1) + '%'
        })));
      } else {
        setError(data.message || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Career analysis error:', err);
      setError('Failed to analyze career path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveCareerPath = async (career) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSavingCareer(career.occupation_code);
    
    try {
      const response = await fetch('http://localhost:8000/api/career-path/save-career-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          occupation_code: career.occupation_code,
          title: career.title,
          score: career.score,
          explanation: career.explanation || `This role matches your skills with a ${convertToPercentage(career.score).toFixed(1)}% compatibility rating.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentCareerPath(data.career_path);
          // Hide the current recommendations when a career is selected
          setHasAnalyzed(false);
          setExpandedCard(null);
          // Load learning plan for the newly selected career
          loadLearningPlan();
        }
      }
    } catch (err) {
      console.error('Error saving career path:', err);
    } finally {
      setSavingCareer(null);
    }
  };

  const toggleCardExpansion = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const togglePhaseCollapse = (phaseNumber) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseNumber]: !prev[phaseNumber]
    }));
  };

  const addLearnedSkill = async (skill) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Mark skill as learned immediately for UI feedback
    setLearnedSkills(prev => new Set([...prev, skill]));

    try {
      const response = await fetch('http://localhost:8000/api/career-path/add-learned-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skills_to_add: [skill],
          skill_category: "technical"
        })
      });

      if (response.ok) {
        console.log('Skill added successfully');
        // Auto-refresh both the learning plan AND career recommendations to show updated compatibility scores
        setTimeout(() => {
          loadLearningPlan();
          // If user has already discovered opportunities, refresh recommendations to show updated compatibility
          if (hasAnalyzed && recommendations.length > 0) {
            console.log('Refreshing career recommendations after skill addition...');
            analyzeCareerPath();
          }
        }, 1000); // Small delay to ensure backend processing is complete
      } else {
        // Revert the UI change if the API call failed
        setLearnedSkills(prev => {
          const newSet = new Set(prev);
          newSet.delete(skill);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      // Revert the UI change if the API call failed
      setLearnedSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skill);
        return newSet;
      });
    }
  };

  const regenerateLearningPlan = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setRegeneratingPlan(true);
    // Reset to collapsed state when regenerating
    setCollapsedPhases({ 1: true, 2: true, 3: true });
    try {
      const response = await fetch('http://localhost:8000/api/career-path/regenerate-learning-plan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.learning_plan) {
          setLearningPlan(data.learning_plan);
          if (data.learning_plan.ml_skill_recommendations) {
            setMlRecommendations(data.learning_plan.ml_skill_recommendations);
          }
        }
      }
    } catch (err) {
      console.error('Error regenerating learning plan:', err);
    } finally {
      setRegeneratingPlan(false);
    }
  };

  return (
    <div className="career-path-page">
      <Navbar />
      
      {/* Hero Section with Background Animation */}
      <div className="career-path-hero">
        {/* Animated Background */}
        <div className="reflection-bg">
          {/* Animated Floating Shapes */}
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>
          
          {/* Animated Gradient Beams */}
          <div className="gradient-beam beam-1"></div>
          <div className="gradient-beam beam-2"></div>
          <div className="gradient-beam beam-3"></div>
          
          {/* Particle Effects */}
          <div className="particle-field">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        
        {/* Header Content */}
        <div className="career-path-header">
          <h1 className="career-path-title">
            Career Path{' '}
            <span style={{
              background: 'var(--accent-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Intelligence
            </span>
          </h1>
          <p className="career-path-subtitle">
            Leverage advanced analytics to discover your most suitable career opportunities based on your professional profile and skill portfolio.
          </p>
        </div>
      </div>
      
      <div className="career-path-container">

        {/* Action Section */}
        <div className="analyze-section">
          <button 
            className="analyze-button" 
            onClick={analyzeCareerPath}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Analyzing Profile...
              </>
            ) : (
              <>
                <AnalyzeIcon />
                Discover Career Opportunities
              </>
            )}
          </button>
          <p className="analyze-description">
            Fetch your profile data and receive personalized career recommendations powered by industry analysis.
          </p>
        </div>

        {/* Current Career Path Display */}
        {currentCareerPath && (
          <div className="current-career-path">
            <h3 className="current-career-title">Your Selected Career Path</h3>
            <div className="current-career-card">
              <div className="current-career-info">
                <h4>{currentCareerPath.title}</h4>
                <p className="compatibility-score">
                  {convertToPercentage(currentCareerPath.score).toFixed(1)}% Compatible
                </p>
                <p className="career-explanation">{currentCareerPath.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Learning Plan Section */}
        {currentCareerPath && (
          <div className="learning-plan-section">

            
            <div className="learning-plan-header">
              <div className="header-content">
                <BrainIcon />
                <div className="header-text">
                  <h2 className="learning-plan-title">
                    Personalized Learning Plan
                    {learningPlan?.ml_powered && (
                      <span className="ml-powered-badge">ML Enhanced</span>
                    )}
                  </h2>
                  <p className="learning-plan-subtitle">
                    Tailored roadmap to bridge skill gaps and achieve your career goals
                  </p>
                </div>
                {learningPlan && (
                  <button 
                    className="regenerate-button"
                    onClick={regenerateLearningPlan}
                    disabled={regeneratingPlan}
                  >
                    {regeneratingPlan ? (
                      <>
                        <LoadingSpinner />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        ⟳ Regenerate Plan
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {!hasStartedRoadmap && !learningPlan ? (
              <div className="start-roadmap-section">
                <div className="start-roadmap-content">
                  <h3>Ready to Begin Your Learning Journey?</h3>
                  <p>Generate a personalized learning roadmap tailored to your career goals and current skills. Our AI will analyze your profile and create a step-by-step plan to help you reach your target role.</p>
                  <button
                    className="simple-start-button"
                    onClick={loadLearningPlan}
                    disabled={loadingLearningPlan}
                  >
                    {loadingLearningPlan ? (
                      <>
                        <LoadingSpinner />
                        Generating...
                      </>
                    ) : (
                      'Generate Learning Roadmap'
                    )}
                  </button>
                </div>
              </div>
            ) : careerPathChanged ? (
              <div className="career-changed-banner">
                <div className="career-changed-content">
                  <h3>Career Path Updated</h3>
                  <p>Your career path has changed since your last roadmap was generated. Generate a new roadmap aligned with your updated career goals.</p>
                  <button
                    className="simple-start-button"
                    onClick={() => { setCareerPathChanged(false); loadLearningPlan(); }}
                    disabled={loadingLearningPlan}
                  >
                    {loadingLearningPlan ? (
                      <>
                        <LoadingSpinner />
                        Generating...
                      </>
                    ) : (
                      'Generate New Roadmap'
                    )}
                  </button>
                </div>
              </div>
            ) : loadingLearningPlan ? (
              <div className="learning-plan-loading">
                <LoadingSpinner />
                <p>Analyzing your profile and generating personalized learning roadmap...</p>
              </div>
            ) : learningPlan ? (
              <>
                {/* Learning Plan Display */}
                <div className="skill-gap-analysis">
                  <div className="section-header">
                    <TargetIcon />
                    <h3>Skill Gap Analysis</h3>
                  </div>
                  
                  <div className="skill-analysis-grid">
                    <div className="skill-summary-card">
                      <div className="summary-stat">
                        <span className="stat-number">{learningPlan.skill_analysis?.total_gaps || 0}</span>
                        <span className="stat-label">Skills to Develop</span>
                      </div>
                    </div>
                    
                    <div className="skill-summary-card">
                      <div className="summary-stat">
                        <span className="stat-number">{learningPlan.skill_analysis?.strengths_count || 0}</span>
                        <span className="stat-label">Current Strengths</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Skills */}
                  {learningPlan.skill_analysis?.priority_skills && learningPlan.skill_analysis.priority_skills.length > 0 && (
                    <div className="priority-skills">
                      <h4>High Priority Skills to Develop</h4>
                      <div className="gamified-skills-grid">
                        {learningPlan.skill_analysis.priority_skills.map((skill, index) => (
                          <div key={index} className="gamified-skill-card">
                            <div className="skill-content">
                              <div className="skill-info">
                                <span className="skill-name">
                                  {skill.skill || skill.technology}
                                </span>
                                <div className="skill-badges">
                                  <span className={`priority-badge priority-${skill.priority}`}>
                                    {skill.priority}
                                  </span>
                                </div>
                              </div>
                              {skill.reason && (
                                <p className="skill-reason">{skill.reason}</p>
                              )}
                              <button 
                                className={`add-skill-button ${learnedSkills.has(skill.skill || skill.technology) ? 'learned' : ''}`}
                                onClick={() => addLearnedSkill(skill.skill || skill.technology)}
                                disabled={learnedSkills.has(skill.skill || skill.technology)}
                              >
                                {learnedSkills.has(skill.skill || skill.technology) ? (
                                  <>
                                    <CheckIcon />
                                    Learned
                                  </>
                                ) : (
                                  '+ Mark as Learned'
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {learningPlan.skill_gaps?.strengths && learningPlan.skill_gaps.strengths.length > 0 && (
                    <div className="current-strengths">
                      <h4>Your Current Strengths</h4>
                      <div className="strengths-grid">
                        {learningPlan.skill_gaps.strengths.slice(0, 6).map((strength, index) => (
                          <div key={index} className="strength-card">
                            <CheckIcon />
                            <span>{strength.technology || strength.skill || strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Learning Roadmap */}
                <div className="learning-roadmap">
                  <div className="section-header">
                    <ClockIcon />
                    <h3>Learning Roadmap</h3>
                    <span className="timeline-duration">{learningPlan.learning_roadmap?.total_duration || '12 months'}</span>
                  </div>

                  <div className="roadmap-phases">
                    {learningPlan.learning_roadmap?.phases?.map((phase, index) => (
                      <div key={index} className="phase-card">
                        <div className="phase-header" onClick={() => togglePhaseCollapse(phase.phase_number)}>
                          <div className="phase-number">{phase.phase_number}</div>
                          <div className="phase-info">
                            <h4 className="phase-title">{phase.title}</h4>
                            <p className="phase-duration">{phase.duration}</p>
                          </div>
                          <div className="phase-toggle">
                            {collapsedPhases[phase.phase_number] ? <ChevronDownIcon /> : <ChevronUpIcon />}
                          </div>
                        </div>
                        
                        {!collapsedPhases[phase.phase_number] && (
                          <div className="phase-content">
                            <p className="phase-description">{phase.description}</p>

                            {/* Skills to Learn */}
                            {phase.skills_to_learn && phase.skills_to_learn.length > 0 && (
                              <div className="phase-skills">
                                <h5>◆ Skills Focus</h5>
                                <div className="gamified-phase-skills">
                                  {phase.skills_to_learn.map((skill, skillIdx) => (
                                    <div key={skillIdx} className="gamified-skill-box">
                                      <span className="skill-text">{skill.skill || skill.technology || skill}</span>
                                      <div className="skill-progress-ring"></div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                        {/* Learning Resources */}
                        {phase.learning_resources && phase.learning_resources.length > 0 && (
                          <div className="phase-resources">
                            <h5>Recommended Resources</h5>
                            <div className="resources-list">
                              {phase.learning_resources.slice(0, 3).map((resource, resIdx) => (
                                <div
                                  key={resIdx}
                                  className="resource-item"
                                >
                                  {resource.type === 'course' && <BookOpenIcon />}
                                  {resource.type === 'certification' && <CertificateIcon />}
                                  {resource.type === 'project' && <CodeIcon />}
                                  {!['course', 'certification', 'project'].includes(resource.type) && <ResourcesIcon />}
                                  <div className="resource-info">
                                    <span className="resource-title">{resource.title}</span>
                                    <span className="resource-meta">
                                      {resource.provider || resource.platform} • {resource.duration}
                                    </span>
                                  </div>
                                  <a
                                    href={resource.url || getResourceUrl(resource.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="resource-link-button"
                                    title="Open resource"
                                  >
                                    <ExternalLinkIcon />
                                    <span>Open</span>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                            {/* Milestones */}
                            {phase.milestones && phase.milestones.length > 0 && (
                              <div className="phase-milestones">
                                <h5>◆ Key Milestones</h5>
                                <ul className="milestones-list">
                                  {phase.milestones.map((milestone, milIdx) => (
                                    <li key={milIdx} className="milestone-item">
                                      <TargetIcon />
                                      {milestone}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="learning-plan-error">
                <p>Unable to generate learning plan. Please try refreshing the page.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <div className="loading-animation">
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
              <p className="loading-text">Processing your professional profile and matching against career database...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <h4>Analysis Unavailable</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasAnalyzed && recommendations.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">Top 5 Career Matches</h2>
              <p className="results-description">
                Based on comprehensive analysis of your skills, experience, and industry trends.
              </p>
            </div>
            
            <div className="recommendations-grid">
              {recommendations.map((rec, index) => (
                <div key={rec.occupation_code} className="recommendation-card">
                  <div className="card-header">
                    <div className="card-rank">#{index + 1}</div>
                    <h3 className="card-title">{rec.title}</h3>
                  </div>
                  
                  <div className="compatibility-section">
                    <div className="compatibility-label">
                      <span>Compatibility Score</span>
                      <span className="compatibility-percentage">
                        {convertToPercentage(rec.score).toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${convertToPercentage(rec.score)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="expand-button"
                      onClick={() => toggleCardExpansion(index)}
                    >
                      <span>View Details</span>
                      {expandedCard === index ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  </div>

                  {expandedCard === index && (
                    <div className="card-details">
                      <div className="details-content">
                        <div className="match-analysis">
                          <h4>Match Analysis</h4>
                          <p className="match-explanation">
                            Based on your profile analysis, this role matches {rec.hot_tech_matches?.length || 0} high-demand 
                            technologies and {rec.regular_tech_matches?.length || 0} additional technical skills from your portfolio. 
                            Overall compatibility: {convertToPercentage(rec.score).toFixed(1)}%
                          </p>
                        </div>

                        {rec.hot_tech_matches && rec.hot_tech_matches.length > 0 && (
                          <div className="skills-section">
                            <h5>High-Demand Technologies</h5>
                            <div className="skills-list">
                              {rec.hot_tech_matches.map((skill, idx) => (
                                <span key={idx} className="skill-tag hot-tech">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.regular_tech_matches && rec.regular_tech_matches.length > 0 && (
                          <div className="skills-section">
                            <h5>Technical Competencies</h5>
                            <div className="skills-list">
                              {rec.regular_tech_matches.map((skill, idx) => (
                                <span key={idx} className="skill-tag regular-tech">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="select-career-section">
                          <button 
                            className="select-career-button"
                            onClick={() => saveCareerPath(rec)}
                            disabled={savingCareer === rec.occupation_code}
                          >
                            {savingCareer === rec.occupation_code ? (
                              <>
                                <LoadingSpinner />
                                Saving Selection...
                              </>
                            ) : currentCareerPath?.occupation_code === rec.occupation_code ? (
                              <>
                                <CheckIcon />
                                Currently Selected
                              </>
                            ) : (
                              'Select This Career Path'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPathRecommendation;
