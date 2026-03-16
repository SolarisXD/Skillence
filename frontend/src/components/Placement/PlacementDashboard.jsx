import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import { apiUrl } from '../../utils/api';
import './PlacementDashboard.css';

const API_BASE = apiUrl('/api');

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/* ─── Status badge helper ──────────────────── */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    upcoming: { label: 'Upcoming', className: 'badge-upcoming' },
    ongoing: { label: 'Ongoing', className: 'badge-ongoing' },
    completed: { label: 'Completed', className: 'badge-completed' },
    cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
  };
  const cfg = statusConfig[status] || { label: status, className: 'badge-default' };
  return <span className={`status-badge ${cfg.className}`}>{cfg.label}</span>;
};

/* ─── Create / Edit Drive Modal ──────────────── */
const DriveFormModal = ({ isOpen, onClose, onSave, drive = null }) => {
  const [form, setForm] = useState({
    company_name: '',
    role_title: '',
    jd_text: '',
    package_ctc: '',
    package_base: '',
    package_currency: 'INR',
    tenth_percent: '',
    twelfth_percent: '',
    min_cgpa: '',
    max_active_backlogs: '0',
    drive_date: '',
    application_deadline: '',
    status: 'upcoming',
  });
  const [jdMode, setJdMode] = useState('text'); // 'text' | 'pdf'
  const [jdFile, setJdFile] = useState(null);

  useEffect(() => {
    if (drive) {
      setForm({
        company_name: drive.company_name || '',
        role_title: drive.role_title || '',
        jd_text: '',
        package_ctc: drive.package?.ctc || '',
        package_base: drive.package?.base_salary || '',
        package_currency: drive.package?.role_type || 'INR',
        tenth_percent: drive.criteria?.min_tenth_percentage || '',
        twelfth_percent: drive.criteria?.min_twelfth_percentage || '',
        min_cgpa: drive.criteria?.min_ug_cgpa || '',
        max_active_backlogs: drive.criteria?.max_active_backlogs ?? '0',
        drive_date: drive.drive_date ? drive.drive_date.slice(0, 10) : '',
        application_deadline: drive.application_deadline ? drive.application_deadline.slice(0, 10) : '',
        status: drive.status || 'upcoming',
      });
      setJdMode('text');
      setJdFile(null);
    } else {
      setForm({
        company_name: '', role_title: '', jd_text: '', package_ctc: '', package_base: '',
        package_currency: 'INR', tenth_percent: '', twelfth_percent: '', min_cgpa: '',
        max_active_backlogs: '0', drive_date: '',
        application_deadline: '', status: 'upcoming',
      });
      setJdMode('text');
      setJdFile(null);
    }
  }, [drive, isOpen]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      company_name: form.company_name,
      role_title: form.role_title,
      package: {
        ctc: form.package_ctc || null,
        base_salary: form.package_base || null,
      },
      criteria: {
        min_tenth_percentage: form.tenth_percent ? parseFloat(form.tenth_percent) : null,
        min_twelfth_percentage: form.twelfth_percent ? parseFloat(form.twelfth_percent) : null,
        min_ug_cgpa: form.min_cgpa ? parseFloat(form.min_cgpa) : null,
        max_shortlist_count: 200,
      },
      drive_date: form.drive_date || null,
      application_deadline: form.application_deadline || null,
      status: form.status,
    };
    const jdText = jdMode === 'text' ? form.jd_text : null;
    const jdPdf = jdMode === 'pdf' ? jdFile : null;
    onSave(payload, jdText, jdPdf);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content drive-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{drive ? 'Edit Drive' : 'Create New Drive'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="drive-form">
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input name="company_name" value={form.company_name} onChange={handleChange} required placeholder="e.g. Google" />
            </div>
            <div className="form-group">
              <label>Role Title *</label>
              <input name="role_title" value={form.role_title} onChange={handleChange} required placeholder="e.g. Software Engineer" />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <div className="jd-mode-toggle">
              <button type="button" className={`jd-toggle-btn ${jdMode === 'text' ? 'active' : ''}`} onClick={() => setJdMode('text')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Paste Text
              </button>
              <button type="button" className={`jd-toggle-btn ${jdMode === 'pdf' ? 'active' : ''}`} onClick={() => setJdMode('pdf')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload PDF
              </button>
            </div>
            {jdMode === 'text' ? (
              <textarea name="jd_text" value={form.jd_text} onChange={handleChange} rows={4} placeholder="Paste the job description here..." />
            ) : (
              <div className="jd-file-upload">
                <label className="file-upload-area">
                  <input type="file" accept=".pdf" onChange={e => setJdFile(e.target.files?.[0] || null)} hidden />
                  {jdFile ? (
                    <div className="file-selected">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>{jdFile.name}</span>
                      <button type="button" className="remove-file" onClick={e => { e.preventDefault(); setJdFile(null); }}>&times;</button>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Click to select a JD PDF file</span>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CTC (LPA)</label>
              <input type="number" name="package_ctc" value={form.package_ctc} onChange={handleChange} step="0.1" placeholder="e.g. 12.0" />
            </div>
            <div className="form-group">
              <label>Base (LPA)</label>
              <input type="number" name="package_base" value={form.package_base} onChange={handleChange} step="0.1" placeholder="e.g. 10.0" />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select name="package_currency" value={form.package_currency} onChange={handleChange}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <h3 className="form-section-title">Eligibility Criteria</h3>
          <div className="form-row">
            <div className="form-group">
              <label>10th %</label>
              <input type="number" name="tenth_percent" value={form.tenth_percent} onChange={handleChange} step="0.1" placeholder="e.g. 60" />
            </div>
            <div className="form-group">
              <label>12th %</label>
              <input type="number" name="twelfth_percent" value={form.twelfth_percent} onChange={handleChange} step="0.1" placeholder="e.g. 60" />
            </div>
            <div className="form-group">
              <label>Min CGPA</label>
              <input type="number" name="min_cgpa" value={form.min_cgpa} onChange={handleChange} step="0.01" placeholder="e.g. 7.5" />
            </div>
            <div className="form-group">
              <label>Max Backlogs</label>
              <input type="number" name="max_active_backlogs" value={form.max_active_backlogs} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Drive Date</label>
              <input type="date" name="drive_date" value={form.drive_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Application Deadline</label>
              <input type="date" name="application_deadline" value={form.application_deadline} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{drive ? 'Update Drive' : 'Create Drive'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Shortlist Modal ──────────────────── */
const ShortlistModal = ({ isOpen, onClose, driveId }) => {
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [results, setResults] = useState(null);
  const [topN, setTopN] = useState(20);
  const [showNonShortlisted, setShowNonShortlisted] = useState(false);
  const [applicationsByUserId, setApplicationsByUserId] = useState({});
  const [statusUpdatingAppId, setStatusUpdatingAppId] = useState(null);
  const [skillsViewer, setSkillsViewer] = useState(null);
  const [profileViewer, setProfileViewer] = useState(null);
  const [loadingProfileUserId, setLoadingProfileUserId] = useState(null);

  const flattenSkills = (skillsValue) => {
    if (!skillsValue) return [];

    if (typeof skillsValue === 'string') {
      return skillsValue
        .split(/[;,|\n]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (Array.isArray(skillsValue)) {
      return skillsValue
        .flatMap((item) => {
          if (typeof item === 'string') return flattenSkills(item);
          if (item && typeof item === 'object') {
            return flattenSkills(item.skill_name || item.name || item.skill || '');
          }
          return [];
        })
        .filter(Boolean);
    }

    if (typeof skillsValue === 'object') {
      return Object.values(skillsValue)
        .flatMap((value) => flattenSkills(value))
        .filter(Boolean);
    }

    return [];
  };

  const toList = (value) => (Array.isArray(value) ? value : []);

  const normalizeSkillGroups = (skillsValue) => {
    if (!skillsValue || typeof skillsValue !== 'object' || Array.isArray(skillsValue)) {
      const fallback = flattenSkills(skillsValue);
      return fallback.length ? [{ label: 'Skills', values: fallback }] : [];
    }

    const groups = [
      { label: 'Technical Skills', values: flattenSkills(skillsValue.technical) },
      { label: 'Soft Skills', values: flattenSkills(skillsValue.soft) },
      { label: 'Tools', values: flattenSkills(skillsValue.tools) },
      { label: 'Languages', values: flattenSkills(skillsValue.languages) },
    ].filter((group) => group.values.length > 0);

    const knownKeys = new Set(['technical', 'soft', 'tools', 'languages']);
    const extraSkills = Object.entries(skillsValue)
      .filter(([key]) => !knownKeys.has(key))
      .flatMap(([, value]) => flattenSkills(value));

    if (extraSkills.length) {
      groups.push({ label: 'Other Skills', values: extraSkills });
    }

    return groups;
  };

  useEffect(() => {
    if (!isOpen || !driveId) {
      setResults(null);
      setShowNonShortlisted(false);
      setApplicationsByUserId({});
      setStatusUpdatingAppId(null);
      setSkillsViewer(null);
      setProfileViewer(null);
      setLoadingProfileUserId(null);
      return;
    }

    const fetchSavedShortlist = async () => {
      setLoadingSaved(true);
      try {
        const res = await fetch(`${API_BASE}/placement/drives/${driveId}/shortlist`, {
          headers: getHeaders(),
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (data?.exists && Array.isArray(data.students)) {
          setResults(data);
          setShowNonShortlisted(false);
          if (typeof data.top_n === 'number' && data.top_n > 0) {
            setTopN(data.top_n);
          }
        }
      } catch (err) {
        console.error('Failed to load saved shortlist:', err);
      } finally {
        setLoadingSaved(false);
      }
    };

    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_BASE}/placement/drives/${driveId}/applications`, {
          headers: getHeaders(),
        });

        if (!res.ok) {
          setApplicationsByUserId({});
          return;
        }

        const data = await res.json();
        const byUser = {};
        (data || []).forEach((app) => {
          if (app.user_id) {
            byUser[app.user_id] = app;
          }
        });
        setApplicationsByUserId(byUser);
      } catch (err) {
        console.error('Failed to load applications for shortlist:', err);
        setApplicationsByUserId({});
      }
    };

    fetchSavedShortlist();
    fetchApplications();
  }, [isOpen, driveId]);

  const updateStatus = async (appId, newStatus) => {
    setStatusUpdatingAppId(appId);
    try {
      const res = await fetch(`${API_BASE}/placement/applications/${appId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || 'Failed to update status');
        return;
      }

      setApplicationsByUserId((prev) => {
        const next = { ...prev };
        const match = Object.values(next).find((app) => app.id === appId);
        if (match?.user_id) {
          next[match.user_id] = { ...match, status: newStatus };
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Network error while updating status');
    } finally {
      setStatusUpdatingAppId(null);
    }
  };

  const runShortlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/placement/drives/${driveId}/shortlist`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ top_n: topN }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setShowNonShortlisted(false);
      } else {
        const err = await res.json();
        alert(err.detail || 'Shortlisting failed');
      }
    } catch (err) {
      alert('Network error during shortlisting');
    } finally {
      setLoading(false);
    }
  };

  const openProfileViewer = async (student) => {
    if (!student?.user_id) return;

    setLoadingProfileUserId(student.user_id);
    try {
      const res = await fetch(`${API_BASE}/placement/applicants/${student.user_id}/profile`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'Failed to load applicant profile');
        return;
      }

      const data = await res.json();
      setProfileViewer({
        ...data,
        display_name: student.student_name || data?.academics?.student_info?.name || student.user_id,
        register_number: student.register_number || data?.academics?.student_info?.register_number,
      });
    } catch (err) {
      console.error('Failed to load applicant profile:', err);
      alert('Network error while loading applicant profile');
    } finally {
      setLoadingProfileUserId(null);
    }
  };

  if (!isOpen) return null;

  const profileData = profileViewer?.profile_data || {};
  const contactInfo = profileData.personalInfo || profileData.contact_info || profileViewer?.contact_info || {};
  const experienceItems = toList(profileData.workExperience || profileData.experience);
  const educationItems = toList(profileData.education);
  const projectItems = toList(profileData.projects);
  const certificationItems = toList(profileData.certifications);
  const achievementItems = toList(profileData.achievements);
  const customSections = toList(profileData.customSections);
  const skillsGrouped = normalizeSkillGroups(profileData.skills);

  const academics = profileViewer?.academics || {};
  const studentInfo = academics.student_info || {};
  const academicScores = academics.academic_scores || {};
  const tenthPercentage = academics.tenth_percentage ?? academicScores.tenth_percentage;
  const twelfthPercentage = academics.twelfth_percentage ?? academicScores.twelfth_percentage;
  const cgpa = academics.cgpa ?? academicScores.cgpa;
  const activeBacklogs = academics.active_backlogs ?? academicScores.active_backlogs;
  const topAcademicSkills = Object.entries(academics.skill_profile || {})
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 20);

  const students = Array.isArray(results?.students) ? results.students : [];
  const shortlistedTarget = Number.isFinite(Number(results?.top_n))
    ? Number(results.top_n)
    : Number.isFinite(Number(topN))
      ? Number(topN)
      : 0;

  const isStudentShortlisted = (student, index) => {
    if (typeof student?.is_shortlisted === 'boolean') return student.is_shortlisted;
    if (typeof student?.shortlisted === 'boolean') return student.shortlisted;
    return index < shortlistedTarget;
  };

  const rankedRows = students.map((student, index) => ({
    student,
    rank: index + 1,
    shortlisted: isStudentShortlisted(student, index),
  }));

  const shortlistedRows = rankedRows.filter((row) => row.shortlisted);
  const nonShortlistedRows = rankedRows.filter((row) => !row.shortlisted);
  const shortlistedCount = Number.isFinite(Number(results?.shortlisted_count))
    ? Number(results.shortlisted_count)
    : shortlistedRows.length;
  const totalApplicants = Number.isFinite(Number(results?.total_ranked))
    ? Number(results.total_ranked)
    : rankedRows.length;

  const renderRow = ({ student, rank, shortlisted }) => {
    const application = applicationsByUserId[student.user_id];
    const matchedSkills = student.matched_skills || [];
    const scorePercentage = ((student.total_score || 0) * 100).toFixed(1);

    return (
      <tr key={student.user_id} className={shortlisted ? '' : 'shortlist-row-muted'}>
        <td className="rank-cell">#{rank}</td>
        <td>{student.register_number || '—'}</td>
        <td className="student-cell" title={student.student_name || student.user_id}>{student.student_name || student.user_id}</td>
        <td>{student.cgpa?.toFixed(2) || 'N/A'}</td>
        <td>
          <div className="score-metric">
            <span className="score-value">{scorePercentage}%</span>
            <span className="score-caption">Match</span>
          </div>
        </td>
        <td className="skills-cell">
          <div className="skills-cell-content">
            <div className="skills-pills shortlist-skill-preview">
              {matchedSkills.slice(0, 4).map((skill) => (
                <span key={skill} className="skill-pill">{skill}</span>
              ))}
              {matchedSkills.length > 4 && (
                <span className="skill-pill more">+{matchedSkills.length - 4}</span>
              )}
            </div>
            {matchedSkills.length > 0 ? (
              <div className="skills-cell-footer">
                <span className="skills-count">{matchedSkills.length} matched</span>
                <button
                  type="button"
                  className="shortlist-link-btn"
                  onClick={() => setSkillsViewer({
                    studentName: student.student_name || student.user_id,
                    skills: matchedSkills,
                  })}
                >
                  View all
                </button>
              </div>
            ) : (
              <span className="skills-empty">No skills matched</span>
            )}
          </div>
        </td>
        <td>
          <button
            type="button"
            className="shortlist-profile-btn"
            onClick={() => openProfileViewer(student)}
            disabled={loadingProfileUserId === student.user_id}
          >
            {loadingProfileUserId === student.user_id ? 'Loading...' : 'View Profile'}
          </button>
        </td>
        <td className="action-cell">
          {application ? (
            <select
              value={application.status || 'applied'}
              onChange={e => updateStatus(application.id, e.target.value)}
              className="status-select"
              disabled={statusUpdatingAppId === application.id}
            >
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          ) : (
            <span style={{ opacity: 0.75 }}>Not applied</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shortlist-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Shortlist Students</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="shortlist-content">
          {loadingSaved ? (
            <div className="loading-spinner-container"><div className="loading-spinner"></div></div>
          ) : !results ? (
            <div className="shortlist-config">
              <p>Rank students based on their skills, academic profile, and resume to find the best candidates for this drive.</p>
              <div className="form-group">
                <label>Top N students to shortlist</label>
                <input type="number" value={topN} onChange={e => setTopN(parseInt(e.target.value) || 20)} min={1} max={200} />
              </div>
              <button className="btn-primary" onClick={runShortlist} disabled={loading}>
                {loading ? 'Running...' : 'Run Shortlisting'}
              </button>
            </div>
          ) : (
            <div className="shortlist-results">
              <div className="shortlist-stats">
                <div className="stat-card">
                  <span className="stat-value">{totalApplicants}</span>
                  <span className="stat-label">Total Applicants</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{shortlistedCount}</span>
                  <span className="stat-label">Shortlisted</span>
                </div>
              </div>
              <div className="shortlist-table-container">
                <table className="shortlist-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Reg. No.</th>
                      <th>Student</th>
                      <th>CGPA</th>
                      <th>Match Score</th>
                      <th>Skills Matched</th>
                      <th>Profile</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortlistedRows.map((row) => renderRow(row))}
                    <tr>
                      <td colSpan={8} className="shortlist-divider-cell">
                        <button
                          type="button"
                          className="shortlist-divider-toggle"
                          onClick={() => setShowNonShortlisted((prev) => !prev)}
                        >
                          <span>Not Shortlisted ({nonShortlistedRows.length})</span>
                          <span>{showNonShortlisted ? 'Hide' : 'Show'}</span>
                        </button>
                      </td>
                    </tr>
                    {showNonShortlisted && nonShortlistedRows.map((row) => renderRow(row))}
                    {showNonShortlisted && nonShortlistedRows.length === 0 && (
                      <tr className="shortlist-row-muted">
                        <td colSpan={8} className="shortlist-empty-note">No students below shortlist cutoff.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button className="btn-secondary" onClick={() => setResults(null)} style={{ marginTop: '1rem' }}>
                Run Again
              </button>
            </div>
          )}
        </div>
      </div>

      {skillsViewer && (
        <div className="modal-overlay nested-modal" onClick={() => setSkillsViewer(null)}>
          <div className="modal-content shortlist-popup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Matched Skills — {skillsViewer.studentName}</h2>
              <button className="modal-close" onClick={() => setSkillsViewer(null)}>&times;</button>
            </div>
            <div className="shortlist-popup-body">
              <div className="skills-pills">
                {skillsViewer.skills.map((skill) => (
                  <span key={skill} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {profileViewer && (
        <div className="modal-overlay nested-modal" onClick={() => setProfileViewer(null)}>
          <div className="modal-content shortlist-popup-modal profile-popup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Applicant Profile — {profileViewer.display_name}</h2>
              <button className="modal-close" onClick={() => setProfileViewer(null)}>&times;</button>
            </div>
            <div className="shortlist-popup-body">
              <div className="shortlist-profile-layout">
                <section className="shortlist-profile-section">
                  <h4 className="popup-section-title">Basic Information</h4>
                  <div className="profile-grid">
                    <div><strong>Name:</strong> {profileViewer.display_name || studentInfo.name || contactInfo.fullName || contactInfo.name || '—'}</div>
                    <div><strong>Reg. No.:</strong> {profileViewer.register_number || studentInfo.register_number || '—'}</div>
                    <div><strong>Email:</strong> {contactInfo.email || '—'}</div>
                    <div><strong>Phone:</strong> {contactInfo.phone || '—'}</div>
                    <div><strong>Location:</strong> {contactInfo.location || studentInfo.campus || '—'}</div>
                    <div><strong>Program:</strong> {studentInfo.program || '—'}</div>
                  </div>
                </section>

                <section className="shortlist-profile-section">
                  <h4 className="popup-section-title">Academic Summary</h4>
                  <div className="profile-grid">
                    <div><strong>CGPA:</strong> {cgpa ?? '—'}</div>
                    <div><strong>10th %:</strong> {tenthPercentage ?? '—'}</div>
                    <div><strong>12th %:</strong> {twelfthPercentage ?? '—'}</div>
                    <div><strong>Backlogs:</strong> {activeBacklogs ?? '—'}</div>
                  </div>
                </section>

                {!!educationItems.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Education</h4>
                    <div className="profile-item-list">
                      {educationItems.map((edu, index) => (
                        <div key={`edu-${index}`} className="profile-item-card">
                          <div className="profile-item-title">{edu.degree || 'Degree'}{edu.specialization ? ` — ${edu.specialization}` : ''}</div>
                          <div className="profile-item-meta">{edu.institution || 'Institution'}{edu.location ? ` • ${edu.location}` : ''}</div>
                          <div className="profile-item-meta">{edu.year || edu.duration || '—'}{edu.gpa ? ` • GPA/CGPA: ${edu.gpa}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!experienceItems.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Work Experience</h4>
                    <div className="profile-item-list">
                      {experienceItems.map((exp, index) => (
                        <div key={`exp-${index}`} className="profile-item-card">
                          <div className="profile-item-title">{exp.position || exp.title || 'Role'}</div>
                          <div className="profile-item-meta">{exp.company || 'Company'}{exp.location ? ` • ${exp.location}` : ''}</div>
                          <div className="profile-item-meta">{exp.duration || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!projectItems.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Projects</h4>
                    <div className="profile-item-list">
                      {projectItems.map((project, index) => (
                        <div key={`proj-${index}`} className="profile-item-card">
                          <div className="profile-item-title">{project.name || project.title || 'Project'}</div>
                          {project.description && <div className="profile-item-meta">{project.description}</div>}
                          {!!flattenSkills(project.technologies).length && (
                            <div className="skills-pills profile-section-pills">
                              {flattenSkills(project.technologies).map((technology, techIndex) => (
                                <span key={`project-tech-${index}-${techIndex}`} className="skill-pill small">{technology}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!skillsGrouped.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Skills</h4>
                    {skillsGrouped.map((group) => (
                      <div key={group.label} className="shortlist-skill-group">
                        <div className="profile-subtitle">{group.label}</div>
                        <div className="skills-pills profile-section-pills">
                          {group.values.map((skill, index) => (
                            <span key={`${group.label}-${skill}-${index}`} className="skill-pill">{skill}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {!!topAcademicSkills.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Academic Skill Profile</h4>
                    <div className="skills-pills profile-section-pills">
                      {topAcademicSkills.map(([skill, score]) => (
                        <span key={`acad-${skill}`} className="skill-pill">{skill} ({Number.isFinite(Number(score)) ? Number(score).toFixed(1) : score})</span>
                      ))}
                    </div>
                  </section>
                )}

                {!!certificationItems.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Certifications</h4>
                    <div className="profile-item-list">
                      {certificationItems.map((cert, index) => (
                        <div key={`cert-${index}`} className="profile-item-card">
                          <div className="profile-item-title">{cert.name || 'Certification'}</div>
                          <div className="profile-item-meta">{cert.issuer || 'Issuer'}{cert.date ? ` • ${cert.date}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!achievementItems.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Achievements</h4>
                    <div className="profile-item-list">
                      {achievementItems.map((achievement, index) => (
                        <div key={`achievement-${index}`} className="profile-item-card">
                          <div className="profile-item-title">{achievement.title || 'Achievement'}</div>
                          <div className="profile-item-meta">{achievement.description || ''}</div>
                          {(achievement.issuer || achievement.level) && (
                            <div className="profile-item-meta">{achievement.issuer || '—'}{achievement.level ? ` • ${achievement.level}` : ''}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!customSections.length && (
                  <section className="shortlist-profile-section">
                    <h4 className="popup-section-title">Additional Sections</h4>
                    <div className="profile-item-list">
                      {customSections.map((section, index) => (
                        <div key={`custom-${index}`} className="profile-item-card">
                          <div className="profile-item-title">{section.title || `Section ${index + 1}`}</div>
                          <div className="profile-item-meta">{section.content || section.description || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Drive Card ──────────────────── */
/* ─── JD Viewer Modal ──────────────────── */
const JdViewerModal = ({ isOpen, onClose, drive }) => {
  if (!isOpen || !drive) return null;
  const jdText = drive.jd_raw_text;
  const hasJd = jdText && jdText.trim() && jdText !== '(from PDF)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content jd-viewer-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Job Description — {drive.company_name}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="jd-viewer-body">
          {hasJd ? (
            <pre className="jd-text-content">{jdText}</pre>
          ) : (
            <div className="empty-state">
              <p>No job description text available for this drive.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DriveCard = ({ drive, onEdit, onDelete, onShortlist, onViewApplicants, onViewJd }) => {
  const deadline = drive.application_deadline ? new Date(drive.application_deadline) : null;
  const driveDate = drive.drive_date ? new Date(drive.drive_date) : null;
  const isExpired = deadline && deadline < new Date();
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`pc-drive-card ${isExpired ? 'pc-expired' : ''}`}>
      {/* Header: Company + Status */}
      <div className="pc-row-top">
        <div className="pc-company-block">
          <span className="pc-company-name">{drive.company_name}</span>
          <StatusBadge status={drive.status} />
        </div>
      </div>

      {/* Details */}
      <div className="pc-details">
        <div className="pc-detail-row">
          <span className="pc-label">Job Role</span>
          <span className="pc-value">{drive.role_title || '—'}</span>
        </div>
        {driveDate && (
          <div className="pc-detail-row">
            <span className="pc-label">Drive Date</span>
            <span className="pc-value">{fmt(driveDate)}</span>
          </div>
        )}
        {deadline && (
          <div className="pc-detail-row">
            <span className="pc-label">Deadline</span>
            <span className={`pc-value ${isExpired ? 'pc-text-danger' : ''}`}>{fmt(deadline)}</span>
          </div>
        )}
        {(drive.package?.ctc || drive.package?.base_salary) && (
          <div className="pc-detail-row">
            <span className="pc-label">Package</span>
            <span className="pc-value">
              {[drive.package.ctc && `CTC: ${drive.package.ctc} LPA`, drive.package.base_salary && `Base: ${drive.package.base_salary} LPA`].filter(Boolean).join(' | ')}
            </span>
          </div>
        )}
        {(drive.criteria?.min_tenth_percentage || drive.criteria?.min_twelfth_percentage || drive.criteria?.min_ug_cgpa) && (
          <div className="pc-detail-row">
            <span className="pc-label">Eligibility</span>
            <span className="pc-value">
              {[drive.criteria.min_tenth_percentage && `10th: ${drive.criteria.min_tenth_percentage}%`, drive.criteria.min_twelfth_percentage && `12th: ${drive.criteria.min_twelfth_percentage}%`, drive.criteria.min_ug_cgpa && `CGPA: ${drive.criteria.min_ug_cgpa}`].filter(Boolean).join(' | ')}
            </span>
          </div>
        )}
        {drive.location && (
          <div className="pc-detail-row">
            <span className="pc-label">Location</span>
            <span className="pc-value">{drive.location}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {drive.jd_structured?.required_skills?.length > 0 && (
        <div className="pc-skills">
          {drive.jd_structured.required_skills.slice(0, 8).map(sk => (
            <span key={sk.skill} className="pc-skill-pill">{sk.skill}</span>
          ))}
          {drive.jd_structured.required_skills.length > 8 && (
            <span className="pc-skill-pill pc-more">+{drive.jd_structured.required_skills.length - 8}</span>
          )}
        </div>
      )}

      {/* Divider + Action buttons with text */}
      <div className="pc-card-actions">
        <button className="pc-action-btn pc-btn-edit" onClick={() => onEdit(drive)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button className="pc-action-btn pc-btn-applicants" onClick={() => onViewApplicants(drive)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Applicants
        </button>
        <button className="pc-action-btn pc-btn-shortlist" onClick={() => onShortlist(drive)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Shortlist
        </button>
        {drive.has_jd && (
          <button className="pc-action-btn pc-btn-jd" onClick={() => onViewJd(drive)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            View JD
          </button>
        )}
        <button className="pc-action-btn pc-btn-delete" onClick={() => onDelete(drive)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete
        </button>
      </div>
    </div>
  );
};

/* ─── Applicants Panel ──────────────────── */
const ApplicantsPanel = ({ isOpen, onClose, drive }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && drive) {
      fetchApplications();
    }
  }, [isOpen, drive]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/placement/drives/${drive.id}/applications`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content applicants-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Applicants — {drive?.company_name} ({drive?.role_title})</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="applicants-content">
          {loading ? (
            <div className="loading-spinner-container"><div className="loading-spinner"></div></div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <p>No applications yet for this drive.</p>
            </div>
          ) : (
            <table className="applicants-table">
              <thead>
                <tr>
                  <th>Reg. No.</th>
                  <th>Student</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.register_number || '—'}</td>
                    <td>{app.student_name || app.user_id}</td>
                    <td>{new Date(app.applied_at).toLocaleDateString('en-IN')}</td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Curriculum / Course Catalog Section ──────────────────── */
const CurriculumSection = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit form state
  const emptyForm = { course_code: '', course_name: '', credits: '', category: '', mapped_skills: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/placement/curriculum/courses`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCatalog(data);
      }
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingCourse(null);
    setShowAddForm(true);
  };

  const openEditForm = (course) => {
    setForm({
      course_code: course.course_code || '',
      course_name: course.course_name || '',
      credits: course.credits ?? '',
      category: course.category || '',
      mapped_skills: (course.mapped_skills || []).join(', '),
    });
    setEditingCourse(course);
    setShowAddForm(true);
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.course_name.trim()) return;

    const skills = form.mapped_skills
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const body = {
      course_code: form.course_code || null,
      course_name: form.course_name.trim(),
      credits: form.credits ? parseFloat(form.credits) : null,
      category: form.category || null,
      mapped_skills: skills,
    };

    try {
      const isEdit = !!editingCourse;
      const url = isEdit
        ? `${API_BASE}/placement/curriculum/courses/${editingCourse.id}`
        : `${API_BASE}/placement/curriculum/courses`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowAddForm(false);
        setEditingCourse(null);
        setForm(emptyForm);
        fetchCatalog();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to save course');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete "${course.course_name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/placement/curriculum/courses/${course.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok || res.status === 204) {
        fetchCatalog();
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  const filtered = searchQuery
    ? catalog.filter(c =>
        (c.course_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.course_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.mapped_skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : catalog;

  return (
    <div className="curriculum-section">
      <div className="section-header">
        <h2>{catalog.length} Course{catalog.length !== 1 ? 's' : ''} in Catalog</h2>
        <div className="section-actions">
          <input
            className="catalog-search"
            type="text"
            placeholder="Search courses or skills..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="btn-primary" onClick={openAddForm}>+ Add Course</button>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content course-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleFormSubmit} className="drive-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input name="course_code" value={form.course_code} onChange={handleFormChange} placeholder="e.g. CSE3001" />
                </div>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input name="course_name" value={form.course_name} onChange={handleFormChange} required placeholder="e.g. Database Management Systems" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credits</label>
                  <input type="number" name="credits" value={form.credits} onChange={handleFormChange} step="0.5" min="0" placeholder="e.g. 4" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleFormChange}>
                    <option value="">— Select —</option>
                    <option value="PC">Programme Core (PC)</option>
                    <option value="PE">Programme Elective (PE)</option>
                    <option value="UCNS">Natural Science Core (UCNS)</option>
                    <option value="UCBES">Engineering Sciences (UCBES)</option>
                    <option value="UCSD">Skill Development (UCSD)</option>
                    <option value="UCHSS">Humanities &amp; Social Science (UCHSS)</option>
                    <option value="UCPI">Projects &amp; Internships (UCPI)</option>
                    <option value="UENSE">Natural Science Electives (UENSE)</option>
                    <option value="UEME">Multidisciplinary Electives (UEME)</option>
                    <option value="UEHSSM">HSS Electives (UEHSSM)</option>
                    <option value="UEOE">Open Electives (UEOE)</option>
                    <option value="NMC">Non-Graded Mandatory (NMC)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mapped Skills</label>
                <textarea
                  name="mapped_skills"
                  value={form.mapped_skills}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Comma-separated skills, e.g. python, machine learning, scikit-learn"
                />
                <span className="form-hint">Enter skill names separated by commas. Use taxonomy names for best matching.</span>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingCourse ? 'Save Changes' : 'Add Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner-container"><div className="loading-spinner"></div></div>
      ) : filtered.length > 0 ? (
        <div className="catalog-table-container">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Category</th>
                <th>Mapped Skills</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="code-cell">{c.course_code || '—'}</td>
                  <td>{c.course_name}</td>
                  <td className="center">{c.credits || '—'}</td>
                  <td className="center">{c.category || '—'}</td>
                  <td>
                    <div className="skills-pills">
                      {(c.mapped_skills || []).slice(0, 4).map(s => (
                        <span key={s} className="skill-pill small">{s}</span>
                      ))}
                      {(c.mapped_skills || []).length > 4 && (
                        <span className="skill-pill more small">+{c.mapped_skills.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className="action-cell">
                    <button className="btn-icon" title="Edit" onClick={() => openEditForm(c)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="btn-icon btn-danger" title="Delete" onClick={() => handleDeleteCourse(c)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : catalog.length > 0 ? (
        <div className="empty-state-card">
          <div className="empty-state">
            <p>No courses match "{searchQuery}".</p>
          </div>
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/>
            </svg>
            <p>No courses in the catalog yet.</p>
            <p className="empty-hint">Ask your admin to run the seed script, or add courses manually.</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
/*   PlacementDashboard — Main Component          */
/* ═══════════════════════════════════════════════ */
const PlacementDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('drives');
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDriveForm, setShowDriveForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [shortlistDriveId, setShortlistDriveId] = useState(null);
  const [viewApplicantsDrive, setViewApplicantsDrive] = useState(null);
  const [jdViewerDrive, setJdViewerDrive] = useState(null);

  const fetchDrives = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/placement/drives`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setDrives(data);
      }
    } catch (err) {
      console.error('Failed to fetch drives:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const handleSaveDrive = async (payload, jdText, jdFile) => {
    try {
      const url = editingDrive 
        ? `${API_BASE}/placement/drives/${editingDrive.id}`
        : `${API_BASE}/placement/drives`;
      const method = editingDrive ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const driveId = editingDrive?.id || data.id;

        // Upload JD if provided (text or PDF)
        if (driveId && (jdText || jdFile)) {
          const formData = new FormData();
          if (jdFile) {
            formData.append('file', jdFile);
          }
          if (jdText && !jdFile) {
            formData.append('jd_text', jdText);
          }
          formData.append('use_llm', 'true');

          try {
            await fetch(`${API_BASE}/placement/drives/${driveId}/jd`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: formData,
            });
          } catch (jdErr) {
            console.error('JD upload failed:', jdErr);
          }
        }

        setShowDriveForm(false);
        setEditingDrive(null);
        fetchDrives();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to save drive');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDeleteDrive = async (drive) => {
    if (!window.confirm(`Delete the drive for "${drive.company_name} — ${drive.role_title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/placement/drives/${drive.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        fetchDrives();
      }
    } catch (err) {
      console.error('Failed to delete drive:', err);
    }
  };

  const handleEditDrive = (drive) => {
    setEditingDrive(drive);
    setShowDriveForm(true);
  };

  return (
    <div className="placement-dashboard">
      <Navbar />
      <div className="placement-hero">
        <div className="placement-hero-inner">
          <h1 className="placement-title">Placement Dashboard</h1>
          <p className="placement-subtitle">Manage company drives, curriculum, and student shortlisting</p>

          <div className="tab-bar">
            <button className={`tab ${activeTab === 'drives' ? 'active' : ''}`} onClick={() => setActiveTab('drives')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Company Drives
            </button>
            <button className={`tab ${activeTab === 'curriculum' ? 'active' : ''}`} onClick={() => setActiveTab('curriculum')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/></svg>
              Curriculum
            </button>
          </div>
        </div>
      </div>

      <div className="placement-content">
        {activeTab === 'drives' && (
          <div className="drives-section">
            <div className="section-header">
              <h2>{drives.length} Drive{drives.length !== 1 ? 's' : ''}</h2>
              <button className="btn-primary" onClick={() => { setEditingDrive(null); setShowDriveForm(true); }}>
                + New Drive
              </button>
            </div>

            {loading ? (
              <div className="loading-spinner-container"><div className="loading-spinner"></div></div>
            ) : drives.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <p>No drives created yet.</p>
                  <button className="btn-primary" onClick={() => setShowDriveForm(true)}>Create Your First Drive</button>
                </div>
              </div>
            ) : (
              <div className="drives-grid">
                {drives.map(drive => (
                  <DriveCard
                    key={drive.id}
                    drive={drive}
                    onEdit={handleEditDrive}
                    onDelete={handleDeleteDrive}
                    onShortlist={(d) => setShortlistDriveId(d.id)}
                    onViewApplicants={(d) => setViewApplicantsDrive(d)}
                    onViewJd={(d) => setJdViewerDrive(d)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'curriculum' && <CurriculumSection />}
      </div>

      <DriveFormModal
        isOpen={showDriveForm}
        onClose={() => { setShowDriveForm(false); setEditingDrive(null); }}
        onSave={handleSaveDrive}
        drive={editingDrive}
      />

      <ShortlistModal
        isOpen={!!shortlistDriveId}
        onClose={() => setShortlistDriveId(null)}
        driveId={shortlistDriveId}
      />

      <ApplicantsPanel
        isOpen={!!viewApplicantsDrive}
        onClose={() => setViewApplicantsDrive(null)}
        drive={viewApplicantsDrive}
      />

      <JdViewerModal
        isOpen={!!jdViewerDrive}
        onClose={() => setJdViewerDrive(null)}
        drive={jdViewerDrive}
      />
    </div>
  );
};

export default PlacementDashboard;
