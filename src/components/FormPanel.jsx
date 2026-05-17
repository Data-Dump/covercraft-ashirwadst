import React from 'react';
import schoolsData from '../data/schools.json';
import templatesData from '../data/templates.json';

const SWATCHES = [
  '#1e3a8a','#7c1a1a','#14532d','#831843','#365314','#44211a',
  '#1e3a5f','#374151','#4c1d95','#7c3aed','#0369a1','#b45309',
];

// Template thumb previews (tiny inline SVGs)
const TemplateThumbs = {
  classic: (color) => (
    <svg viewBox="0 0 60 84" className="template-thumb">
      <rect width="60" height="84" fill="#fff" />
      <rect x="2" y="2" width="56" height="80" fill="none" stroke={color} strokeWidth="2" />
      <rect x="4" y="4" width="52" height="76" fill="none" stroke={color} strokeWidth="0.5" />
      <circle cx="30" cy="20" r="7" fill={color} opacity="0.8" />
      <rect x="10" y="30" width="40" height="3" rx="1" fill={color} opacity="0.7" />
      <rect x="15" y="35" width="30" height="2" rx="1" fill="#999" />
      <rect x="8" y="44" width="44" height="2" rx="1" fill="#333" />
      <rect x="12" y="48" width="36" height="1.5" rx="1" fill="#333" opacity="0.6" />
      <rect x="16" y="52" width="28" height="1" rx="1" fill="#ccc" />
      <rect x="5" y="66" width="22" height="10" rx="1" fill={color} opacity="0.15" />
      <rect x="33" y="66" width="22" height="10" rx="1" fill={color} opacity="0.15" />
    </svg>
  ),
  modern: (color) => (
    <svg viewBox="0 0 60 84" className="template-thumb">
      <rect width="60" height="84" fill="#fff" />
      <rect width="60" height="22" fill={color} />
      <circle cx="30" cy="10" r="5" fill="white" opacity="0.9" />
      <rect x="10" y="17" width="40" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="22" y="26" width="16" height="1.5" rx="1" fill={color} />
      <rect x="15" y="32" width="30" height="3" rx="1" fill="#333" opacity="0.8" />
      <rect x="10" y="38" width="40" height="1.5" rx="1" fill="#999" />
      <rect x="18" y="42" width="24" height="2" rx="1" fill={color} />
      <rect x="5" y="68" width="22" height="12" rx="1" fill={color} opacity="0.12" />
      <rect x="33" y="68" width="22" height="12" rx="1" fill={color} opacity="0.12" />
      <rect x="5" y="66" width="50" height="1" rx="0" fill={color} />
    </svg>
  ),
  royal: (color) => (
    <svg viewBox="0 0 60 84" className="template-thumb">
      <rect width="60" height="84" fill="#fff" />
      <rect x="2" y="2" width="56" height="80" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2 1" />
      <text x="30" y="12" textAnchor="middle" fontSize="6" fill={color}>✦ ✦ ✦</text>
      <circle cx="30" cy="22" r="6" fill={color} opacity="0.8" />
      <rect x="8" y="31" width="44" height="2.5" rx="1" fill={color} opacity="0.7" />
      <rect x="18" y="36" width="24" height="2" rx="1" fill="#888" />
      <rect x="10" y="44" width="40" height="2.5" rx="1" fill="#222" />
      <rect x="14" y="49" width="32" height="2" rx="1" fill="#222" opacity="0.6" />
      <text x="30" y="74" textAnchor="middle" fontSize="5" fill={color}>✦ ✦ ✦</text>
    </svg>
  ),
  gradient: (color) => (
    <svg viewBox="0 0 60 84" className="template-thumb">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="60" height="84" fill="#fff" />
      <rect width="60" height="24" fill="url(#g1)" />
      <circle cx="30" cy="11" r="5" fill="white" opacity="0.9" />
      <rect x="8" y="19" width="44" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="26" y="27" width="8" height="2" rx="1" fill={color} opacity="0.5" />
      <rect x="12" y="33" width="36" height="3" rx="1" fill="#222" opacity="0.8" />
      <rect x="16" y="39" width="28" height="2" rx="1" fill="#999" />
      <rect x="5" y="68" width="22" height="12" rx="1" fill={color} opacity="0.12" />
      <rect x="33" y="68" width="22" height="12" rx="1" fill={color} opacity="0.12" />
      <rect x="5" y="66" width="50" height="2" rx="0" fill={color} />
    </svg>
  ),
};

