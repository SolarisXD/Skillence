import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import './ResumeDashboard.css';

// Utility function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch (error) {
    return true;
  }
};

// Utility function to handle authentication errors
const handleAuthError = (navigate) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  alert('Your session has expired. Please log in again.');
  navigate('/');
};
import {
  UploadIcon,
  DocumentIcon,
  FormIcon,
  ProcessingIcon,
  SuccessIcon,
  ErrorIcon,
  RetryIcon,
  ArrowLeftIcon,
  LoadingSpinner,
  UserIcon,
  BriefcaseIcon,
  GraduationIcon,
  SkillsIcon,
  ProjectIcon,
  CertificateIcon,
  ReviewIcon,
  SaveIcon,
  TargetIcon,
  CloseIcon
} from '../Icons/ProfessionalIcons';

// Helper function to transform Azure + Gemini parsed data to frontend format
const transformAzureParsedData = (parsedData) => {
  if (!parsedData) {
    return {
      contact_info: { name: 'Unknown', email: '', phone: '' },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: []
    };
  }

  // Transform contact_info
  const contact_info = parsedData.contact_info || {};

  // Transform work_experience to experience
  const experience = (parsedData.work_experience || []).map(exp => ({
    title: exp.position || exp.title || '',
    company: exp.company || '',
    duration: exp.start_date && exp.end_date ? `${exp.start_date} - ${exp.end_date}` : (exp.duration || ''),
    location: exp.location || '',
    responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities :
      (exp.description ? [exp.description] : [])
  }));

  // Transform education
  const education = (parsedData.education || []).map(edu => ({
    degree: edu.degree || '',
    institution: edu.institution || '',
    year: edu.start_date && edu.end_date ? `${edu.start_date} - ${edu.end_date}` : (edu.year || ''),
    gpa: edu.gpa || '',
    location: edu.location || '',
    details: edu.description || ''
  }));

  // Transform skills - Azure parser returns array of SkillCategory objects
  const skills = {
    technical: [],
    soft: [],
    languages: []
  };

  if (parsedData.skills && Array.isArray(parsedData.skills)) {
    parsedData.skills.forEach(skillCategory => {
      if (skillCategory.category && skillCategory.skills) {
        const categoryLower = skillCategory.category.toLowerCase();
        if (categoryLower.includes('technical') || categoryLower.includes('programming') || categoryLower.includes('technology')) {
          skills.technical = [...skills.technical, ...skillCategory.skills];
        } else if (categoryLower.includes('soft') || categoryLower.includes('interpersonal')) {
          skills.soft = [...skills.soft, ...skillCategory.skills];
        } else if (categoryLower.includes('language')) {
          skills.languages = [...skills.languages, ...skillCategory.skills];
        } else {
          // Default to technical skills
          skills.technical = [...skills.technical, ...skillCategory.skills];
        }
      }
    });
  }

  // Transform projects
  const projects = (parsedData.projects || []).map(proj => ({
    name: proj.name || '',
    description: proj.description || '',
    technologies: proj.technologies || [],
    duration: proj.start_date && proj.end_date ? `${proj.start_date} - ${proj.end_date}` : '',
    url: proj.url || proj.github_url || '',
    role: proj.role || ''
  }));

  // Transform certifications
  const certifications = (parsedData.certifications || []).map(cert => ({
    name: cert.name || '',
    issuer: cert.issuer || '',
    date: cert.date_obtained || cert.date || '',
    id: cert.credential_id || '',
    url: cert.url || ''
  }));

  // Transform achievements
  const achievements = (parsedData.achievements || []).map(ach => ({
    title: ach.title || '',
    description: ach.description || '',
    date: ach.date || '',
    issuer: ach.issuer || ''
  }));

  return {
    contact_info,
    careerSummary: parsedData.career_summary || '',
    education,
    experience,
    skills,
    projects,
    certifications,
    achievements,
    languages: parsedData.languages || [],
    source: 'azure_ai',
    parsing_confidence: parsedData.parsing_confidence || 0.9,
    createdAt: new Date().toISOString()
  };
};

