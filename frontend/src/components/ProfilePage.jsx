import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfileData(data.profile.profile_data);
      } else {
        setProfileData(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderContactInfo = () => {
    const contact = profileData?.personalInfo || profileData?.contact_info;
    if (!contact) return null;

    return (
      <div className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">👤</span>
          Contact Information
        </h3>
        <div className="contact-grid">
          {contact.fullName && (
            <div className="contact-item">
              <span className="contact-label">Name:</span>
              <span className="contact-value">{contact.fullName}</span>
            </div>
          )}
          {contact.email && (
            <div className="contact-item">
              <span className="contact-label">Email:</span>
              <span className="contact-value">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="contact-item">
              <span className="contact-label">Phone:</span>
              <span className="contact-value">{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="contact-item">
              <span className="contact-label">Location:</span>
              <span className="contact-value">{contact.location}</span>
            </div>
          )}
          {contact.website && (
            <div className="contact-item">
              <span className="contact-label">Website:</span>
              <span className="contact-value">
                <a href={contact.website} target="_blank" rel="noopener noreferrer">
                  {contact.website}
                </a>
              </span>
            </div>
          )}
          {contact.linkedin && (
            <div className="contact-item">
              <span className="contact-label">LinkedIn:</span>
              <span className="contact-value">
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                  {contact.linkedin}
                </a>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCareerSummary = () => {
    const summary = profileData?.careerOverview?.summary || profileData?.careerSummary;
    if (!summary) return null;

    return (
      <div className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">📝</span>
          Career Summary
        </h3>
        <div className="summary-content">
          <p>{summary}</p>
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    const experience = profileData?.workExperience || profileData?.experience;
    if (!experience || experience.length === 0) return null;

    return (
      <div className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">💼</span>
          Work Experience
        </h3>
        <div className="experience-list">
          {experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <h4 className="job-title">{exp.position || exp.title}</h4>
                <span className="job-duration">{exp.duration}</span>
              </div>
              <div className="company-info">
                <span className="company-name">{exp.company}</span>
                {exp.location && <span className="job-location">• {exp.location}</span>}
              </div>
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="responsibilities">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    const education = profileData?.education;
    if (!education || education.length === 0) return null;

    return (
      <div className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">🎓</span>
          Education
        </h3>
        <div className="education-list">
          {education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <h4 className="degree">{edu.degree}</h4>
                <span className="education-year">{edu.year}</span>
              </div>
              <div className="institution-info">
                <span className="institution">{edu.institution}</span>
                {edu.location && <span className="edu-location">• {edu.location}</span>}
              </div>
              {edu.gpa && (
                <div className="gpa-info">
                  <span>GPA: {edu.gpa}</span>
                </div>
              )}
              {edu.details && (
                <div className="education-details">
                  <p>{edu.details}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const skills = profileData?.skills;
    if (!skills) return null;

    return (
      <div className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">🛠️</span>
          Skills
        </h3>
        <div className="skills-container">
          {skills.technical && skills.technical.length > 0 && (
            <div className="skill-category">
              <h4 className="skill-category-title">Technical Skills</h4>
              <div className="skill-tags">
                {skills.technical.map((skill, index) => (
                  <span key={index} className="skill-tag technical">{skill}</span>
                ))}
              </div>
            </div>
          )}
          {skills.soft && skills.soft.length > 0 && (
            <div className="skill-category">
              <h4 className="skill-category-title">Soft Skills</h4>
              <div className="skill-tags">
                {skills.soft.map((skill, index) => (
                  <span key={index} className="skill-tag soft">{skill}</span>
                ))}
              </div>
            </div>
          )}
          {skills.languages && skills.languages.length > 0 && (
            <div className="skill-category">
              <h4 className="skill-category-title">Languages</h4>
              <div className="skill-tags">
                {skills.languages.map((skill, index) => (
                  <span key={index} className="skill-tag language">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const projects = profileData?.projects;
    if (!projects || projects.length === 0) return null;

    return (
      <div className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">🚀</span>
          Projects
        </h3>
        <div className="projects-list">
          {projects.map((project, index) => (
            <div key={index} className="project-item">
              <div className="project-header">
                <h4 className="project-title">{project.name}</h4>
                {project.duration && <span className="project-duration">{project.duration}</span>}
              </div>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="project-technologies">
                  <span className="tech-label">Technologies:</span>
                  <div className="tech-tags">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
              {(project.url || project.github_url) && (
                <div className="project-links">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                      🔗 Live Demo
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="project-link">
                      💻 GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    const certifications = profileData?.certifications;
    if (!certifications || certifications.length === 0) return null;

    return (
      <div className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">🏆</span>
          Certifications
        </h3>
        <div className="certifications-list">
          {certifications.map((cert, index) => (
            <div key={index} className="certification-item">
              <div className="cert-header">
                <h4 className="cert-name">{cert.name}</h4>
                {cert.date && <span className="cert-date">{formatDate(cert.date)}</span>}
              </div>
              {cert.issuer && <div className="cert-issuer">Issued by: {cert.issuer}</div>}
              {cert.id && <div className="cert-id">Credential ID: {cert.id}</div>}
              {cert.url && (
                <div className="cert-link">
                  <a href={cert.url} target="_blank" rel="noopener noreferrer">
                    🔗 View Certificate
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSections = () => {
    const customSections = profileData?.customSections;
    if (!customSections || Object.keys(customSections).length === 0) return null;

    return Object.entries(customSections).map(([sectionName, sectionData]) => (
      <div key={sectionName} className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">📋</span>
          {sectionName}
        </h3>
        <div className="custom-section-content">
          {typeof sectionData === 'string' ? (
            <p>{sectionData}</p>
          ) : Array.isArray(sectionData) ? (
            <ul>
              {sectionData.map((item, idx) => (
                <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
              ))}
            </ul>
          ) : (
            <pre>{JSON.stringify(sectionData, null, 2)}</pre>
          )}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="profile-container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your profile...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="profile-container">
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <h3>Error Loading Profile</h3>
              <p>{error}</p>
              <button onClick={fetchProfileData} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profileData) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="profile-container">
            <div className="empty-state">
              <span className="empty-icon">📄</span>
              <h3>No Profile Data Found</h3>
              <p>You haven't created a profile yet. Upload a resume or create one manually to get started.</p>
              <button 
                onClick={() => navigate('/dashboard/resume')} 
                className="create-profile-button"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1 className="profile-title">My Profile</h1>
            <button 
              onClick={() => navigate('/dashboard/resume')} 
              className="edit-profile-button"
            >
              ✏️ Edit Profile
            </button>
          </div>

          <div className="profile-content">
            {renderContactInfo()}
            {renderCareerSummary()}
            {renderExperience()}
            {renderEducation()}
            {renderSkills()}
            {renderProjects()}
            {renderCertifications()}
            {renderCustomSections()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