export default function FormPanel({ data, onChange, template, onTemplateChange, customLogo, onCustomLogoChange }) {
  const selectedSchool = schoolsData.find(s => s.id === data.schoolId);
  const themeColor = data.themeColor || selectedSchool?.theme || '#1e3a8a';

  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  const handleSchoolChange = (e) => {
    const school = schoolsData.find(s => s.id === e.target.value);
    onChange({ ...data, schoolId: e.target.value, themeColor: school?.theme || data.themeColor });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onCustomLogoChange(url);
  };

  return (
    <div className="form-panel">
      <div className="form-panel-inner">

        {/* ── School Config ── */}
        <div>
          <div className="section-label">🏫 School</div>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">Select School</label>
              <select id="school-select" className="form-select" value={data.schoolId} onChange={handleSchoolChange}>
                {schoolsData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {data.schoolId === 'custom' && (
              <div className="form-group">
                <label className="form-label">Custom School Name</label>
                <input id="custom-school-name" className="form-input" placeholder="Enter school name…" value={data.customSchoolName || ''} onChange={set('customSchoolName')} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>School Logo</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scale: {data.logoSizeScale || 1.0}x</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {customLogo && <img src={customLogo} alt="Logo" className="upload-preview" />}
                <label className="upload-area" style={{ flex: 1, cursor: 'pointer' }}>
                  {customLogo ? '↑ Change logo' : '↑ Upload custom logo (optional)'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </label>
                {customLogo && (
                  <button className="btn btn-sm btn-danger" onClick={() => onCustomLogoChange(null)} title="Remove">✕</button>
                )}
              </div>
              <input type="range" min="0.3" max="2.5" step="0.1" 
                value={data.logoSizeScale || 1.0} 
                onChange={e => onChange({ ...data, logoSizeScale: parseFloat(e.target.value) })}
                style={{ width: '100%', marginTop: '0.4rem', cursor: 'pointer', accentColor: 'var(--accent)' }}
                title="Adjust logo size"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Theme Color</label>
              <div className="color-swatch">
                {SWATCHES.map(c => (
                  <div key={c} className={`swatch ${themeColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => onChange({ ...data, themeColor: c })}
                    title={c}
                  />
                ))}
              </div>
              <div className="color-input-row" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '0.8rem' }}>
                <div 
                  title="Open Color Wheel"
                  style={{ 
                    position: 'relative', width: 34, height: 34, borderRadius: '50%', 
                    background: 'conic-gradient(red, #ff8000, yellow, lime, aqua, blue, magenta, red)', 
                    cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '2px solid #fff'
                  }}>
                  <input type="color" value={themeColor}
                    onChange={e => onChange({ ...data, themeColor: e.target.value })} 
                    style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} 
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '0 10px', background: themeColor, width: 24, height: '100%', borderRight: '1px solid var(--border-color)' }}></div>
                  <input className="form-input" value={themeColor}
                    onChange={e => onChange({ ...data, themeColor: e.target.value })}
                    placeholder="#1e3a8a" style={{ fontFamily: 'monospace', border: 'none', background: 'transparent' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Student Info ── */}
        <div>
          <div className="section-label">👤 Student Details</div>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input id="student-name" className="form-input" placeholder="e.g. Rahul Sharma" value={data.studentName} onChange={set('studentName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Class / Section</label>
              <input id="class-section" className="form-input" placeholder="e.g. Class X – A" value={data.classSection} onChange={set('classSection')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Session / Year</label>
              <input id="session" className="form-input" placeholder="e.g. 2024 – 2025" value={data.session} onChange={set('session')} />
            </div>
          </div>
        </div>

        {/* ── Project Info ── */}
        <div>
          <div className="section-label">📋 Project Details</div>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input id="subject" className="form-input" placeholder="e.g. Computer Science" value={data.subject} onChange={set('subject')} />
            </div>
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input id="project-title" className="form-input" placeholder="e.g. Impact of AI in Education" value={data.projectTitle} onChange={set('projectTitle')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Faculty Name</label>
              <input id="faculty-name" className="form-input" placeholder="e.g. Mrs. Priya Gupta" value={data.facultyName} onChange={set('facultyName')} />
            </div>
          </div>
        </div>

        {/* ── Templates ── */}
        <div>
          <div className="section-label">🎨 Template</div>
          <div className="template-grid">
            {templatesData.map(t => (
              <div key={t.id} className={`template-card ${template === t.id ? 'active' : ''}`}
                onClick={() => onTemplateChange(t.id)}>
                {TemplateThumbs[t.id]?.(themeColor)}
                <div className="template-name">{t.name}</div>
                <div className="template-desc">{t.description}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
