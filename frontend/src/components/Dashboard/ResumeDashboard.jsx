import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import './ResumeDashboard.css';

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
const EditableSection = ({ title, content, icon, onEdit, onDelete, isCustom = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onEdit(editedContent);
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
    if (title.toLowerCase().includes('experience')) {
      setEditedContent([...editedContent, {
        title: '',
        company: '',
        duration: '',
        responsibilities: []
      }]);
    } else if (title.toLowerCase().includes('education')) {
      setEditedContent([...editedContent, {
        degree: '',
        institution: '',
        year: '',
        gpa: ''
      }]);
    } else if (title.toLowerCase().includes('project')) {
      setEditedContent([...editedContent, {
        name: '',
        description: '',
        technologies: [],
        link: ''
      }]);
    } else if (title.toLowerCase().includes('certification')) {
      setEditedContent([...editedContent, {
        name: '',
        issuer: '',
        date: '',
        id: ''
      }]);
    } else if (title.toLowerCase().includes('achievement')) {
      setEditedContent([...editedContent, {
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
              ❌ Remove
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
      <button type="button" className="add-item" onClick={addArrayItem}>
        ➕ Add Experience
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
              ❌ Remove
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
        </div>
      ))}
      <button type="button" className="add-item" onClick={addArrayItem}>
        ➕ Add Education
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
              ❌ Remove
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
      <button type="button" className="add-item" onClick={addArrayItem}>
        ➕ Add Project
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
              ❌ Remove
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
        </div>
      ))}
      <button type="button" className="add-item" onClick={addArrayItem}>
        ➕ Add Certification
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
              ❌ Remove
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
        </div>
      ))}
      <button type="button" className="add-item" onClick={addArrayItem}>
        ➕ Add Achievement
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
    if (Array.isArray(content)) {
      if (content.length === 0) {
        return <p className="no-content">No items added yet</p>;
      }
      return content.map((item, index) => (
        <div key={index} className="preview-item">
          {typeof item === 'object' ? (
            Object.entries(item).map(([key, value]) => (
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
      return Object.entries(content).map(([key, value]) => (
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
                💾 Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                ❌ Cancel
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
  // State Management
  const [currentView, setCurrentView] = useState('selection'); // selection, upload, manual, editor
  const [profileData, setProfileData] = useState({});
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualFormStep, setManualFormStep] = useState(0);
  const [manualFormData, setManualFormData] = useState({
    personalInfo: {},
    careerOverview: {},
    education: [],
    workExperience: [],
    skills: { technical: [], soft: [], languages: [] },
    projects: [],
    certifications: []
  });
  const [customSections, setCustomSections] = useState({});
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // saving, saved, error

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Form Steps Configuration
  const formSteps = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'career', label: 'Career Overview', icon: '🎯' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'certifications', label: 'Certifications', icon: '📜' },
    { id: 'review', label: 'Review', icon: '👁️' }
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
          <div className="option-icon">🤖</div>
          <h3>AI-Powered Resume Upload</h3>
          <p>Upload your existing resume in PDF or DOCX format and let our advanced AI extract and structure your information automatically using natural language processing.</p>
          
          <div className="option-features">
            <span>PDF & DOCX Support</span>
            <span>NLP Processing</span>
            <span>Auto-Extract</span>
            <span>Smart Parsing</span>
          </div>
          
          <button className="option-button primary">
            📄 Upload Resume
          </button>
        </div>

        <div className="profile-option" onClick={() => setCurrentView('manual')}>
          <div className="option-icon">✍️</div>
          <h3>Manual Profile Creation</h3>
          <p>Build your profile step-by-step using our guided form system. Perfect for creating a fresh profile or when you want complete control over your information.</p>
          
          <div className="option-features">
            <span>8-Step Process</span>
            <span>Custom Sections</span>
            <span>Progress Tracking</span>
            <span>Complete Control</span>
          </div>
          
          <button className="option-button secondary">
            📝 Create Manually
          </button>
        </div>
      </div>

      <div className="profile-benefits">
        <h3>Why Create Your Profile?</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <span>Tailored career opportunities</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📈</span>
            <span>Track your professional growth</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🤝</span>
            <span>Connect with relevant employers</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💡</span>
            <span>Get personalized recommendations</span>
          </div>
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
        handleFileUpload(files[0]);
      }
    };

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
    };

    const handleFileUpload = async (file) => {
      // Validate file type
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

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadState('error');
        setErrorMessage('File size too large. Please upload a file smaller than 10MB.');
        return;
      }

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
        'Extracting text content...',
        'Parsing personal information...',
        'Identifying work experience...',
        'Extracting education details...',
        'Analyzing skills and competencies...',
        'Structuring profile data...'
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
        const response = await fetch('http://localhost:8000/api/resume/parse', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Resume parsing result:', result); // Debug log
          
          // Ensure we have profile data or create empty structure
          const parsedProfileData = result.profile_data || {
            contact_info: { name: 'Unknown', email: '', phone: '' },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            achievements: []
          };
          
          setProfileData(parsedProfileData);
          setUploadState('success');
          
          // Auto-redirect to editor after 3 seconds
          setTimeout(() => {
            setCurrentView('editor');
          }, 3000);
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
            ← Back to Options
          </button>
          
          <div className="upload-header">
            <h2>Upload Your Resume</h2>
            <p>Upload your resume in PDF or Word format and let our AI extract your professional information</p>
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
              <div className="drop-zone-content">
                <div className="upload-icon">📄</div>
                <h3>Drag & Drop Your Resume</h3>
                <p>or click to browse files</p>
                
                <div className="file-requirements">
                  <span>PDF</span>
                  <span>DOCX</span>
                  <span>DOC</span>
                  <span>Max 10MB</span>
                </div>
              </div>
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
            <div className="progress-icon">⬆️</div>
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
            <div className="progress-icon">🤖</div>
            <h3>Processing Your Resume</h3>
            <p>Our AI is analyzing your resume and extracting key information...</p>
            
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
            <div className="success-icon">✅</div>
            <h3>Resume Processed Successfully!</h3>
            <p>We've extracted and structured your professional information</p>
            
            <div className="success-stats">
              <span>📊 Profile Created</span>
              <span>🎯 Skills Identified</span>
              <span>💼 Experience Mapped</span>
              <span>🎓 Education Parsed</span>
            </div>
            
            <div className="redirect-message">
              Redirecting to profile editor in 3 seconds...
            </div>
          </div>
        </div>
      );
    }

    if (uploadState === 'error') {
      return (
        <div className="resume-upload-container">
          <div className="upload-error">
            <div className="error-icon">❌</div>
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
                🔄 Try Again
              </button>
              <button className="manual-button" onClick={handleManualFallback}>
                ✍️ Create Manually Instead
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Manual Form Component
  const ManualForm = () => {
    const updateFormData = (section, data) => {
      setManualFormData(prev => ({
        ...prev,
        [section]: data
      }));
    };

    const addArrayItem = (section, item) => {
      setManualFormData(prev => ({
        ...prev,
        [section]: [...prev[section], item]
      }));
    };

    const removeArrayItem = (section, index) => {
      setManualFormData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
    };

    const updateArrayItem = (section, index, item) => {
      setManualFormData(prev => ({
        ...prev,
        [section]: prev[section].map((existing, i) => i === index ? item : existing)
      }));
    };

    const canProceed = () => {
      switch (manualFormStep) {
        case 0: // Personal Info
          return manualFormData.personalInfo.fullName && manualFormData.personalInfo.email;
        case 1: // Career Overview
          return manualFormData.careerOverview.title;
        case 7: // Review
          return true;
        default:
          return true;
      }
    };

    const calculateCompleteness = () => {
      let totalFields = 0;
      let completedFields = 0;

      // Personal Info (required)
      totalFields += 2; // name, email
      if (manualFormData.personalInfo.fullName) completedFields++;
      if (manualFormData.personalInfo.email) completedFields++;

      // Career Overview
      totalFields += 2;
      if (manualFormData.careerOverview.title) completedFields++;
      if (manualFormData.careerOverview.summary) completedFields++;

      // Education, Experience, Projects, Certifications
      totalFields += 4;
      if (manualFormData.education.length > 0) completedFields++;
      if (manualFormData.workExperience.length > 0) completedFields++;
      if (manualFormData.projects.length > 0) completedFields++;
      if (manualFormData.certifications.length > 0) completedFields++;

      // Skills
      totalFields += 1;
      if (manualFormData.skills.technical.length > 0 || 
          manualFormData.skills.soft.length > 0 || 
          manualFormData.skills.languages.length > 0) {
        completedFields++;
      }

      return Math.round((completedFields / totalFields) * 100);
    };

    const handleSaveProfile = async () => {
      setSaveStatus('saving');
      
      try {
        const token = localStorage.getItem('token');
        const profilePayload = {
          ...manualFormData,
          customSections,
          createdAt: new Date().toISOString(),
          source: 'manual'
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
          setProfileData(profilePayload);
          setTimeout(() => {
            setCurrentView('editor');
          }, 2000);
        } else {
          throw new Error('Failed to save profile');
        }
      } catch (error) {
        console.error('Save error:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    };

    // Personal Info Step
    const PersonalInfoStep = () => (
      <div className="form-step">
        <h3>👤 Personal Information</h3>
        <p>Let's start with your basic information</p>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={manualFormData.personalInfo.fullName || ''}
              onChange={(e) => updateFormData('personalInfo', {
                ...manualFormData.personalInfo,
                fullName: e.target.value
              })}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={manualFormData.personalInfo.email || ''}
              onChange={(e) => updateFormData('personalInfo', {
                ...manualFormData.personalInfo,
                email: e.target.value
              })}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={manualFormData.personalInfo.phone || ''}
              onChange={(e) => updateFormData('personalInfo', {
                ...manualFormData.personalInfo,
                phone: e.target.value
              })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={manualFormData.personalInfo.location || ''}
              onChange={(e) => updateFormData('personalInfo', {
                ...manualFormData.personalInfo,
                location: e.target.value
              })}
              placeholder="City, State/Country"
            />
          </div>

          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              type="url"
              value={manualFormData.personalInfo.linkedin || ''}
              onChange={(e) => updateFormData('personalInfo', {
                ...manualFormData.personalInfo,
                linkedin: e.target.value
              })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="form-group">
            <label>Website/Portfolio</label>
            <input
              type="url"
              value={manualFormData.personalInfo.website || ''}
              onChange={(e) => updateFormData('personalInfo', {
                ...manualFormData.personalInfo,
                website: e.target.value
              })}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>
    );

    // Career Overview Step
    const CareerOverviewStep = () => (
      <div className="form-step">
        <h3>🎯 Career Overview</h3>
        <p>Tell us about your professional background and goals</p>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Current Job Title *</label>
            <input
              type="text"
              value={manualFormData.careerOverview.title || ''}
              onChange={(e) => updateFormData('careerOverview', {
                ...manualFormData.careerOverview,
                title: e.target.value
              })}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <select
              value={manualFormData.careerOverview.experience || ''}
              onChange={(e) => updateFormData('careerOverview', {
                ...manualFormData.careerOverview,
                experience: e.target.value
              })}
            >
              <option value="">Select experience level</option>
              <option value="0-1">0-1 years (Entry Level)</option>
              <option value="2-4">2-4 years (Junior)</option>
              <option value="5-7">5-7 years (Mid-Level)</option>
              <option value="8-12">8-12 years (Senior)</option>
              <option value="13+">13+ years (Expert/Lead)</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Professional Summary</label>
            <textarea
              rows={4}
              value={manualFormData.careerOverview.summary || ''}
              onChange={(e) => updateFormData('careerOverview', {
                ...manualFormData.careerOverview,
                summary: e.target.value
              })}
              placeholder="A brief overview of your professional background, key achievements, and career objectives..."
            />
          </div>

          <div className="form-group">
            <label>Industry</label>
            <input
              type="text"
              value={manualFormData.careerOverview.industry || ''}
              onChange={(e) => updateFormData('careerOverview', {
                ...manualFormData.careerOverview,
                industry: e.target.value
              })}
              placeholder="e.g., Technology, Healthcare, Finance"
            />
          </div>

          <div className="form-group">
            <label>Career Level</label>
            <select
              value={manualFormData.careerOverview.level || ''}
              onChange={(e) => updateFormData('careerOverview', {
                ...manualFormData.careerOverview,
                level: e.target.value
              })}
            >
              <option value="">Select career level</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead/Principal</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
      </div>
    );

    // Education Step
    const EducationStep = () => (
      <div className="form-step">
        <h3>🎓 Education</h3>
        <p>Add your educational background</p>
        
        {manualFormData.education.map((edu, index) => (
          <div key={index} className="form-item">
            <div className="item-header">
              <h4>Education #{index + 1}</h4>
              <button 
                className="remove-button"
                onClick={() => removeArrayItem('education', index)}
              >
                Remove
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  value={edu.institution || ''}
                  onChange={(e) => updateArrayItem('education', index, {
                    ...edu,
                    institution: e.target.value
                  })}
                  placeholder="University/College name"
                />
              </div>

              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={edu.degree || ''}
                  onChange={(e) => updateArrayItem('education', index, {
                    ...edu,
                    degree: e.target.value
                  })}
                  placeholder="e.g., Bachelor of Science"
                />
              </div>

              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  value={edu.field || ''}
                  onChange={(e) => updateArrayItem('education', index, {
                    ...edu,
                    field: e.target.value
                  })}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  min="1950"
                  max="2030"
                  value={edu.year || ''}
                  onChange={(e) => updateArrayItem('education', index, {
                    ...edu,
                    year: e.target.value
                  })}
                  placeholder="2023"
                />
              </div>

              <div className="form-group">
                <label>GPA (Optional)</label>
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => updateArrayItem('education', index, {
                    ...edu,
                    gpa: e.target.value
                  })}
                  placeholder="3.8/4.0"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={edu.location || ''}
                  onChange={(e) => updateArrayItem('education', index, {
                    ...edu,
                    location: e.target.value
                  })}
                  placeholder="City, State/Country"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          className="add-button"
          onClick={() => addArrayItem('education', {
            institution: '',
            degree: '',
            field: '',
            year: '',
            gpa: '',
            location: ''
          })}
        >
          + Add Education
        </button>
      </div>
    );

    // Work Experience Step
    const WorkExperienceStep = () => (
      <div className="form-step">
        <h3>💼 Work Experience</h3>
        <p>Add your professional work experience</p>
        
        {manualFormData.workExperience.map((exp, index) => (
          <div key={index} className="form-item">
            <div className="item-header">
              <h4>Experience #{index + 1}</h4>
              <button 
                className="remove-button"
                onClick={() => removeArrayItem('workExperience', index)}
              >
                Remove
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={exp.title || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, {
                    ...exp,
                    title: e.target.value
                  })}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={exp.company || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, {
                    ...exp,
                    company: e.target.value
                  })}
                  placeholder="Company name"
                />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="month"
                  value={exp.startDate || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, {
                    ...exp,
                    startDate: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="month"
                  value={exp.endDate || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, {
                    ...exp,
                    endDate: e.target.value
                  })}
                  disabled={exp.current}
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exp.current || false}
                    onChange={(e) => updateArrayItem('workExperience', index, {
                      ...exp,
                      current: e.target.checked,
                      endDate: e.target.checked ? '' : exp.endDate
                    })}
                  />
                  Current position
                </label>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={exp.location || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, {
                    ...exp,
                    location: e.target.value
                  })}
                  placeholder="City, State/Country"
                />
              </div>

              <div className="form-group">
                <label>Employment Type</label>
                <select
                  value={exp.type || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, {
                    ...exp,
                    type: e.target.value
                  })}
                >
                  <option value="">Select type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  rows={4}
                  value={exp.description || ''}
                  onChange={(e) => updateArrayItem('workExperience', index, {
                    ...exp,
                    description: e.target.value
                  })}
                  placeholder="Describe your responsibilities, achievements, and key contributions..."
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          className="add-button"
          onClick={() => addArrayItem('workExperience', {
            title: '',
            company: '',
            startDate: '',
            endDate: '',
            location: '',
            type: '',
            description: '',
            current: false
          })}
        >
          + Add Work Experience
        </button>
      </div>
    );

    // Skills Step
    const SkillsStep = () => (
      <div className="form-step">
        <h3>⚡ Skills</h3>
        <p>Add your technical skills, soft skills, and languages</p>
        
        <div className="skills-section">
          <div className="form-group">
            <label>Technical Skills</label>
            <SkillTagInput
              skills={manualFormData.skills.technical}
              onSkillsChange={(skills) => updateFormData('skills', {
                ...manualFormData.skills,
                technical: skills
              })}
              placeholder="Add technical skills (e.g., JavaScript, Python, React)..."
            />
          </div>

          <div className="form-group">
            <label>Soft Skills</label>
            <SkillTagInput
              skills={manualFormData.skills.soft}
              onSkillsChange={(skills) => updateFormData('skills', {
                ...manualFormData.skills,
                soft: skills
              })}
              placeholder="Add soft skills (e.g., Leadership, Communication, Problem-solving)..."
            />
          </div>

          <div className="form-group">
            <label>Languages</label>
            <SkillTagInput
              skills={manualFormData.skills.languages}
              onSkillsChange={(skills) => updateFormData('skills', {
                ...manualFormData.skills,
                languages: skills
              })}
              placeholder="Add languages (e.g., English, Spanish, Mandarin)..."
            />
          </div>
        </div>
      </div>
    );

    // Projects Step
    const ProjectsStep = () => (
      <div className="form-step">
        <h3>🚀 Projects</h3>
        <p>Showcase your notable projects and achievements</p>
        
        {manualFormData.projects.map((project, index) => (
          <div key={index} className="form-item">
            <div className="item-header">
              <h4>Project #{index + 1}</h4>
              <button 
                className="remove-button"
                onClick={() => removeArrayItem('projects', index)}
              >
                Remove
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={project.name || ''}
                  onChange={(e) => updateArrayItem('projects', index, {
                    ...project,
                    name: e.target.value
                  })}
                  placeholder="Project title"
                />
              </div>

              <div className="form-group">
                <label>Technologies Used</label>
                <input
                  type="text"
                  value={project.technologies || ''}
                  onChange={(e) => updateArrayItem('projects', index, {
                    ...project,
                    technologies: e.target.value
                  })}
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>

              <div className="form-group">
                <label>Project URL</label>
                <input
                  type="url"
                  value={project.url || ''}
                  onChange={(e) => updateArrayItem('projects', index, {
                    ...project,
                    url: e.target.value
                  })}
                  placeholder="https://project-demo.com"
                />
              </div>

              <div className="form-group">
                <label>GitHub Repository</label>
                <input
                  type="url"
                  value={project.github || ''}
                  onChange={(e) => updateArrayItem('projects', index, {
                    ...project,
                    github: e.target.value
                  })}
                  placeholder="https://github.com/username/project"
                />
              </div>

              <div className="form-group full-width">
                <label>Project Description</label>
                <textarea
                  rows={4}
                  value={project.description || ''}
                  onChange={(e) => updateArrayItem('projects', index, {
                    ...project,
                    description: e.target.value
                  })}
                  placeholder="Describe the project, your role, challenges solved, and impact..."
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          className="add-button"
          onClick={() => addArrayItem('projects', {
            name: '',
            technologies: '',
            url: '',
            github: '',
            description: ''
          })}
        >
          + Add Project
        </button>
      </div>
    );

    // Certifications Step
    const CertificationsStep = () => (
      <div className="form-step">
        <h3>📜 Certifications</h3>
        <p>Add your professional certifications and achievements</p>
        
        {manualFormData.certifications.map((cert, index) => (
          <div key={index} className="form-item">
            <div className="item-header">
              <h4>Certification #{index + 1}</h4>
              <button 
                className="remove-button"
                onClick={() => removeArrayItem('certifications', index)}
              >
                Remove
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Certification Name</label>
                <input
                  type="text"
                  value={cert.name || ''}
                  onChange={(e) => updateArrayItem('certifications', index, {
                    ...cert,
                    name: e.target.value
                  })}
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>

              <div className="form-group">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  value={cert.issuer || ''}
                  onChange={(e) => updateArrayItem('certifications', index, {
                    ...cert,
                    issuer: e.target.value
                  })}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>

              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="month"
                  value={cert.issueDate || ''}
                  onChange={(e) => updateArrayItem('certifications', index, {
                    ...cert,
                    issueDate: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  type="month"
                  value={cert.expirationDate || ''}
                  onChange={(e) => updateArrayItem('certifications', index, {
                    ...cert,
                    expirationDate: e.target.value
                  })}
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cert.noExpiration || false}
                    onChange={(e) => updateArrayItem('certifications', index, {
                      ...cert,
                      noExpiration: e.target.checked,
                      expirationDate: e.target.checked ? '' : cert.expirationDate
                    })}
                  />
                  No expiration
                </label>
              </div>

              <div className="form-group">
                <label>Credential ID</label>
                <input
                  type="text"
                  value={cert.credentialId || ''}
                  onChange={(e) => updateArrayItem('certifications', index, {
                    ...cert,
                    credentialId: e.target.value
                  })}
                  placeholder="Certification ID or number"
                />
              </div>

              <div className="form-group">
                <label>Credential URL</label>
                <input
                  type="url"
                  value={cert.url || ''}
                  onChange={(e) => updateArrayItem('certifications', index, {
                    ...cert,
                    url: e.target.value
                  })}
                  placeholder="Link to verify certification"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          className="add-button"
          onClick={() => addArrayItem('certifications', {
            name: '',
            issuer: '',
            issueDate: '',
            expirationDate: '',
            credentialId: '',
            url: '',
            noExpiration: false
          })}
        >
          + Add Certification
        </button>
      </div>
    );

    // Review Step
    const ReviewStep = () => {
      const completeness = calculateCompleteness();
      
      return (
        <div className="form-step">
          <h3>👁️ Review Your Profile</h3>
          <p>Review your information before saving</p>
          
          <div className="completeness-indicator">
            <h4>Profile Completeness: {completeness}%</h4>
            <div className="completeness-bar">
              <div 
                className="completeness-fill" 
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
          </div>

          <div className="profile-preview">
            <div className="preview-section">
              <h4>📊 Profile Statistics</h4>
              <div className="preview-stats">
                <div className="stat-item">
                  <span className="stat-number">{manualFormData.education.length}</span>
                  <span className="stat-label">Education</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{manualFormData.workExperience.length}</span>
                  <span className="stat-label">Experience</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{manualFormData.skills.technical.length + manualFormData.skills.soft.length}</span>
                  <span className="stat-label">Skills</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{manualFormData.projects.length}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{manualFormData.certifications.length}</span>
                  <span className="stat-label">Certifications</span>
                </div>
              </div>
            </div>

            <div className="preview-section">
              <h4>👤 Personal Information</h4>
              <div className="preview-content">
                <p><strong>Name:</strong> {manualFormData.personalInfo.fullName || 'Not provided'}</p>
                <p><strong>Email:</strong> {manualFormData.personalInfo.email || 'Not provided'}</p>
                <p><strong>Phone:</strong> {manualFormData.personalInfo.phone || 'Not provided'}</p>
                <p><strong>Location:</strong> {manualFormData.personalInfo.location || 'Not provided'}</p>
              </div>
            </div>

            <div className="preview-section">
              <h4>🎯 Career Overview</h4>
              <div className="preview-content">
                <p><strong>Title:</strong> {manualFormData.careerOverview.title || 'Not provided'}</p>
                <p><strong>Experience:</strong> {manualFormData.careerOverview.experience || 'Not provided'}</p>
                <p><strong>Industry:</strong> {manualFormData.careerOverview.industry || 'Not provided'}</p>
                {manualFormData.careerOverview.summary && (
                  <p><strong>Summary:</strong> {manualFormData.careerOverview.summary}</p>
                )}
              </div>
            </div>
          </div>

          {saveStatus && (
            <div className={`save-status ${saveStatus}`}>
              {saveStatus === 'saving' && (
                <>
                  <div className="loading-spinner"></div>
                  <span>Saving your profile...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <span>✅ Profile saved successfully!</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <span>❌ Failed to save profile. Please try again.</span>
                </>
              )}
            </div>
          )}
        </div>
      );
    };

    const renderCurrentStep = () => {
      switch (manualFormStep) {
        case 0: return <PersonalInfoStep />;
        case 1: return <CareerOverviewStep />;
        case 2: return <EducationStep />;
        case 3: return <WorkExperienceStep />;
        case 4: return <SkillsStep />;
        case 5: return <ProjectsStep />;
        case 6: return <CertificationsStep />;
        case 7: return <ReviewStep />;
        default: return <PersonalInfoStep />;
      }
    };

    return (
      <div className="manual-form-container">
        <button className="back-button" onClick={() => setCurrentView('selection')}>
          ← Back to Options
        </button>
        
        <div className="form-header">
          <h2>Create Your Profile</h2>
          <p>Follow the steps below to build your comprehensive professional profile</p>
        </div>

        <div className="form-steps">
          {formSteps.map((step, index) => (
            <div 
              key={step.id} 
              className={`step ${index < manualFormStep ? 'completed' : ''} ${index === manualFormStep ? 'active' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        <div className="form-content">
          {renderCurrentStep()}
        </div>

        <div className="form-navigation">
          <button 
            className="nav-button secondary"
            onClick={() => setManualFormStep(Math.max(0, manualFormStep - 1))}
            disabled={manualFormStep === 0}
          >
            ← Previous
          </button>
          
          <div className="step-indicator">
            Step {manualFormStep + 1} of {formSteps.length}
          </div>
          
          {manualFormStep < formSteps.length - 1 ? (
            <button 
              className="nav-button primary"
              onClick={() => setManualFormStep(manualFormStep + 1)}
              disabled={!canProceed()}
            >
              Next →
            </button>
          ) : (
            <button 
              className="nav-button primary"
              onClick={handleSaveProfile}
              disabled={saveStatus === 'saving' || !canProceed()}
            >
              💾 Save Profile
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
        const profilePayload = {
          ...activeProfile,
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
          setTimeout(() => setSaveStatus(''), 3000);
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
      const icons = {
        personalInfo: '👤',
        careerOverview: '🎯',
        education: '🎓',
        workExperience: '💼',
        skills: '⚡',
        projects: '🚀',
        certifications: '📜'
      };
      return icons[sectionName] || '📋';
    };

    return (
      <div className="profile-editor">
        {!activeProfile || Object.keys(activeProfile).length === 0 ? (
          <div className="editor-loading">
            <h2>🔄 Loading Profile Editor...</h2>
            <p>Setting up your profile for editing...</p>
          </div>
        ) : (
          <>
            <div className="editor-header">
              <h2>📝 Profile Editor</h2>
              <p>Review and edit your profile sections. You can modify any information or add custom sections.</p>
              
              <div className="editor-info">
                <span>Profile Source: {activeProfile.source || 'AI Upload'}</span>
                <span>Last Updated: {new Date().toLocaleDateString()}</span>
                <span>Sections: {Object.keys(activeProfile).length + Object.keys(customSections).length}</span>
              </div>
              
              <div className="editor-actions">
                <button className="save-button primary" onClick={handleSaveProfile}>
                  💾 Save Profile
                </button>
                <button className="restart-button secondary" onClick={handleRestart}>
                  🔄 Start Over
                </button>
              </div>
            </div>

            <div className="editor-sections">
              {Object.entries(activeProfile).map(([sectionName, content]) => {
            if (sectionName === 'source' || sectionName === 'createdAt' || sectionName === 'updatedAt') {
              return null;
            }
            
            return (
              <EditableSection
                key={sectionName}
                title={sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                content={content}
                icon={getSectionIcon(sectionName)}
                onEdit={(newContent) => handleSectionEdit(sectionName, newContent)}
                onDelete={() => {}} // Standard sections cannot be deleted
                isCustom={false}
              />
            );
          })}

          {Object.entries(customSections).map(([sectionName, content]) => (
            <EditableSection
              key={sectionName}
              title={sectionName}
              content={content}
              icon="📋"
              onEdit={(newContent) => handleCustomSectionEdit(sectionName, newContent)}
              onDelete={() => handleCustomSectionDelete(sectionName)}
              isCustom={true}
            />
          ))}

          <div className="add-section-container">
            {!showAddSection ? (
              <button 
                className="add-section-button"
                onClick={() => setShowAddSection(true)}
              >
                ➕ Add Custom Section
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
                    className="confirm-add-button"
                    onClick={handleAddCustomSection}
                    disabled={!newSectionName.trim() || activeProfile[newSectionName] || customSections[newSectionName]}
                  >
                    ✅ Add Section
                  </button>
                  <button 
                    className="cancel-add-button"
                    onClick={() => {
                      setShowAddSection(false);
                      setNewSectionName('');
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {saveStatus && (
          <div className={`save-notification ${saveStatus}`}>
            {saveStatus === 'saving' && 'Saving profile...'}
            {saveStatus === 'saved' && 'Profile saved successfully!'}
            {saveStatus === 'error' && 'Failed to save profile'}
          </div>
        )}
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
      case 'manual':
        return <ManualForm />;
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
    </>
  );
};

export default ProfileBuilder;
