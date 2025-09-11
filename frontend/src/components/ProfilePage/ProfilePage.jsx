import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import { 
  UserIcon, 
  BriefcaseIcon, 
  GraduationIcon,
  SkillsIcon,
  ProjectIcon,
  CertificateIcon,
  TargetIcon,
  DocumentIcon,
  EditIcon,
  PlusIcon
} from '../Icons/ProfessionalIcons';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Helper function to clean up URLs (remove localhost prefix if present)
  const cleanUrl = (url) => {
    if (!url) return url;
    // Remove localhost prefixes that might have been added incorrectly
    return url.replace(/^http:\/\/localhost:\d+\//, '').replace(/^https:\/\/localhost:\d+\//, '');
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/');
        return;
      }

      // First verify the token is valid and get current user info
      const authResponse = await fetch('http://localhost:8000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!authResponse.ok) {
        // Token is invalid, clear it and redirect
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      const authData = await authResponse.json();
      console.log('Current authenticated user:', authData.email);

      // Now fetch the profile
      const response = await fetch('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, clear token and redirect
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.profile) {
        console.log('Loaded profile for user:', data.profile.user_email || 'unknown');
        setProfileData(data.profile.profile_data);
      } else {
        setProfileData(null);
        setError('No profile data found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
      // If there's a network error or other issue, don't auto-redirect
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

  const handleEditSection = (sectionName, data) => {
    setEditingSection(sectionName);
    
    // Special handling for skills to ensure they're in the right format
    if (sectionName === 'skills' && data) {
      const processedSkills = {
        technical: Array.isArray(data.technical) ? data.technical : [],
        soft: Array.isArray(data.soft) ? data.soft : [],
        tools: Array.isArray(data.tools) ? data.tools : [],
        languages: Array.isArray(data.languages) ? data.languages : []
      };
      setEditData(processedSkills);
    } else {
      setEditData(data);
    }
    
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditData({});
    // Do not exit major edit mode here
  };

  const handleSaveSection = async (sectionName, updatedData) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updatedProfile = {
        ...profileData,
        [sectionName]: updatedData
      };

      const response = await fetch('http://localhost:8000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile_data: updatedProfile })
      });

      if (response.ok) {
        setProfileData(updatedProfile);
        setEditingSection(null);
        setEditData({});
        // Do not exit major edit mode here
      } else {
        throw new Error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderContactInfo = () => {
    const contact = profileData?.personalInfo || profileData?.contact_info;
    if (!contact) return null;

    const isEditing = editMode && editingSection === 'contact_info';

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">
              <UserIcon size={20} />
            </span>
            Contact Information
          </h3>
          {editMode && !isEditing && (
            <button 
              className="edit-section-button"
              onClick={() => handleEditSection('contact_info', contact)}
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-section-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editData.fullName || editData.name || ''}
                  onChange={(e) => setEditData({...editData, fullName: e.target.value, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editData.location || ''}
                  onChange={(e) => setEditData({...editData, location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={editData.website || ''}
                  onChange={(e) => setEditData({...editData, website: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={editData.linkedin || ''}
                  onChange={(e) => setEditData({...editData, linkedin: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="url"
                  value={editData.github || ''}
                  onChange={(e) => setEditData({...editData, github: e.target.value})}
                />
              </div>
            </div>
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={() => handleSaveSection('contact_info', editData)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="contact-grid">
            {(contact.fullName || contact.name) && (
              <div className="contact-item">
                <span className="contact-label">Name:</span>
                <span className="contact-value">{contact.fullName || contact.name}</span>
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
                  <a href={cleanUrl(contact.website)} target="_blank" rel="noopener noreferrer">
                    {cleanUrl(contact.website)}
                  </a>
                </span>
              </div>
            )}
            {contact.linkedin && (
              <div className="contact-item">
                <span className="contact-label">LinkedIn:</span>
                <span className="contact-value">
                  <a href={cleanUrl(contact.linkedin)} target="_blank" rel="noopener noreferrer">
                    {cleanUrl(contact.linkedin)}
                  </a>
                </span>
              </div>
            )}
            {contact.github && (
              <div className="contact-item">
                <span className="contact-label">GitHub:</span>
                <span className="contact-value">
                  <a href={cleanUrl(contact.github)} target="_blank" rel="noopener noreferrer">
                    {cleanUrl(contact.github)}
                  </a>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderExperience = () => {
    const experience = profileData?.workExperience || profileData?.experience;
    if (!experience || experience.length === 0) return null;

    const isEditing = editMode && editingSection === 'experience';

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">
              <BriefcaseIcon size={20} />
            </span>
            Work Experience
          </h3>
          {editMode && !isEditing && (
            <button 
              className="edit-section-button"
              onClick={() => handleEditSection('experience', experience)}
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-section-form">
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={() => handleSaveSection('experience', editData)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
            <p className="edit-note">Experience editing requires advanced form handling. Please use the dashboard for detailed editing.</p>
          </div>
        ) : (
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
        )}
      </div>
    );
  };

  const renderEducation = () => {
    const education = profileData?.education;
    if (!education || education.length === 0) return null;

    const isEditing = editMode && editingSection === 'education';

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">
              <GraduationIcon size={20} />
            </span>
            Education
          </h3>
          {editMode && !isEditing && (
            <button 
              className="edit-section-button"
              onClick={() => handleEditSection('education', education)}
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-section-form">
            {(editData || []).map((edu, index) => (
              <div key={index} className="education-edit-item">
                <h4>Education {index + 1}</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const newEducation = [...editData];
                        newEducation[index].degree = e.target.value;
                        setEditData(newEducation);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      value={edu.specialization || ''}
                      onChange={(e) => {
                        const newEducation = [...editData];
                        newEducation[index].specialization = e.target.value;
                        setEditData(newEducation);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>University/Institution</label>
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => {
                        const newEducation = [...editData];
                        newEducation[index].institution = e.target.value;
                        setEditData(newEducation);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={edu.year || edu.duration || ''}
                      onChange={(e) => {
                        const newEducation = [...editData];
                        newEducation[index].year = e.target.value;
                        newEducation[index].duration = e.target.value;
                        setEditData(newEducation);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => {
                        const newEducation = [...editData];
                        newEducation[index].location = e.target.value;
                        setEditData(newEducation);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>GPA</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => {
                        const newEducation = [...editData];
                        newEducation[index].gpa = e.target.value;
                        setEditData(newEducation);
                      }}
                    />
                  </div>
                </div>
                <button 
                  className="remove-item-button"
                  onClick={() => {
                    const newEducation = editData.filter((_, i) => i !== index);
                    setEditData(newEducation);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="profile-add-action-btn"
              onClick={() => {
                setEditData([...editData, { degree: '', institution: '', year: '', location: '', gpa: '', specialization: '' }]);
              }}
            >
              <PlusIcon size={16} />
              <span>Add Education</span>
            </button>
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={() => handleSaveSection('education', editData)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="education-list">
            {education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="education-header">
                  <h4 className="degree">{edu.degree}</h4>
                  <span className="education-year">{edu.year || edu.duration}</span>
                </div>
                <div className="institution-info">
                  <span className="institution">{edu.institution}</span>
                  {edu.location && <span className="edu-location">• {edu.location}</span>}
                </div>
                {edu.specialization && (
                  <div className="specialization-info">
                    <span>Specialization: {edu.specialization}</span>
                  </div>
                )}
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
        )}
      </div>
    );
  };

  const renderSkills = () => {
    const skills = profileData?.skills;
    if (!skills) return null;

    const isEditing = editMode && editingSection === 'skills';

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">
              <SkillsIcon size={20} />
            </span>
            Skills
          </h3>
          {editMode && !isEditing && (
            <button 
              className="edit-section-button"
              onClick={() => handleEditSection('skills', skills)}
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-section-form">
            <div className="form-group">
              <label>Technical Skills</label>
              <textarea
                value={(editData.technical || []).join(', ')}
                onChange={(e) => setEditData({
                  ...editData, 
                  technical: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                })}
                placeholder="Enter technical skills separated by commas"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Soft Skills</label>
              <textarea
                value={(editData.soft || []).join(', ')}
                onChange={(e) => setEditData({
                  ...editData, 
                  soft: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                })}
                placeholder="Enter soft skills separated by commas"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Tools & Platforms</label>
              <textarea
                value={(editData.tools || []).join(', ')}
                onChange={(e) => setEditData({
                  ...editData, 
                  tools: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                })}
                placeholder="Enter tools and platforms separated by commas"
                rows="3"
              />
            </div>
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={() => handleSaveSection('skills', editData)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
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
          {skills.tools && skills.tools.length > 0 && (
            <div className="skill-category">
              <h4 className="skill-category-title">Tools & Platforms</h4>
              <div className="skill-tags">
                {skills.tools.map((skill, index) => (
                  <span key={index} className="skill-tag tools">{skill}</span>
                ))}
              </div>
            </div>
          )}
          {/* Languages removed for uploaded/parsing-generated profiles per requirements */}
        </div>
        )}
      </div>
    );
  };

  const renderProjects = () => {
    const projects = profileData?.projects;
    if (!projects || projects.length === 0) return null;

    const isEditing = editMode && editingSection === 'projects';

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">
              <ProjectIcon size={20} />
            </span>
            Projects
          </h3>
          {editMode && !isEditing && (
            <button 
              className="edit-section-button"
              onClick={() => handleEditSection('projects', projects)}
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-section-form">
            {(editData || []).map((project, index) => (
              <div key={index} className="project-edit-item">
                <h4>Project {index + 1}</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={project.name || project.title || ''}
                      onChange={(e) => {
                        const newProjects = [...editData];
                        newProjects[index].name = e.target.value;
                        newProjects[index].title = e.target.value;
                        setEditData(newProjects);
                      }}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={project.description || ''}
                      onChange={(e) => {
                        const newProjects = [...editData];
                        newProjects[index].description = e.target.value;
                        setEditData(newProjects);
                      }}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Technologies Used</label>
                    <textarea
                      value={(project.technologies || []).join(', ')}
                      onChange={(e) => {
                        const newProjects = [...editData];
                        newProjects[index].technologies = e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech);
                        setEditData(newProjects);
                      }}
                      placeholder="Enter technologies separated by commas"
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Achievements</label>
                    <textarea
                      value={project.achievements || ''}
                      onChange={(e) => {
                        const newProjects = [...editData];
                        newProjects[index].achievements = e.target.value;
                        setEditData(newProjects);
                      }}
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Project URL</label>
                    <input
                      type="url"
                      value={project.url || project.link || ''}
                      onChange={(e) => {
                        const newProjects = [...editData];
                        newProjects[index].url = e.target.value;
                        newProjects[index].link = e.target.value;
                        setEditData(newProjects);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      value={project.github_url || ''}
                      onChange={(e) => {
                        const newProjects = [...editData];
                        newProjects[index].github_url = e.target.value;
                        setEditData(newProjects);
                      }}
                    />
                  </div>
                </div>
                <button 
                  className="remove-item-button"
                  onClick={() => {
                    const newProjects = editData.filter((_, i) => i !== index);
                    setEditData(newProjects);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="profile-add-action-btn"
              onClick={() => {
                setEditData([...editData, { name: '', description: '', technologies: [], achievements: '', url: '', github_url: '' }]);
              }}
            >
              <PlusIcon size={16} />
              <span>Add Project</span>
            </button>
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={() => handleSaveSection('projects', editData)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="project-header">
                  <h4 className="project-title">{project.name || project.title}</h4>
                  {project.duration && <span className="project-duration">{project.duration}</span>}
                </div>
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                {project.achievements && (
                  <p className="project-achievements"><strong>Achievements:</strong> {project.achievements}</p>
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
                {(project.url || project.github_url || project.link) && (
                  <div className="project-links">
                    {(project.url || project.link) && (
                      <a href={project.url || project.link} target="_blank" rel="noopener noreferrer" className="project-link">
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
        )}
      </div>
    );
  };

  const renderCertifications = () => {
    const certifications = profileData?.certifications;
    if (!certifications || certifications.length === 0) return null;

    const isEditing = editMode && editingSection === 'certifications';

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">
              <CertificateIcon size={20} />
            </span>
            Certifications
          </h3>
          {editMode && !isEditing && (
            <button 
              className="edit-section-button"
              onClick={() => handleEditSection('certifications', certifications)}
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-section-form">
            {(editData || []).map((cert, index) => (
              <div key={index} className="certification-edit-item">
                <h4>Certification {index + 1}</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Certification Name</label>
                    <input
                      type="text"
                      value={cert.name || ''}
                      onChange={(e) => {
                        const newCertifications = [...editData];
                        newCertifications[index].name = e.target.value;
                        setEditData(newCertifications);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      value={cert.issuer || ''}
                      onChange={(e) => {
                        const newCertifications = [...editData];
                        newCertifications[index].issuer = e.target.value;
                        setEditData(newCertifications);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Earned</label>
                    <input
                      type="date"
                      value={cert.date || ''}
                      onChange={(e) => {
                        const newCertifications = [...editData];
                        newCertifications[index].date = e.target.value;
                        setEditData(newCertifications);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Credential ID</label>
                    <input
                      type="text"
                      value={cert.id || ''}
                      onChange={(e) => {
                        const newCertifications = [...editData];
                        newCertifications[index].id = e.target.value;
                        setEditData(newCertifications);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Certificate URL</label>
                    <input
                      type="url"
                      value={cert.url || ''}
                      onChange={(e) => {
                        const newCertifications = [...editData];
                        newCertifications[index].url = e.target.value;
                        setEditData(newCertifications);
                      }}
                    />
                  </div>
                </div>
                <button 
                  className="remove-item-button"
                  onClick={() => {
                    const newCertifications = editData.filter((_, i) => i !== index);
                    setEditData(newCertifications);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="profile-add-action-btn"
              onClick={() => {
                setEditData([...editData, { name: '', issuer: '', date: '', id: '', url: '' }]);
              }}
            >
              <PlusIcon size={16} />
              <span>Add Certification</span>
            </button>
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={() => handleSaveSection('certifications', editData)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    );
  };

  const renderAchievements = () => {
    const achievements = profileData?.achievements;
    if (!achievements || achievements.length === 0) return null;

    const isEditing = editMode && editingSection === 'achievements';

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">
              <TargetIcon size={20} />
            </span>
            Achievements
          </h3>
          {editMode && !isEditing && (
            <button 
              className="edit-section-button"
              onClick={() => handleEditSection('achievements', achievements)}
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-section-form">
            {(editData || []).map((achievement, index) => (
              <div key={index} className="achievement-edit-item">
                <h4>Achievement {index + 1}</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Achievement Title</label>
                    <input
                      type="text"
                      value={achievement.title || ''}
                      onChange={(e) => {
                        const newAchievements = [...editData];
                        newAchievements[index].title = e.target.value;
                        setEditData(newAchievements);
                      }}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={achievement.description || ''}
                      onChange={(e) => {
                        const newAchievements = [...editData];
                        newAchievements[index].description = e.target.value;
                        setEditData(newAchievements);
                      }}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={achievement.date || ''}
                      onChange={(e) => {
                        const newAchievements = [...editData];
                        newAchievements[index].date = e.target.value;
                        setEditData(newAchievements);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={achievement.level || 'Other'}
                      onChange={(e) => {
                        const newAchievements = [...editData];
                        newAchievements[index].level = e.target.value;
                        setEditData(newAchievements);
                      }}
                    >
                      <option value="National">National</option>
                      <option value="University">University</option>
                      <option value="Regional">Regional</option>
                      <option value="International">International</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      value={achievement.issuer || ''}
                      onChange={(e) => {
                        const newAchievements = [...editData];
                        newAchievements[index].issuer = e.target.value;
                        setEditData(newAchievements);
                      }}
                    />
                  </div>
                </div>
                <button 
                  className="remove-item-button"
                  onClick={() => {
                    const newAchievements = editData.filter((_, i) => i !== index);
                    setEditData(newAchievements);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              className="profile-add-action-btn"
              onClick={() => {
                setEditData([...editData, { title: '', description: '', date: '', level: 'Other', issuer: '' }]);
              }}
            >
              <PlusIcon size={16} />
              <span>Add Achievement</span>
            </button>
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={() => handleSaveSection('achievements', editData)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <ul className="achievements-list">
            {achievements.map((achievement, index) => (
              <li key={index} className="achievement-item">
                <div className="achievement-header">
                  <h4 className="achievement-title">{achievement.title}</h4>
                  {achievement.date && <span className="achievement-date">{formatDate(achievement.date)}</span>}
                </div>
                {achievement.description && (
                  <p className="achievement-description">{achievement.description}</p>
                )}
                {achievement.level && (
                  <div className="achievement-level">
                    <span className="level-badge">{achievement.level} Level</span>
                  </div>
                )}
                {achievement.issuer && (
                  <div className="achievement-issuer">
                    <span>Issued by: {achievement.issuer}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderCustomSections = () => {
    const customSections = profileData?.customSections;
    if (!customSections || Object.keys(customSections).length === 0) return null;

    return Object.entries(customSections).map(([sectionName, sectionData]) => (
      <div key={sectionName} className="profile-section">
        <h3 className="section-title">
          <span className="section-icon">
            <DocumentIcon size={20} />
          </span>
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
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)} 
                className="edit-profile-button"
              >
                <EditIcon size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button 
                onClick={() => setEditMode(false)} 
                className="edit-profile-button cancel-edit"
              >
                <span>✖</span>
                <span>Cancel Editing</span>
              </button>
            )}
          </div>

          <div className="profile-content">
            {renderContactInfo()}
            {renderExperience()}
            {renderEducation()}
            {renderSkills()}
            {renderProjects()}
            {renderCertifications()}
            {renderAchievements()}
            {renderCustomSections()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