// SkillTagInput Component for managing skill tags
const SkillTagInput = ({ skills, onSkillsChange, placeholder = "Add skills..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !skills.includes(trimmedValue)) {
        onSkillsChange([...skills, trimmedValue]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      onSkillsChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="skill-tag-input">
      <div className="skill-tags">
        {skills.map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};

// EditableSection Component for profile editing with proper form fields
const EditableSection = ({ title, content, icon, onEdit, onDelete, isCustom = false, sectionKey = '', hideParsedFields = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    // Before saving, strip any hidden fields if this section is from a parsed upload
    const hiddenFieldsBySection = {
      education: ['details'],
      projects: ['duration', 'role'],
      certifications: ['issuer', 'date', 'id', 'url'],
      achievements: ['description', 'date', 'issuer']
    };

    const sanitizeItem = (item) => {
      if (!item || typeof item !== 'object') return item;
      const hid = hiddenFieldsBySection[sectionKey] || [];
      const cleaned = { ...item };
      hid.forEach(k => {
        if (k in cleaned) delete cleaned[k];
      });
      return cleaned;
    };

    let toSave = editedContent;
    if (Array.isArray(editedContent)) {
      toSave = editedContent.map(sanitizeItem);
    } else if (typeof editedContent === 'object') {
      toSave = sanitizeItem(editedContent);
    }

    onEdit(toSave);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    if (Array.isArray(editedContent)) {
      // Handle arrays (like experience, education)
      const newArray = [...editedContent];
      newArray[field] = value;
      setEditedContent(newArray);
    } else {
      // Handle objects (like contact_info)
      setEditedContent({
        ...editedContent,
        [field]: value
      });
    }
  };

  const addArrayItem = () => {
    const titleLower = title.toLowerCase();
    const isParsed = hideParsedFields;
    if (titleLower.includes('experience')) {
      setEditedContent([...editedContent, {
        title: '',
        company: '',
        duration: '',
        responsibilities: []
      }]);
    } else if (title.toLowerCase().includes('education')) {
      setEditedContent([...editedContent, isParsed ? {
        degree: '',
        institution: '',
        year: '',
        gpa: ''
      } : {
        degree: '',
        institution: '',
        year: '',
        gpa: '',
        details: ''
      }]);
    } else if (title.toLowerCase().includes('project')) {
      setEditedContent([...editedContent, isParsed ? {
        name: '',
        description: '',
        technologies: [],
        link: ''
      } : {
        name: '',
        description: '',
        technologies: [],
        duration: '',
        role: '',
        link: ''
      }]);
    } else if (title.toLowerCase().includes('certification')) {
      setEditedContent([...editedContent, isParsed ? {
        name: ''
      } : {
        name: '',
        issuer: '',
        date: '',
        id: ''
      }]);
    } else if (title.toLowerCase().includes('achievement')) {
      setEditedContent([...editedContent, isParsed ? {
        title: ''
      } : {
        title: '',
        description: '',
        date: ''
      }]);
    } else {
      setEditedContent([...editedContent, '']);
    }
  };

  const removeArrayItem = (index) => {
    const newArray = editedContent.filter((_, i) => i !== index);
    setEditedContent(newArray);
  };

  const renderContactInfoForm = () => (
    <div className="form-fields">
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          value={editedContent.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter your full name"
        />
      </div>
      <div className="form-group">
        <label>Email Address *</label>
        <input
          type="email"
          value={editedContent.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="your.email@example.com"
        />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="tel"
          value={editedContent.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>
      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          value={editedContent.location || ''}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="City, State/Country"
        />
      </div>
      <div className="form-group">
        <label>LinkedIn Profile</label>
        <input
          type="url"
          value={editedContent.linkedin || ''}
          onChange={(e) => updateField('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
      <div className="form-group">
        <label>GitHub Profile</label>
        <input
          type="url"
          value={editedContent.github || ''}
          onChange={(e) => updateField('github', e.target.value)}
          placeholder="https://github.com/yourusername"
        />
      </div>
      <div className="form-group">
        <label>Website</label>
        <input
          type="url"
          value={editedContent.website || ''}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="https://yourwebsite.com"
        />
      </div>
    </div>
  );

  const renderExperienceForm = () => (
    <div className="array-form">
      {editedContent.map((exp, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <h4>Experience {index + 1}</h4>
            <button
              type="button"
              className="remove-item"
              onClick={() => removeArrayItem(index)}
            >
              Remove
            </button>
          </div>
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              value={exp.title || ''}
              onChange={(e) => {
                const newExp = [...editedContent];
                newExp[index] = { ...exp, title: e.target.value };
                setEditedContent(newExp);
              }}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          <div className="form-group">
            <label>Company *</label>
            <input
              type="text"
              value={exp.company || ''}
              onChange={(e) => {
                const newExp = [...editedContent];
                newExp[index] = { ...exp, company: e.target.value };
                setEditedContent(newExp);
              }}
              placeholder="e.g., TechCorp Inc."
            />
          </div>
          <div className="form-group">
            <label>Duration *</label>
            <input
              type="text"
              value={exp.duration || ''}
              onChange={(e) => {
                const newExp = [...editedContent];
                newExp[index] = { ...exp, duration: e.target.value };
                setEditedContent(newExp);
              }}
              placeholder="e.g., Jan 2020 - Present"
            />
          </div>
          <div className="form-group">
            <label>Key Responsibilities</label>
            <textarea
              value={Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : exp.responsibilities || ''}
              onChange={(e) => {
                const newExp = [...editedContent];
                newExp[index] = {
                  ...exp,
                  responsibilities: e.target.value.split('\n').filter(line => line.trim())
                };
                setEditedContent(newExp);
              }}
              rows={4}
              placeholder="Enter each responsibility on a new line"
            />
          </div>
        </div>
      ))}
      <button type="button" className="profile-add-action-btn" onClick={addArrayItem}>
        Add Experience
      </button>
    </div>
  );

  const renderEducationForm = () => (
    <div className="array-form">
      {editedContent.map((edu, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <h4>Education {index + 1}</h4>
            <button
              type="button"
              className="remove-item"
              onClick={() => removeArrayItem(index)}
            >
              Remove
            </button>
          </div>
          <div className="form-group">
            <label>Degree *</label>
            <input
              type="text"
              value={edu.degree || ''}
              onChange={(e) => {
                const newEdu = [...editedContent];
                newEdu[index] = { ...edu, degree: e.target.value };
                setEditedContent(newEdu);
              }}
              placeholder="e.g., Bachelor of Science in Computer Science"
            />
          </div>
          <div className="form-group">
            <label>Institution *</label>
            <input
              type="text"
              value={edu.institution || ''}
              onChange={(e) => {
                const newEdu = [...editedContent];
                newEdu[index] = { ...edu, institution: e.target.value };
                setEditedContent(newEdu);
              }}
              placeholder="e.g., University of Technology"
            />
          </div>
          <div className="form-group">
            <label>Year/Duration</label>
            <input
              type="text"
              value={edu.year || ''}
              onChange={(e) => {
                const newEdu = [...editedContent];
                newEdu[index] = { ...edu, year: e.target.value };
                setEditedContent(newEdu);
              }}
              placeholder="e.g., 2018-2022"
            />
          </div>
          <div className="form-group">
            <label>GPA (Optional)</label>
            <input
              type="text"
              value={edu.gpa || ''}
              onChange={(e) => {
                const newEdu = [...editedContent];
                newEdu[index] = { ...edu, gpa: e.target.value };
                setEditedContent(newEdu);
              }}
              placeholder="e.g., 3.8/4.0"
            />
          </div>

          {/* details field removed for parsed uploads */}
          {!hideParsedFields && (
            <div className="form-group">
              <label>Details</label>
              <textarea
                value={edu.details || ''}
                onChange={(e) => {
                  const newEdu = [...editedContent];
                  newEdu[index] = { ...edu, details: e.target.value };
                  setEditedContent(newEdu);
                }}
                rows={3}
                placeholder="Additional details about this education item"
              />
            </div>
          )}
        </div>
      ))}
      <button type="button" className="profile-add-action-btn" onClick={addArrayItem}>
        Add Education
      </button>
    </div>
  );

  const renderSkillsForm = () => (
    <div className="form-fields">
      <div className="form-group">
        <label>Skills (one per line)</label>
        <textarea
          value={Array.isArray(editedContent) ? editedContent.join('\n') : (editedContent || '')}
          onChange={(e) => {
            const skills = e.target.value.split('\n').filter(skill => skill.trim());
            setEditedContent(skills);
          }}
          rows={8}
          placeholder="Enter skills, one per line&#10;Python&#10;JavaScript&#10;React&#10;Node.js&#10;MongoDB"
        />
      </div>
    </div>
  );

  const renderProjectsForm = () => (
    <div className="array-form">
      {editedContent.map((project, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <h4>Project {index + 1}</h4>
            <button
              type="button"
              className="remove-item"
              onClick={() => removeArrayItem(index)}
            >
              Remove
            </button>
          </div>
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={project.name || ''}
              onChange={(e) => {
                const newProjects = [...editedContent];
                newProjects[index] = { ...project, name: e.target.value };
                setEditedContent(newProjects);
              }}
              placeholder="e.g., E-commerce Web Application"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={project.description || ''}
              onChange={(e) => {
                const newProjects = [...editedContent];
                newProjects[index] = { ...project, description: e.target.value };
                setEditedContent(newProjects);
              }}
              rows={3}
              placeholder="Brief description of the project"
            />
          </div>
          <div className="form-group">
            <label>Technologies Used</label>
            <input
              type="text"
              value={Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || ''}
              onChange={(e) => {
                const newProjects = [...editedContent];
                newProjects[index] = {
                  ...project,
                  technologies: e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech)
                };
                setEditedContent(newProjects);
              }}
              placeholder="React, Node.js, MongoDB (comma-separated)"
            />
          </div>
          {/* duration and role removed for parsed uploads */}
          {!hideParsedFields && (
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                value={project.duration || ''}
                onChange={(e) => {
                  const newProjects = [...editedContent];
                  newProjects[index] = { ...project, duration: e.target.value };
                  setEditedContent(newProjects);
                }}
                placeholder="e.g., Jan 2022 - Jun 2023"
              />
            </div>
          )}

          {!hideParsedFields && (
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={project.role || ''}
                onChange={(e) => {
                  const newProjects = [...editedContent];
                  newProjects[index] = { ...project, role: e.target.value };
                  setEditedContent(newProjects);
                }}
                placeholder="Your role in the project"
              />
            </div>
          )}

          <div className="form-group">
            <label>Project Link (Optional)</label>
            <input
              type="url"
              value={project.link || ''}
              onChange={(e) => {
                const newProjects = [...editedContent];
                newProjects[index] = { ...project, link: e.target.value };
                setEditedContent(newProjects);
              }}
              placeholder="https://github.com/username/project"
            />
          </div>
        </div>
      ))}
      <button type="button" className="profile-add-action-btn" onClick={addArrayItem}>
        Add Project
      </button>
    </div>
  );

  const renderCertificationsForm = () => (
    <div className="array-form">
      {editedContent.map((cert, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <h4>Certification {index + 1}</h4>
            <button
              type="button"
              className="remove-item"
              onClick={() => removeArrayItem(index)}
            >
              Remove
            </button>
          </div>
          <div className="form-group">
            <label>Certification Name *</label>
            <input
              type="text"
              value={cert.name || ''}
              onChange={(e) => {
                const newCerts = [...editedContent];
                newCerts[index] = { ...cert, name: e.target.value };
                setEditedContent(newCerts);
              }}
              placeholder="e.g., AWS Certified Solutions Architect"
            />
          </div>
          {/* Issuer, Date, Id, Url removed for parsed uploads */}
          {!hideParsedFields && (
            <>
              <div className="form-group">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  value={cert.issuer || ''}
                  onChange={(e) => {
                    const newCerts = [...editedContent];
                    newCerts[index] = { ...cert, issuer: e.target.value };
                    setEditedContent(newCerts);
                  }}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
              <div className="form-group">
                <label>Date Obtained</label>
                <input
                  type="text"
                  value={cert.date || ''}
                  onChange={(e) => {
                    const newCerts = [...editedContent];
                    newCerts[index] = { ...cert, date: e.target.value };
                    setEditedContent(newCerts);
                  }}
                  placeholder="e.g., March 2023"
                />
              </div>
              <div className="form-group">
                <label>Credential ID (Optional)</label>
                <input
                  type="text"
                  value={cert.id || ''}
                  onChange={(e) => {
                    const newCerts = [...editedContent];
                    newCerts[index] = { ...cert, id: e.target.value };
                    setEditedContent(newCerts);
                  }}
                  placeholder="Credential ID or verification link"
                />
              </div>
            </>
          )}
        </div>
      ))}
      <button type="button" className="profile-add-action-btn" onClick={addArrayItem}>
        Add Certification
      </button>
    </div>
  );

  const renderAchievementsForm = () => (
    <div className="array-form">
      {editedContent.map((achievement, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <h4>Achievement {index + 1}</h4>
            <button
              type="button"
              className="remove-item"
              onClick={() => removeArrayItem(index)}
            >
              Remove
            </button>
          </div>
          <div className="form-group">
            <label>Achievement Title *</label>
            <input
              type="text"
              value={achievement.title || ''}
              onChange={(e) => {
                const newAchievements = [...editedContent];
                newAchievements[index] = { ...achievement, title: e.target.value };
                setEditedContent(newAchievements);
              }}
              placeholder="e.g., Employee of the Year"
            />
          </div>
          {/* description, date, issuer removed for parsed uploads */}
          {!hideParsedFields && (
            <>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={achievement.description || ''}
                  onChange={(e) => {
                    const newAchievements = [...editedContent];
                    newAchievements[index] = { ...achievement, description: e.target.value };
                    setEditedContent(newAchievements);
                  }}
                  rows={3}
                  placeholder="Brief description of the achievement"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  value={achievement.date || ''}
                  onChange={(e) => {
                    const newAchievements = [...editedContent];
                    newAchievements[index] = { ...achievement, date: e.target.value };
                    setEditedContent(newAchievements);
                  }}
                  placeholder="e.g., December 2022"
                />
              </div>
            </>
          )}
        </div>
      ))}
      <button type="button" className="profile-add-action-btn" onClick={addArrayItem}>
        Add Achievement
      </button>
    </div>
  );

  const renderCustomSectionForm = () => (
    <div className="form-fields">
      <div className="form-group">
        <label>Content</label>
        <textarea
          value={typeof editedContent === 'string' ? editedContent : JSON.stringify(editedContent, null, 2)}
          onChange={(e) => setEditedContent(e.target.value)}
          rows={6}
          placeholder="Enter content for this custom section"
        />
      </div>
    </div>
  );

  const renderEditingForm = () => {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('contact')) {
      return renderContactInfoForm();
    } else if (titleLower.includes('experience')) {
      return renderExperienceForm();
    } else if (titleLower.includes('education')) {
      return renderEducationForm();
    } else if (titleLower.includes('skill')) {
      return renderSkillsForm();
    } else if (titleLower.includes('project')) {
      return renderProjectsForm();
    } else if (titleLower.includes('certification')) {
      return renderCertificationsForm();
    } else if (titleLower.includes('achievement')) {
      return renderAchievementsForm();
    } else {
      return renderCustomSectionForm();
    }
  };

  const renderContent = () => {
    // Fields to hide for parsed (uploaded) profiles per section
    const hiddenFieldsBySection = {
      education: ['details'],
      projects: ['duration', 'role'],
      certifications: ['issuer', 'date', 'id', 'url'],
      achievements: ['description', 'date', 'issuer']
    };

    const shouldHideField = (fieldKey) => {
      if (!hideParsedFields) return false;
      const key = String(fieldKey || '').toLowerCase();
      const hid = hiddenFieldsBySection[sectionKey];
      return Array.isArray(hid) && hid.includes(key);
    };
    if (Array.isArray(content)) {
      if (content.length === 0) {
        return <p className="no-content">No items added yet</p>;
      }
      return content.map((item, index) => (
        <div key={index} className="preview-item">
          {typeof item === 'object' ? (
            Object.entries(item).filter(([key]) => !shouldHideField(key)).map(([key, value]) => (
              <p key={key}>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {
                  Array.isArray(value) ? value.join(', ') : value
                }
              </p>
            ))
          ) : (
            <p>{item}</p>
          )}
        </div>
      ));
    } else if (typeof content === 'object') {
      return Object.entries(content).filter(([key]) => !shouldHideField(key)).map(([key, value]) => (
        <p key={key}>
          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {
            Array.isArray(value) ? value.join(', ') : value || 'Not specified'
          }
        </p>
      ));
    }
    return <p>{content || 'No content'}</p>;
  };

  return (
    <div className={`editable-section ${isCustom ? 'custom-section' : ''}`}>
      <div className="section-header">
        <h3>{icon} {title}</h3>
        <div className="section-actions">
          {!isEditing && (
            <>
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </button>
              {isCustom && (
                <button className="delete-button" onClick={onDelete}>
                  🗑️ Delete
                </button>
              )}
            </>
          )}
          {isEditing && (
            <>
              <button className="save-section-button" onClick={handleSave}>
                <SaveIcon size={16} />
                Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                <CloseIcon size={16} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="section-content">
        {isEditing ? (
          <div className="editing-mode">
            {renderEditingForm()}
          </div>
        ) : (
          <div className="preview-mode">
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

// Main ProfileBuilder Component
const ProfileBuilder = () => {
  // Initialize navigation hook
  const navigate = useNavigate();

  // State Management
  const [currentView, setCurrentView] = useState('selection'); // selection, upload, manual, editor
  const [profileData, setProfileData] = useState({});
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileURL, setSelectedFileURL] = useState(null);
  const [customSections, setCustomSections] = useState({});
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // saving, saved, error
  const [showGoToProfile, setShowGoToProfile] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Revoke object URL when component unmounts or when selectedFileURL changes
  useEffect(() => {
    return () => {
      if (selectedFileURL) {
        try { URL.revokeObjectURL(selectedFileURL); } catch (e) { /* ignore */ }
      }
    };
  }, [selectedFileURL]);

  // Handle save notification timer
  useEffect(() => {
    if (saveStatus === 'saved') {
      setShowGoToProfile(true);
      const timer = setTimeout(() => {
        setSaveStatus('');
        setShowGoToProfile(false);
        setRedirectCountdown(0);
      }, 15000); // Clear notification after 15 seconds
      return () => clearTimeout(timer);
    } else {
      // Reset countdown when status changes
      setRedirectCountdown(0);
    }
  }, [saveStatus]);

  // Handle countdown timer for redirection
  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        if (redirectCountdown === 1) {
          navigate('/profile');
        } else {
          setRedirectCountdown(prev => prev - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectCountdown, navigate]);

  // Form Steps Configuration
  const formSteps = [
    { id: 'personal', label: 'Personal Info', icon: <UserIcon size={20} /> },
    { id: 'career', label: 'Career Overview', icon: <TargetIcon size={20} /> },
    { id: 'education', label: 'Education', icon: <GraduationIcon size={20} /> },
    { id: 'experience', label: 'Experience', icon: <BriefcaseIcon size={20} /> },
    { id: 'skills', label: 'Skills', icon: <SkillsIcon size={20} /> },
    { id: 'projects', label: 'Projects', icon: <ProjectIcon size={20} /> },
    { id: 'certifications', label: 'Certifications', icon: <CertificateIcon size={20} /> },
    { id: 'review', label: 'Review', icon: <ReviewIcon size={20} /> }
  ];

  // Profile Mode Selection Component
  const ProfileModeSelection = () => (
    <div className="profile-selection-container">
      <div className="profile-header">
        <h1>Build Your Professional Profile</h1>
        <p>Choose how you'd like to create your comprehensive career profile. We'll help you showcase your professional journey effectively.</p>
      </div>

      <div className="profile-options">
        <div className="profile-option" onClick={() => setCurrentView('upload')}>
          <div className="option-icon">
            <DocumentIcon size={32} />
          </div>
          <h3>Resume Upload</h3>
          <p>Upload your existing resume and let our intelligent system extract and structure your professional information automatically.</p>

          <button className="option-button primary">
            Upload Resume
          </button>
        </div>

        <div className="profile-options-divider">
          <div className="divider-line"></div>
          <div className="divider-or">OR</div>
          <div className="divider-line"></div>
        </div>

        <div className="profile-option" onClick={() => setCurrentView('manual-entry')}>
          <div className="option-icon">
            <FormIcon size={32} />
          </div>
          <h3>Manual Entry</h3>
          <p>Build your profile step-by-step with our guided 8-step form. Perfect for creating a detailed profile with full control over every section.</p>

          <button className="option-button secondary">
            Create Manually
          </button>
        </div>
      </div>


    </div>
  );

  // Resume Upload Component
  const ResumeUpload = () => {
    // Drag and Drop Handlers
    const handleDragOver = (e) => {
      e.preventDefault();
      dropZoneRef.current?.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dropZoneRef.current?.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dropZoneRef.current?.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileChosen(files[0]);
      }
    };

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileChosen(file);
      }
    };

    const handleFileChosen = (file) => {
      // Validate file type and size but do NOT start upload yet
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];

      if (!allowedTypes.includes(file.type)) {
        setUploadState('error');
        setErrorMessage('Please upload a PDF or Word document (.pdf, .docx, .doc)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadState('error');
        setErrorMessage('File size too large. Please upload a file smaller than 10MB.');
        return;
      }

      // Clean up previous object URL if any
      if (selectedFileURL) {
        URL.revokeObjectURL(selectedFileURL);
      }

      const url = file.type === 'application/pdf' ? URL.createObjectURL(file) : null;
      setSelectedFile(file);
      setSelectedFileURL(url);
      setUploadProgress(0);
      setErrorMessage('');
      // stay in 'idle' state but show preview / confirm
    };

    const startUpload = async (file) => {
      if (!file) return;
      setUploadState('uploading');
      setUploadProgress(0);

      try {
        // Simulate upload progress
        const uploadInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(uploadInterval);
              setUploadState('processing');
              processResume(file);
              return 100;
            }
            return prev + 10;
          });
        }, 200);

      } catch (error) {
        setUploadState('error');
        setErrorMessage('Upload failed. Please try again.');
      }
    };

    const processResume = async (file) => {
      const steps = [
        'Uploading to Azure Document Intelligence...',
        'Extracting text content with OCR...',
        'Processing with Gemini AI...',
        'Structuring personal information...',
        'Identifying work experience...',
        'Extracting education details...',
        'Analyzing skills and competencies...',
        'Finalizing profile data...'
      ];

      try {
        const formData = new FormData();
        formData.append('file', file);

        for (let i = 0; i < steps.length; i++) {
          setProcessingStep(steps[i]);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Call the backend API
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');

        const response = await fetch('http://localhost:8000/api/resume/test-upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Resume parsing result:', result); // Debug log

          // Support multiple possible response shapes
          const rawParsed = result?.profile_data || result?.data || result?.resume_data || result?.resume?.resume_data || null;
          if (!rawParsed) {
            console.warn('No parsed data found in response. Keys:', Object.keys(result || {}));
          }

          // Transform Azure + Gemini parsed data to frontend format
          const transformedData = transformAzureParsedData(rawParsed);
          console.log('Transformed profile data:', transformedData);

          setProfileData(transformedData);
          setUploadState('success');

          // Remove the auto-redirect - user will click button to continue
        } else {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to process resume: ${response.status} - ${errorText}`);
        }

      } catch (error) {
        console.error('Resume processing error:', error);
        setUploadState('error');
        setErrorMessage(`Failed to process your resume: ${error.message}. Please check console for details.`);
      }
    };

    const handleRetry = () => {
      setUploadState('idle');
      setUploadProgress(0);
      setErrorMessage('');
      setProcessingStep('');
    };

    const handleManualFallback = () => {
      setCurrentView('manual');
    };

    // Render different states
    if (uploadState === 'idle') {
      return (
        <div className="resume-upload-container">
          <button className="back-button" onClick={() => setCurrentView('selection')}>
            <ArrowLeftIcon size={16} />
            Back to Options
          </button>

          <div className="upload-header">
            <h2>Upload Your Resume</h2>
            <p>Upload your resume in PDF or Word format for automatic information extraction and profile creation.</p>
          </div>

          <div className="upload-area">
            <div
              ref={dropZoneRef}
              className="file-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {!selectedFile && (
                <div className="drop-zone-content">
                  <div className="upload-icon">
                    <UploadIcon size={48} />
                  </div>
                  <h3>Drag & Drop Your Resume</h3>
                  <p>or click to browse files</p>

                  <div className="file-requirements">
                    <span>PDF</span>
                    <span>DOCX</span>
                    <span>DOC</span>
                    <span>Max 10MB</span>
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="selected-file-preview">
                  <div className="preview-metadata">
                    <div className="preview-icon">
                      <DocumentIcon size={36} />
                    </div>
                    <div className="file-info">
                      <div className="file-name">{selectedFile.name}</div>
                      <div className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>

                  {selectedFileURL ? (
                    <div className="pdf-preview">
                      <object data={selectedFileURL} type="application/pdf" width="100%" height="320">
                        <p>PDF preview is not available. You can still confirm upload.</p>
                      </object>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <p>Preview not available for this file type. You can still confirm upload.</p>
                    </div>
                  )}

                  <div className="selected-file-actions">
                    <button className="confirm-upload-button" onClick={(e) => {
                      e.stopPropagation();
                      startUpload(selectedFile);
                    }}>
                      Confirm Upload
                    </button>
                    <button
                      className="replace-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (uploadState === 'idle') {
                          fileInputRef.current?.click();
                        }
                      }}
                      disabled={uploadState !== 'idle'}
                    >
                      Replace File
                    </button>
                    <button className="remove-button" onClick={(e) => {
                      e.stopPropagation();
                      if (selectedFileURL) URL.revokeObjectURL(selectedFileURL);
                      setSelectedFile(null);
                      setSelectedFileURL(null);
                      setUploadProgress(0);
                      setErrorMessage('');
                    }}>
                      Remove File
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      );
    }

    if (uploadState === 'uploading') {
      return (
        <div className="resume-upload-container">
          <div className="upload-progress">
            <div className="progress-icon">
              <LoadingSpinner size={32} />
            </div>
            <h3>Uploading Your Resume</h3>
            <p>Please wait while we upload your file...</p>

            <div className="progress-bar">
              <div
                className="progress-fill uploading"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            <div className="progress-text">{uploadProgress}% Complete</div>
          </div>
        </div>
      );
    }

    if (uploadState === 'processing') {
      return (
        <div className="resume-upload-container">
          <div className="processing-progress">
            <div className="progress-icon">
              <ProcessingIcon size={32} />
            </div>
            <h3>Processing Your Resume</h3>
            <p>Analyzing your resume and extracting key information...</p>

            <div className="processing-steps">
              <div className="step active">{processingStep}</div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill processing" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      );
    }

    if (uploadState === 'success') {
      return (
        <div className="resume-upload-container">
          <div className="upload-success">
            <div className="success-icon">
              <SuccessIcon size={48} />
            </div>
            <h3>Resume Processed Successfully</h3>
            <p>Your professional information has been extracted and structured</p>

            <button
              className="continue-button"
              onClick={() => setCurrentView('editor')}
            >
              Continue to Profile Editor
            </button>
          </div>
        </div>
      );
    }

    if (uploadState === 'error') {
      return (
        <div className="resume-upload-container">
          <div className="upload-error">
            <div className="error-icon">
              <ErrorIcon size={48} />
            </div>
            <h3>Upload Failed</h3>
            <p>{errorMessage}</p>

            <div className="error-suggestions">
              <h4>Suggestions:</h4>
              <ul>
                <li>Ensure your file is in PDF or Word format (.pdf, .docx, .doc)</li>
                <li>Check that the file size is under 10MB</li>
                <li>Make sure the document contains readable text (not just images)</li>
                <li>Try using a different browser if the problem persists</li>
              </ul>
            </div>

            <div className="error-actions">
              <button className="retry-button" onClick={handleRetry}>
                <RetryIcon size={16} />
                Try Again
              </button>
              <button className="manual-button" onClick={handleManualFallback}>
                <FormIcon size={16} />
                Create Manually Instead
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Manual Form Component
  // Manual Entry Form Component
  const ManualEntryForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
      contact_info: { name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
      career_overview: { title: '', experience: '', summary: '', industry: '', level: '' },
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: []
    });

    const steps = [
      { id: 0, name: 'Personal Info', icon: <UserIcon size={20} /> },
      { id: 1, name: 'Career Overview', icon: <TargetIcon size={20} /> },
      { id: 2, name: 'Education', icon: <GraduationIcon size={20} /> },
      { id: 3, name: 'Experience', icon: <BriefcaseIcon size={20} /> },
      { id: 4, name: 'Skills', icon: <SkillsIcon size={20} /> },
      { id: 5, name: 'Projects', icon: <ProjectIcon size={20} /> },
      { id: 6, name: 'Certifications', icon: <CertificateIcon size={20} /> },
      { id: 7, name: 'Review', icon: <ReviewIcon size={20} /> }
    ];

    const handleSubmit = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
          handleAuthError(navigate);
          return;
        }

        const profilePayload = {
          ...formData,
          source: 'manual_entry',
          created_at: new Date().toISOString()
        };

        console.log('Saving profile data:', profilePayload);

        const response = await fetch('http://localhost:8000/api/profile/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_data: profilePayload })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Profile saved successfully:', result);
          setProfileData(profilePayload);
          alert('✅ Profile saved successfully! Redirecting to your profile page...');
          // Navigate to profile page to view the saved profile
          navigate('/profile');
        } else if (response.status === 401) {
          handleAuthError(navigate);
        } else {
          const errorData = await response.json();
          console.error('Save failed:', errorData);
          throw new Error(errorData.detail || 'Failed to save profile');
        }
      } catch (error) {
        console.error('Save error:', error);
        alert(`Failed to save profile: ${error.message}. Please try again.`);
      }
    };

    const renderStep = () => {
      switch (currentStep) {
        case 0:
          return (
            <div className="manual-entry-step">
              <h3><UserIcon size={24} className="inline-icon" /> Personal Information</h3>
              <p>Let's start with your basic contact information</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={formData.contact_info.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, name: e.target.value } }))}
                    placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={formData.contact_info.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, email: e.target.value } }))}
                    placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={formData.contact_info.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, phone: e.target.value } }))}
                    placeholder="+1 (555) 123-4567" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={formData.contact_info.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, location: e.target.value } }))}
                    placeholder="San Francisco, CA" />
                </div>
                <div className="form-group">
                  <label>LinkedIn Profile</label>
                  <input type="url" value={formData.contact_info.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, linkedin: e.target.value } }))}
                    placeholder="https://linkedin.com/in/johndoe" />
                </div>
                <div className="form-group">
                  <label>Portfolio/Website</label>
                  <input type="url" value={formData.contact_info.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, website: e.target.value } }))}
                    placeholder="https://johndoe.com" />
                </div>
              </div>
            </div>
          );
        case 1:
          return (
            <div className="manual-entry-step">
              <h3><TargetIcon size={24} className="inline-icon" /> Career Overview</h3>
              <p>Tell us about your professional background</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Job Title *</label>
                  <input type="text" value={formData.career_overview.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, career_overview: { ...prev.career_overview, title: e.target.value } }))}
                    placeholder="Senior Software Engineer" />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <select value={formData.career_overview.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, career_overview: { ...prev.career_overview, experience: e.target.value } }))}>
                    <option value="">Select...</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-7">5-7 years</option>
                    <option value="7-10">7-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input type="text" value={formData.career_overview.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, career_overview: { ...prev.career_overview, industry: e.target.value } }))}
                    placeholder="Technology, Finance, Healthcare, etc." />
                </div>
                <div className="form-group">
                  <label>Career Level</label>
                  <select value={formData.career_overview.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, career_overview: { ...prev.career_overview, level: e.target.value } }))}>
                    <option value="">Select...</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead/Principal</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Professional Summary</label>
                  <textarea value={formData.career_overview.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, career_overview: { ...prev.career_overview, summary: e.target.value } }))}
                    placeholder="Brief overview of your professional experience and career goals..." rows="5" />
                </div>
              </div>
            </div>
          );
          return <div className="manual-entry-step"><h3>Step {currentStep + 1}</h3><p>This step is under construction. Click Next to continue.</p></div>;
        case 2:
          return (
            <div className="manual-entry-step">
              <h3><GraduationIcon size={24} className="inline-icon" /> Education</h3>
              <p>Add your educational background</p>
              {formData.education.map((edu, index) => (
                <div key={index} className="form-item">
                  <div className="item-header">
                    <h4>Education #{index + 1}</h4>
                    <button className="remove-button" onClick={() => setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }))}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Institution</label>
                      <input type="text" value={edu.institution || ''} onChange={(e) => setFormData(prev => ({ ...prev, education: prev.education.map((item, i) => i === index ? { ...item, institution: e.target.value } : item) }))} placeholder="Stanford University" />
                    </div>
                    <div className="form-group">
                      <label>Degree</label>
                      <input type="text" value={edu.degree || ''} onChange={(e) => setFormData(prev => ({ ...prev, education: prev.education.map((item, i) => i === index ? { ...item, degree: e.target.value } : item) }))} placeholder="Bachelor of Science" />
                    </div>
                    <div className="form-group">
                      <label>Field of Study</label>
                      <input type="text" value={edu.field || ''} onChange={(e) => setFormData(prev => ({ ...prev, education: prev.education.map((item, i) => i === index ? { ...item, field: e.target.value } : item) }))} placeholder="Computer Science" />
                    </div>
                    <div className="form-group">
                      <label>Graduation Year</label>
                      <input type="text" value={edu.year || ''} onChange={(e) => setFormData(prev => ({ ...prev, education: prev.education.map((item, i) => i === index ? { ...item, year: e.target.value } : item) }))} placeholder="2020" />
                    </div>
                    <div className="form-group">
                      <label>GPA / Grade / Percentage</label>
                      <input type="text" value={edu.gpa || ''} onChange={(e) => setFormData(prev => ({ ...prev, education: prev.education.map((item, i) => i === index ? { ...item, gpa: e.target.value } : item) }))} placeholder="3.8/4.0 or 85% or First Class" />
                    </div>
                  </div>
                </div>
              ))}
              <button className="profile-add-action-btn" onClick={() => setFormData(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '', field: '', year: '', gpa: '' }] }))}>
                + Add Education
              </button>
            </div>
          );
        case 3:
          return (
            <div className="manual-entry-step">
              <h3><BriefcaseIcon size={24} className="inline-icon" /> Work Experience</h3>
              <p>Add your professional work history</p>
              {formData.experience.map((exp, index) => (
                <div key={index} className="form-item">
                  <div className="item-header">
                    <h4>Experience #{index + 1}</h4>
                    <button className="remove-button" onClick={() => setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }))}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Job Title</label>
                      <input type="text" value={exp.title || ''} onChange={(e) => setFormData(prev => ({ ...prev, experience: prev.experience.map((item, i) => i === index ? { ...item, title: e.target.value } : item) }))} placeholder="Software Engineer" />
                    </div>
                    <div className="form-group">
                      <label>Company</label>
                      <input type="text" value={exp.company || ''} onChange={(e) => setFormData(prev => ({ ...prev, experience: prev.experience.map((item, i) => i === index ? { ...item, company: e.target.value } : item) }))} placeholder="Google" />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="month" value={exp.start_date || ''} onChange={(e) => setFormData(prev => ({ ...prev, experience: prev.experience.map((item, i) => i === index ? { ...item, start_date: e.target.value } : item) }))} />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="month" value={exp.end_date || ''} onChange={(e) => setFormData(prev => ({ ...prev, experience: prev.experience.map((item, i) => i === index ? { ...item, end_date: e.target.value } : item) }))} disabled={exp.current} />
                    </div>
                    <div className="form-group full-width">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={exp.current || false} onChange={(e) => setFormData(prev => ({ ...prev, experience: prev.experience.map((item, i) => i === index ? { ...item, current: e.target.checked, end_date: e.target.checked ? '' : item.end_date } : item) }))} />
                        Currently working here
                      </label>
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea value={exp.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, experience: prev.experience.map((item, i) => i === index ? { ...item, description: e.target.value } : item) }))} placeholder="Describe your responsibilities and achievements..." rows="4" />
                    </div>
                  </div>
                </div>
              ))}
              <button className="profile-add-action-btn" onClick={() => setFormData(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', start_date: '', end_date: '', description: '', current: false }] }))}>
                + Add Experience
              </button>
            </div>
          );
        case 4:
          return (
            <div className="manual-entry-step">
              <h3><SkillsIcon size={24} className="inline-icon" /> Skills</h3>
              <p>Add your professional skills</p>
              <div className="form-group full-width">
                <label>Add Skills (press Enter after each skill)</label>
                <div className="skill-tags">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      <button onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }))}>×</button>
                    </div>
                  ))}
                </div>
                <input type="text" placeholder="Type a skill and press Enter" onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setFormData(prev => ({ ...prev, skills: [...prev.skills, e.target.value.trim()] }));
                    e.target.value = '';
                  }
                }} />
              </div>
            </div>
          );
        case 5:
          return (
            <div className="manual-entry-step">
              <h3><ProjectIcon size={24} className="inline-icon" /> Projects</h3>
              <p>Showcase your notable projects</p>
              {formData.projects.map((proj, index) => (
                <div key={index} className="form-item">
                  <div className="item-header">
                    <h4>Project #{index + 1}</h4>
                    <button className="remove-button" onClick={() => setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }))}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input type="text" value={proj.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, projects: prev.projects.map((item, i) => i === index ? { ...item, name: e.target.value } : item) }))} placeholder="E-commerce Platform" />
                    </div>
                    <div className="form-group">
                      <label>Technologies</label>
                      <input type="text" value={proj.technologies || ''} onChange={(e) => setFormData(prev => ({ ...prev, projects: prev.projects.map((item, i) => i === index ? { ...item, technologies: e.target.value } : item) }))} placeholder="React, Node.js, MongoDB" />
                    </div>
                    <div className="form-group">
                      <label>Project URL</label>
                      <input type="url" value={proj.url || ''} onChange={(e) => setFormData(prev => ({ ...prev, projects: prev.projects.map((item, i) => i === index ? { ...item, url: e.target.value } : item) }))} placeholder="https://project.com" />
                    </div>
                    <div className="form-group">
                      <label>GitHub URL</label>
                      <input type="url" value={proj.github || ''} onChange={(e) => setFormData(prev => ({ ...prev, projects: prev.projects.map((item, i) => i === index ? { ...item, github: e.target.value } : item) }))} placeholder="https://github.com/user/project" />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea value={proj.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, projects: prev.projects.map((item, i) => i === index ? { ...item, description: e.target.value } : item) }))} placeholder="Describe the project..." rows="3" />
                    </div>
                  </div>
                </div>
              ))}
              <button className="profile-add-action-btn" onClick={() => setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: '', technologies: '', url: '', github: '', description: '' }] }))}>
                + Add Project
              </button>
            </div>
          );
        case 6:
          return (
            <div className="manual-entry-step">
              <h3><CertificateIcon size={24} className="inline-icon" /> Certifications</h3>
              <p>Add your professional certifications</p>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="form-item">
                  <div className="item-header">
                    <h4>Certification #{index + 1}</h4>
                    <button className="remove-button" onClick={() => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }))}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Certification Name</label>
                      <input type="text" value={cert.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, certifications: prev.certifications.map((item, i) => i === index ? { ...item, name: e.target.value } : item) }))} placeholder="AWS Solutions Architect" />
                    </div>
                    <div className="form-group">
                      <label>Issuing Organization</label>
                      <input type="text" value={cert.issuer || ''} onChange={(e) => setFormData(prev => ({ ...prev, certifications: prev.certifications.map((item, i) => i === index ? { ...item, issuer: e.target.value } : item) }))} placeholder="Amazon Web Services" />
                    </div>
                    <div className="form-group">
                      <label>Issue Date</label>
                      <input type="month" value={cert.issue_date || ''} onChange={(e) => setFormData(prev => ({ ...prev, certifications: prev.certifications.map((item, i) => i === index ? { ...item, issue_date: e.target.value } : item) }))} />
                    </div>
                    <div className="form-group">
                      <label>Credential URL</label>
                      <input type="url" value={cert.url || ''} onChange={(e) => setFormData(prev => ({ ...prev, certifications: prev.certifications.map((item, i) => i === index ? { ...item, url: e.target.value } : item) }))} placeholder="https://verify.com/cert123" />
                    </div>
                  </div>
                </div>
              ))}
              <button className="profile-add-action-btn" onClick={() => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuer: '', issue_date: '', url: '' }] }))}>
                + Add Certification
              </button>
            </div>
          );
        case 7:
          return (
            <div className="manual-entry-step">
              <h3><ReviewIcon size={24} className="inline-icon" /> Review & Submit</h3>
              <p>Review your profile before submitting</p>
              <div className="review-sections">
                <div className="review-section">
                  <h4>Personal Information</h4>
                  <p><strong>Name:</strong> {formData.contact_info.name || 'Not provided'}</p>
                  <p><strong>Email:</strong> {formData.contact_info.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {formData.contact_info.phone || 'Not provided'}</p>
                </div>
                <div className="review-section">
                  <h4>Career Overview</h4>
                  <p><strong>Title:</strong> {formData.career_overview.title || 'Not provided'}</p>
                  <p><strong>Experience:</strong> {formData.career_overview.experience || 'Not provided'}</p>
                </div>
                <div className="review-section">
                  <h4>Education</h4>
                  <p>{formData.education.length} education entries</p>
                </div>
                <div className="review-section">
                  <h4>Experience</h4>
                  <p>{formData.experience.length} work experiences</p>
                </div>
                <div className="review-section">
                  <h4>Skills</h4>
                  <p>{formData.skills.length} skills added</p>
                </div>
                <div className="review-section">
                  <h4>Projects</h4>
                  <p>{formData.projects.length} projects</p>
                </div>
                <div className="review-section">
                  <h4>Certifications</h4>
                  <p>{formData.certifications.length} certifications</p>
                </div>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="manual-entry-container">
        <div className="manual-entry-header">
          <button className="back-button" onClick={() => setCurrentView('selection')}>
            ← Back to Selection
          </button>
          <h2>Manual Profile Entry</h2>
          <p>Complete all 8 steps to build your professional profile</p>
        </div>

        <div className="manual-entry-progress">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div key={step.id} className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}>
                <div className="step-number">{index < currentStep ? '✓' : index + 1}</div>
                <div className="step-label">{step.name}</div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="manual-entry-content">
          {renderStep()}
        </div>

        <div className="manual-entry-navigation">
          <button className="nav-button secondary" onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
            ← Previous
          </button>
          <div className="step-indicator">Step {currentStep + 1} of {steps.length}</div>
          {currentStep < steps.length - 1 ? (
            <button className="nav-button primary" onClick={() => setCurrentStep(currentStep + 1)}>
              Next →
            </button>
          ) : (
            <button className="nav-button primary" onClick={handleSubmit}>
              Save Profile
            </button>
          )}
        </div>
      </div>
    );
  };

  // Profile Editor Component
  const ProfileEditor = () => {
    const [activeProfile, setActiveProfile] = useState(profileData || {
      contact_info: { name: 'Unknown', email: '', phone: '' },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: []
    });

    // Update activeProfile when profileData changes
    useEffect(() => {
      if (profileData) {
        setActiveProfile(profileData);
      }
    }, [profileData]);

    const handleSectionEdit = (sectionName, newContent) => {
      setActiveProfile(prev => ({
        ...prev,
        [sectionName]: newContent
      }));
    };

    const handleCustomSectionEdit = (sectionName, newContent) => {
      setCustomSections(prev => ({
        ...prev,
        [sectionName]: newContent
      }));
    };

    const handleCustomSectionDelete = (sectionName) => {
      setCustomSections(prev => {
        const updated = { ...prev };
        delete updated[sectionName];
        return updated;
      });
    };

    const handleAddCustomSection = () => {
      if (!newSectionName.trim()) return;

      if (activeProfile[newSectionName] || customSections[newSectionName]) {
        alert('Section name already exists. Please choose a different name.');
        return;
      }

      setCustomSections(prev => ({
        ...prev,
        [newSectionName]: { content: 'Click edit to add content...' }
      }));

      setNewSectionName('');
      setShowAddSection(false);
    };

    const handleSaveProfile = async () => {
      setSaveStatus('saving');

      try {
        const token = localStorage.getItem('token');

        // Check if token is expired
        if (!token || isTokenExpired(token)) {
          handleAuthError(navigate);
          setSaveStatus('');
          return;
        }

        // Sanitize profile for saving: strip hidden fields if profile is parsed
        const isParsedUpload = activeProfile.source === 'azure_ai' || activeProfile.parsing_confidence;
        const hiddenFieldsBySection = {
          education: ['details'],
          projects: ['duration', 'role'],
          certifications: ['issuer', 'date', 'id', 'url'],
          achievements: ['description', 'date', 'issuer']
        };

        const sanitizeSection = (sectionKey, sectionData) => {
          if (!sectionData) return sectionData;
          const hid = hiddenFieldsBySection[sectionKey] || [];
          if (Array.isArray(sectionData)) {
            return sectionData.map(item => {
              if (!item || typeof item !== 'object') return item;
              const cleaned = { ...item };
              hid.forEach(k => { if (k in cleaned) delete cleaned[k]; });
              return cleaned;
            });
          }
          if (typeof sectionData === 'object') {
            const cleaned = { ...sectionData };
            hid.forEach(k => { if (k in cleaned) delete cleaned[k]; });
            return cleaned;
          }
          return sectionData;
        };

        let sanitized = { ...activeProfile };
        if (isParsedUpload) {
          // remove full sections
          delete sanitized.careerSummary;
          delete sanitized.languages;
          delete sanitized.parsing_confidence;
        }

        // sanitize subfields
        ['education', 'projects', 'certifications', 'achievements'].forEach(sec => {
          if (sanitized[sec]) sanitized[sec] = sanitizeSection(sec, sanitized[sec]);
        });

        const profilePayload = {
          ...sanitized,
          customSections,
          updatedAt: new Date().toISOString()
        };

        const response = await fetch('http://localhost:8000/api/profile/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_data: profilePayload })
        });

        if (response.ok) {
          setSaveStatus('saved');
          setRedirectCountdown(10);
        } else if (response.status === 401) {
          handleAuthError(navigate);
          setSaveStatus('');
        } else {
          throw new Error('Failed to save profile');
        }
      } catch (error) {
        console.error('Save error:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    };

    const handleRestart = () => {
      setCurrentView('selection');
      setProfileData({});
      setCustomSections({});
    };

    const getSectionIcon = (sectionName) => {
      const iconComponents = {
        personalInfo: <UserIcon size={16} />,
        careerOverview: <TargetIcon size={16} />,
        education: <GraduationIcon size={16} />,
        workExperience: <BriefcaseIcon size={16} />,
        skills: <SkillsIcon size={16} />,
        projects: <ProjectIcon size={16} />,
        certifications: <CertificateIcon size={16} />
      };
      return iconComponents[sectionName] || <DocumentIcon size={16} />;
    };

    return (
      <div className="profile-editor">
        {!activeProfile || Object.keys(activeProfile).length === 0 ? (
          <div className="editor-loading">
            <h2>
              <LoadingSpinner size={20} />
              Loading Profile Editor...
            </h2>
            <p>Setting up your profile for editing...</p>
          </div>
        ) : (
          <>
            <div className="editor-header">
              <h2>
                <DocumentIcon size={20} />
                Profile Editor
              </h2>
              <p>Review and edit your profile sections. You can modify any information or add custom sections.</p>



              <div className="editor-actions">
                <button className="save-button primary" onClick={handleSaveProfile}>
                  <SaveIcon size={16} />
                  Save Profile
                </button>
                <button className="restart-button secondary" onClick={handleRestart}>
                  <RetryIcon size={16} />
                  Start Over
                </button>
              </div>
            </div>

            <div className="editor-sections">
              {Object.entries(activeProfile).map(([sectionName, content]) => {
                // Skip meta fields
                if (sectionName === 'source' || sectionName === 'createdAt' || sectionName === 'updatedAt') {
                  return null;
                }

                // If profile came from Azure/Gemini (source azure_ai or has parsing_confidence), hide entire sections
                const isParsedUpload = activeProfile.source === 'azure_ai' || activeProfile.parsing_confidence;
                const skipSectionsForParsed = ['careerSummary', 'languages', 'parsing_confidence'];
                if (isParsedUpload && skipSectionsForParsed.includes(sectionName)) return null;

                return (
                  <EditableSection
                    key={sectionName}
                    title={sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    content={content}
                    icon={getSectionIcon(sectionName)}
                    onEdit={(newContent) => handleSectionEdit(sectionName, newContent)}
                    onDelete={() => { }} // Standard sections cannot be deleted
                    isCustom={false}
                    sectionKey={sectionName}
                    hideParsedFields={isParsedUpload}
                  />
                );
              })}

              {Object.entries(customSections).map(([sectionName, content]) => (
                <EditableSection
                  key={sectionName}
                  title={sectionName}
                  content={content}
                  icon={<DocumentIcon size={16} />}
                  onEdit={(newContent) => handleCustomSectionEdit(sectionName, newContent)}
                  onDelete={() => handleCustomSectionDelete(sectionName)}
                  isCustom={true}
                />
              ))}

              {/* Only show Add Custom Section if data wasn't loaded from resume upload */}
              {(!profileData?.parsing_confidence || profileData?.parsing_confidence === 0) && (
                <div className="add-section-container">
                  {!showAddSection ? (
                    <button
                      className="profile-add-action-btn"
                      onClick={() => setShowAddSection(true)}
                    >
                      Add Custom Section
                    </button>
                  ) : (
                    <div className="add-section-form">
                      <h4>Add New Section</h4>
                      <p>Create a custom section for additional information</p>

                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="Section name (e.g., Awards, Publications, Hobbies)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCustomSection();
                          } else if (e.key === 'Escape') {
                            setShowAddSection(false);
                            setNewSectionName('');
                          }
                        }}
                      />

                      {newSectionName && (activeProfile[newSectionName] || customSections[newSectionName]) && (
                        <p className="error-message">Section name already exists</p>
                      )}

                      <div className="add-section-actions">
                        <button
                          className="profile-add-action-btn"
                          onClick={handleAddCustomSection}
                          disabled={!newSectionName.trim() || activeProfile[newSectionName] || customSections[newSectionName]}
                        >
                          Add Section
                        </button>
                        <button
                          className="profile-add-action-btn"
                          onClick={() => {
                            setShowAddSection(false);
                            setNewSectionName('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>


          </>
        )}
      </div>
    );
  };

  // Main Render Logic
  const renderCurrentView = () => {
    switch (currentView) {
      case 'selection':
        return <ProfileModeSelection />;
      case 'upload':
        return <ResumeUpload />;
      case 'manual-entry':
        return <ManualEntryForm />;
      case 'editor':
        return <ProfileEditor />;
      default:
        return <ProfileModeSelection />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-builder-container">
        {renderCurrentView()}
      </div>
      {saveStatus && (
        <div className={`save-notification ${saveStatus}`}>
          {saveStatus === 'saving' && 'Saving profile...'}
          {saveStatus === 'saved' && (
            <div className="save-success-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div>Profile saved successfully!</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '5px' }}>
                {redirectCountdown > 0 && (
                  <div className="redirect-countdown" style={{ fontSize: '0.85em', fontWeight: 'normal' }}>
                    Redirecting in {redirectCountdown} seconds...
                  </div>
                )}
                {showGoToProfile && (
                  <button
                    className="goto-profile-button"
                    onClick={() => navigate('/profile')}
                  >
                    View my profile
                  </button>
                )}
              </div>
            </div>
          )}
          {saveStatus === 'error' && 'Failed to save profile'}
        </div>
      )}
    </>
  );
};

export default ProfileBuilder;
