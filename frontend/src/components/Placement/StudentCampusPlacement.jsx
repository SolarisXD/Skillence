import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import './StudentCampusPlacement.css';

const API_BASE = 'http://localhost:8000/api/student/placement';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/* ─── Status badge ──────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    upcoming: { label: 'Upcoming', cls: 'badge-upcoming' },
    ongoing: { label: 'Ongoing', cls: 'badge-ongoing' },
    completed: { label: 'Completed', cls: 'badge-completed' },
    applied: { label: 'Applied', cls: 'badge-applied' },
    shortlisted: { label: 'Shortlisted', cls: 'badge-shortlisted' },
    interview: { label: 'Interview', cls: 'badge-interview' },
    selected: { label: 'Selected', cls: 'badge-selected' },
    rejected: { label: 'Rejected', cls: 'badge-rejected' },
    not_eligible: { label: 'Not Eligible', cls: 'badge-not-eligible' },
  };
  const cfg = map[status] || { label: status, cls: 'badge-default' };
  return <span className={`scp-badge ${cfg.cls}`}>{cfg.label}</span>;
};

/* ─── Circular progress ring ──────────────────── */
const ScoreRing = ({ score, size = 56 }) => {
  const pct = Math.round((score || 0) * 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? '#059669' : pct >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="score-ring-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-light, #f3f4f6)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="score-ring-text" style={{ color }}>{pct}%</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
/*   My Profile Tab                                */
/* ═══════════════════════════════════════════════ */
const ProfileTab = () => {
  const fileInputRef = useRef(null);
  const [academics, setAcademics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({ tenth_percent: '', twelfth_percent: '' });
  const [uploadResult, setUploadResult] = useState(null);
  const [skills, setSkills] = useState(null);

  const fetchAcademics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/academics`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAcademics(data);
        setBasicForm({
          tenth_percent: data.tenth_percentage || '',
          twelfth_percent: data.twelfth_percentage || '',
        });
      } else if (res.status === 404) {
        setAcademics(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/academics/skills`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAcademics();
    fetchSkills();
  }, [fetchAcademics, fetchSkills]);

  const handleUploadGradeHistory = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/academics/grade-history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadResult({ success: true, message: `Parsed ${data.total_courses || 0} courses, CGPA: ${data.cgpa || 'N/A'}` });
        fetchAcademics();
        fetchSkills();
      } else {
        const err = await res.json();
        setUploadResult({ success: false, message: err.detail || 'Upload failed' });
      }
    } catch (err) {
      setUploadResult({ success: false, message: 'Network error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveBasic = async () => {
    try {
      const res = await fetch(`${API_BASE}/academics/basic-info`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          tenth_percentage: basicForm.tenth_percent ? parseFloat(basicForm.tenth_percent) : null,
          twelfth_percentage: basicForm.twelfth_percent ? parseFloat(basicForm.twelfth_percent) : null,
        }),
      });
      if (res.ok) {
        setEditingBasic(false);
        fetchAcademics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="scp-spinner"></div></div>;
  }

  return (
    <div className="profile-tab">
      {/* Upload Section */}
      <div className="scp-card upload-card">
        <div className="scp-card-header">
          <h3>Grade History</h3>
          <label className={`scp-btn-primary ${uploading ? 'disabled' : ''}`}>
            {uploading ? 'Processing...' : 'Upload Grade History PDF'}
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUploadGradeHistory} hidden disabled={uploading} />
          </label>
        </div>
        {uploadResult && (
          <div className={`scp-alert ${uploadResult.success ? 'success' : 'error'}`}>
            {uploadResult.message}
          </div>
        )}
        {academics ? (
          <div className="academics-overview">
            <div className="academics-stats">
              <div className="stat-item">
                <span className="stat-value-lg">{academics.cgpa?.toFixed(2) || '—'}</span>
                <span className="stat-label">CGPA</span>
              </div>
              <div className="stat-item">
                <span className="stat-value-lg">{academics.all_courses?.length || 0}</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-value-lg">{academics.student_info?.register_number || '—'}</span>
                <span className="stat-label">Reg No.</span>
              </div>
            </div>
            {academics.student_info?.name && (
              <p className="student-name">{academics.student_info.name} — {academics.student_info.program || ''}</p>
            )}
          </div>
        ) : (
          <div className="scp-empty-small">
            <p>Upload your grade history PDF to auto-extract courses, grades, and CGPA.</p>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="scp-card">
        <div className="scp-card-header">
          <h3>Eligibility Info</h3>
          {!editingBasic ? (
            <button className="scp-btn-secondary" onClick={() => setEditingBasic(true)}>Edit</button>
          ) : (
            <div className="btn-group">
              <button className="scp-btn-secondary" onClick={() => setEditingBasic(false)}>Cancel</button>
              <button className="scp-btn-primary" onClick={handleSaveBasic}>Save</button>
            </div>
          )}
        </div>
        <div className="basic-info-grid">
          <div className="basic-info-item">
            <label>10th Percentage</label>
            {editingBasic ? (
              <input type="number" value={basicForm.tenth_percent} onChange={e => setBasicForm(p => ({ ...p, tenth_percent: e.target.value }))} step="0.1" />
            ) : (
              <span className="basic-value">{academics?.tenth_percentage || '—'}%</span>
            )}
          </div>
          <div className="basic-info-item">
            <label>12th Percentage</label>
            {editingBasic ? (
              <input type="number" value={basicForm.twelfth_percent} onChange={e => setBasicForm(p => ({ ...p, twelfth_percent: e.target.value }))} step="0.1" />
            ) : (
              <span className="basic-value">{academics?.twelfth_percentage || '—'}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills && (
        <div className="scp-card">
          <div className="scp-card-header">
            <h3>Your Skill Profile</h3>
            <span className="skill-count">{Object.keys(skills.course_skills || {}).length + (skills.resume_skills || []).length} skills</span>
          </div>
          <div className="skill-sections">
            {Object.keys(skills.course_skills || {}).length > 0 && (
              <div className="skill-section">
                <h4>From Courses</h4>
                <div className="scp-skills-pills">
                  {Object.entries(skills.course_skills || {}).sort((a, b) => b[1] - a[1]).map(([sk, weight]) => (
                    <span key={sk} className="scp-skill-pill" title={`weight: ${weight.toFixed(2)}`}>{sk}</span>
                  ))}
                </div>
              </div>
            )}
            {(skills.resume_skills || []).length > 0 && (
              <div className="skill-section">
                <h4>From Resume</h4>
                <div className="scp-skills-pills">
                  {skills.resume_skills.map(sk => (
                    <span key={sk} className="scp-skill-pill resume">{sk}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
/*   Drives Tab                                    */
/* ═══════════════════════════════════════════════ */
const DrivesTab = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [applyingId, setApplyingId] = useState(null);

  const fetchDrives = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/drives?tab=${filter}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDrives(data.drives || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const handleApply = async (driveId) => {
    setApplyingId(driveId);
    try {
      const res = await fetch(`${API_BASE}/drives/${driveId}/apply`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        fetchDrives();
      } else {
        const err = await res.json();
        alert(err.detail || 'Could not apply');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="drives-tab">
      <div className="filter-bar">
        {['upcoming', 'all', 'not_eligible', 'expired'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'not_eligible' ? 'Not Eligible' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container"><div className="scp-spinner"></div></div>
      ) : drives.length === 0 ? (
        <div className="scp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <p>No drives found for this filter.</p>
        </div>
      ) : (
        <div className="drives-list">
          {drives.map(drive => {
            const deadline = drive.application_deadline ? new Date(drive.application_deadline) : null;
            const driveDate = drive.drive_date ? new Date(drive.drive_date) : null;
            const now = new Date();
            const isExpired = deadline && deadline < now;
            const hasApplied = drive.has_applied;
            const isEligible = drive.eligible !== false;

            let daysLeft = null;
            if (deadline && !isExpired) {
              daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            }

            const fmtDate = (d) => d?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div key={drive.id} className={`drive-card ${isExpired ? 'dc-expired' : ''} ${!isEligible ? 'dc-ineligible' : ''} ${hasApplied ? 'dc-applied' : ''}`}>
                {/* Row 1: Company + deadline + action */}
                <div className="dc-row-top">
                  <div className="dc-company">
                    <h3 className="dc-company-name">{drive.company_name}</h3>
                    <StatusBadge status={hasApplied ? 'applied' : drive.status} />
                    {deadline && (
                      <span className={`dc-deadline-text ${isExpired ? 'dc-closed' : daysLeft !== null && daysLeft <= 3 ? 'dc-urgent' : ''}`}>
                        Apply by {fmtDate(deadline)}
                        {daysLeft !== null && !isExpired && <> &middot; <strong>{daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}</strong></>}
                        {isExpired && <> &middot; <strong>Closed</strong></>}
                      </span>
                    )}
                  </div>
                  <div className="dc-action">
                    {drive.match_score !== undefined && drive.match_score !== null && (
                      <ScoreRing score={drive.match_score} size={44} />
                    )}
                    {hasApplied ? (
                      <span className="dc-applied-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Applied
                      </span>
                    ) : !isEligible ? (
                      <span className="dc-status-badge dc-badge-ineligible">Not Eligible</span>
                    ) : isExpired ? (
                      <span className="dc-status-badge dc-badge-expired">Expired</span>
                    ) : (
                      <button className="scp-btn-primary" onClick={() => handleApply(drive.id)} disabled={applyingId === drive.id}>
                        {applyingId === drive.id ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Details table */}
                <div className="dc-details">
                  <div className="dc-detail-row">
                    <span className="dc-label">Job Role</span>
                    <span className="dc-value">{drive.role_title || '—'}</span>
                  </div>
                  {driveDate && (
                    <div className="dc-detail-row">
                      <span className="dc-label">Drive Date</span>
                      <span className="dc-value">{fmtDate(driveDate)}</span>
                    </div>
                  )}
                  {(drive.package?.ctc || drive.package?.base_salary) && (
                    <div className="dc-detail-row">
                      <span className="dc-label">Package</span>
                      <span className="dc-value">
                        {[
                          drive.package.ctc && `${drive.package.ctc} LPA CTC`,
                          drive.package.base_salary && `${drive.package.base_salary} LPA Base`,
                        ].filter(Boolean).join('  |  ')}
                      </span>
                    </div>
                  )}
                  {(drive.criteria?.min_tenth_percentage || drive.criteria?.min_twelfth_percentage || drive.criteria?.min_ug_cgpa) && (
                    <div className="dc-detail-row">
                      <span className="dc-label">Eligibility</span>
                      <span className="dc-value">
                        {[
                          drive.criteria.min_tenth_percentage != null && `10th: ${drive.criteria.min_tenth_percentage}%`,
                          drive.criteria.min_twelfth_percentage != null && `12th: ${drive.criteria.min_twelfth_percentage}%`,
                          drive.criteria.min_ug_cgpa != null && `CGPA: ${drive.criteria.min_ug_cgpa}`,
                        ].filter(Boolean).join('  |  ')}
                      </span>
                    </div>
                  )}
                  {drive.location && (
                    <div className="dc-detail-row">
                      <span className="dc-label">Location</span>
                      <span className="dc-value">{drive.location}</span>
                    </div>
                  )}
                </div>

                {/* Skills row (if available) */}
                {drive.jd_structured?.required_skills?.length > 0 && (
                  <div className="dc-skills">
                    {drive.jd_structured.required_skills.slice(0, 5).map(sk => (
                      <span key={sk.skill} className="scp-skill-pill">{sk.skill}</span>
                    ))}
                    {drive.jd_structured.required_skills.length > 5 && (
                      <span className="scp-skill-pill more">+{drive.jd_structured.required_skills.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
/*   My Applications Tab                           */
/* ═══════════════════════════════════════════════ */
const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/applications`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="scp-spinner"></div></div>;
  }

  return (
    <div className="applications-tab">
      {applications.length === 0 ? (
        <div className="scp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>You haven't applied to any drives yet.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app.id} className="application-card">
              <div className="app-info">
                <h3>{app.company_name || 'Company'}</h3>
                <span className="app-role">{app.role_title || 'Role'}</span>
                <span className="app-date">Applied: {new Date(app.applied_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="app-actions">
                <StatusBadge status={app.status} />
                {app.status === 'applied' && (
                  <button className="scp-btn-danger-sm" onClick={() => handleWithdraw(app.id)}>
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
/*   StudentCampusPlacement — Main Component       */
/* ═══════════════════════════════════════════════ */
const StudentCampusPlacement = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="scp-page">
      <Navbar />
      <div className="scp-container">
        <div className="scp-header">
          <h1>Campus Placement</h1>
          <p className="scp-subtitle">Manage your academic profile, browse drives, and track applications</p>
        </div>

        <div className="scp-tab-bar">
          <button className={`scp-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </button>
          <button className={`scp-tab ${activeTab === 'drives' ? 'active' : ''}`} onClick={() => setActiveTab('drives')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Drives
          </button>
          <button className={`scp-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            My Applications
          </button>
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'drives' && <DrivesTab />}
        {activeTab === 'applications' && <ApplicationsTab />}
      </div>
    </div>
  );
};

export default StudentCampusPlacement;
