import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/* ── auto-shrink helper (cqw base) ─────────────────────── */
const cqw = (text, maxLen = 30, base = 4) => {
  if (!text || text.length <= maxLen) return base;
  return Math.max(base * 0.5, base * (maxLen / text.length));
};

const FIELD_LABELS = {
  schoolName: 'School Name', address: 'Address', subject: 'Subject',
  projectTitle: 'Title', description: 'Description',
  studentName: 'Student Name', classSection: 'Class', facultyName: 'Faculty', session: 'Session',
};

/* ── Floating size toolbar (portal → body, above focused el) ── */
const FloatingToolbar = ({ active, fontSizes, onSizeChange }) => {
  if (!active) return null;
  const { fieldKey, rect } = active;
  const size = fontSizes[fieldKey] ?? 3;
  const top = Math.max(8, rect.top - 46);
  const left = Math.min(window.innerWidth - 200, Math.max(8, rect.left + rect.width / 2 - 90));

  const btn = {
    background: '#1a2540', border: '1px solid #2e4080', borderRadius: 6,
    color: '#e8edf8', cursor: 'pointer', padding: '3px 10px',
    fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif',
  };

  return createPortal(
    <div
      onMouseDown={e => e.preventDefault()} /* prevent blur on click */
      style={{
        position: 'fixed', top, left, zIndex: 99999,
        background: '#0f1629', border: '1px solid #2e4080', borderRadius: 10,
        padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 6px 28px rgba(0,0,0,0.55)', color: '#e8edf8',
        fontSize: 12, fontFamily: 'Inter, sans-serif', userSelect: 'none',
      }}
    >
      <span style={{ color: '#8fa3cc', fontSize: 11, fontWeight: 600 }}>
        {FIELD_LABELS[fieldKey] || fieldKey}
      </span>
      <div style={{ width: 1, height: 18, background: '#2e4080' }} />
      <button style={btn} onClick={() => onSizeChange(fieldKey, -0.3)} title="Smaller">A−</button>
      <span style={{ minWidth: 32, textAlign: 'center', fontSize: 13 }}>{size.toFixed(1)}</span>
      <button style={btn} onClick={() => onSizeChange(fieldKey, +0.3)} title="Larger">A+</button>
    </div>,
    document.body
  );
};

/* ── EditableField — contentEditable span ──────────────────
   - Syncs external value → DOM only when not focused
   - On blur, calls onEdit(fieldKey, newText)
   - On focus, calls onActivate({ fieldKey, rect })
   - onMouseDown={e=>e.preventDefault()} on toolbar prevents blur
─────────────────────────────────────────────────────────── */
const EditableField = ({ value, fieldKey, sizeCqw, color, onEdit, onActivate, style, block }) => {
  const ref = useRef(null);

  /* sync prop → DOM when not focused */
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerText = value || '';
    }
  }, [value]);

  const handleFocus = () => {
    const rect = ref.current.getBoundingClientRect();
    onActivate({ fieldKey, rect });
  };

  const handleBlur = (e) => {
    onActivate(null);
    const next = e.target.innerText.trim();
    if (next !== (value || '')) onEdit(fieldKey, next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ref.current?.blur(); }
    if (e.key === 'Escape') { ref.current.innerText = value || ''; ref.current?.blur(); }
  };

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        ...style,
        fontSize: `${sizeCqw}cqw`,
        display: block ? 'block' : 'inline',
        cursor: 'text',
        outline: 'none',
        borderRadius: 3,
        padding: '1px 3px',
        margin: '-1px -3px',
        transition: 'background 0.15s, box-shadow 0.15s',
        minWidth: '0.5em',
        whiteSpace: block ? 'pre-wrap' : 'nowrap',
      }}
      className="ef"
    />
  );
};

/* ── Logo ───────────────────────────────────────────────── */
const Logo = ({ school, customLogo, sizeCqw, color }) => {
  const src = customLogo || school?.logo || null;
  const initials = (school?.name || 'S').split(' ').slice(0, 2).map(w => w[0]).join('');
  const sz = `${sizeCqw}cqw`;
  return (
    <div style={{ width: sz, height: sz, flexShrink: 0 }}>
      {src
        ? <img key={src} src={src} alt="logo" style={{ width: sz, height: sz, objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none'; }} />
        : <div style={{
            width: sz, height: sz, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: `${sizeCqw * 0.38}cqw`,
          }}>{initials}</div>
      }
    </div>
  );
};

/* ── CLASSIC template ───────────────────────────────────── */
const Classic = ({ d, color, school, logo, E, sz, t }) => (
  <div style={{ width: '100%', height: '100%', background: '#fff', fontFamily: "'Times New Roman', Georgia, serif", position: 'relative' }}>
    <div style={{ position: 'absolute', inset: '2%', border: `0.5cqw solid ${color}` }} />
    <div style={{ position: 'absolute', inset: '3.2%', border: `0.15cqw solid ${color}` }} />
    <div style={{ position: 'absolute', inset: '5%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

      {/* School */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5cqw', paddingTop: '2cqw' }}>
        <Logo school={school} customLogo={logo} sizeCqw={14 * (d.logoSizeScale || 1.0)} color={color} />
        <div style={{ fontWeight: 700, color: '#1a1a2e', lineHeight: 1.25 }}>
          {E('schoolName', school?.name || 'School Name', cqw(school?.name, 28, sz('schoolName')))}
        </div>
        {school?.address && (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            {E('address', school.address, sz('address'))}
          </div>
        )}
        <div style={{ width: '75%', height: '0.2cqw', background: color, margin: '0.5cqw 0' }} />
      </div>

      <div style={{ flex: 1 }} />

      {/* Project */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5cqw', width: '90%' }}>
        <div style={{ fontSize: '2.2cqw', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>
          {t.projectIn}
        </div>
        <div style={{ fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {E('subject', d.subject || 'Subject Name', cqw(d.subject, 22, sz('subject')))}
        </div>
        <div style={{ height: '2cqw' }} />
        <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3, fontFamily: "'Playfair Display','Times New Roman',serif" }}>
          {E('projectTitle', d.projectTitle || 'Your Project Title Here', cqw(d.projectTitle, 22, sz('projectTitle')))}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Description */}
      <div style={{ color: '#555', fontStyle: 'italic', lineHeight: 1.65, maxWidth: '85%', marginBottom: '2cqw', textAlign: 'center' }}>
        {E('description', t.descClassic(d.subject, d.session), sz('description'), true)}
      </div>

      {/* Submitted */}
      <div style={{ width: '90%', borderTop: `0.15cqw solid ${color}66`, paddingTop: '2cqw', paddingBottom: '1cqw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '2.1cqw', color: '#999', marginBottom: '0.8cqw' }}>{t.subBy}</div>
            <div style={{ fontWeight: 700, color: '#111' }}>
              {E('studentName', d.studentName || 'Student Name', sz('studentName'))}
            </div>
            <div style={{ color: '#444', marginTop: '0.5cqw' }}>
              {E('classSection', d.classSection || 'Class / Section', sz('classSection'))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.1cqw', color: '#999', marginBottom: '0.8cqw' }}>{t.subTo}</div>
            <div style={{ fontWeight: 700, color: '#111' }}>
              {E('facultyName', d.facultyName || 'Faculty Name', sz('facultyName'))}
            </div>
            <div style={{ color: '#444', marginTop: '0.5cqw' }}>
              {E('session', d.session || 'Session', sz('session'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── MODERN template ────────────────────────────────────── */
const Modern = ({ d, color, school, logo, E, sz, t }) => (
  <div style={{ width: '100%', height: '100%', background: '#fff', fontFamily: "'Times New Roman',Georgia,serif" }}>
    <div style={{ height: '28%', background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2cqw', padding: '0 6%' }}>
      <Logo school={school} customLogo={logo} sizeCqw={12 * (d.logoSizeScale || 1.0)} color="#fff" />
      <div style={{ fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.25 }}>
        {E('schoolName', school?.name || 'School Name', cqw(school?.name, 28, sz('schoolName')))}
      </div>
      {school?.address && <div style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>{E('address', school.address, sz('address'))}</div>}
    </div>
    <div style={{ height: '0.5cqw', background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    <div style={{ height: 'calc(72% - 0.5cqw)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4% 7%', textAlign: 'center', overflow: 'hidden' }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.04, pointerEvents: 'none' }}>
        <Logo school={school} customLogo={logo} sizeCqw={50 * (d.logoSizeScale || 1.0)} color={color} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: '1.7cqw', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', marginBottom: '1.5cqw' }}>{t.projReport}</div>
      <div style={{ fontWeight: 700, color: color, textTransform: 'uppercase' }}>{E('subject', d.subject || 'Subject', cqw(d.subject, 22, sz('subject')))}</div>
      <div style={{ width: '40%', height: '0.35cqw', background: color, borderRadius: 99, margin: '2.5cqw auto' }} />
      <div style={{ fontWeight: 700, color: '#111', lineHeight: 1.3, fontFamily: "'Playfair Display',serif" }}>
        {E('projectTitle', d.projectTitle || 'Project Title', cqw(d.projectTitle, 22, sz('projectTitle')))}
      </div>
      <div style={{ flex: 1.5 }} />
      <div style={{ fontStyle: 'italic', color: '#666', maxWidth: '85%', marginBottom: '3cqw' }}>
        {E('description', t.descModern(d.session), sz('description'), true)}
      </div>
      <div style={{ width: '100%', borderTop: `0.4cqw solid ${color}`, paddingTop: '2.5cqw', display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'left' }}>
        <div>
          <div style={{ fontSize: '1.6cqw', color: '#999' }}>{t.subBy}</div>
          <div style={{ fontWeight: 700 }}>{E('studentName', d.studentName || 'Student Name', sz('studentName'))}</div>
          <div style={{ color: '#555' }}>{E('classSection', d.classSection || 'Class / Section', sz('classSection'))}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.6cqw', color: '#999' }}>{t.subTo}</div>
          <div style={{ fontWeight: 700 }}>{E('facultyName', d.facultyName || 'Faculty Name', sz('facultyName'))}</div>
          <div style={{ color: '#555' }}>{E('session', d.session || 'Session', sz('session'))}</div>
        </div>
      </div>
    </div>
  </div>
);

/* ── ROYAL template ─────────────────────────────────────── */
const Royal = ({ d, color, school, logo, E, sz, t }) => (
  <div style={{ width: '100%', height: '100%', background: '#fff', fontFamily: "'Times New Roman',Georgia,serif", position: 'relative' }}>
    <div style={{ position: 'absolute', inset: '2%', border: `0.6cqw double ${color}` }} />
    <div style={{ position: 'absolute', inset: '3.2%', border: `0.15cqw solid ${color}44` }} />
    <div style={{ position: 'absolute', inset: '4%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: '2.8cqw', color: color, paddingTop: '1cqw' }}>✦ ✦ ✦</div>
      <div style={{ height: '2cqw' }} />
      <Logo school={school} customLogo={logo} sizeCqw={13 * (d.logoSizeScale || 1.0)} color={color} />
      <div style={{ height: '1.5cqw' }} />
      <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{E('schoolName', school?.name || 'School Name', cqw(school?.name, 28, sz('schoolName')))}</div>
      {school?.address && <div style={{ color: '#666', marginTop: '0.5cqw' }}>{E('address', school.address, sz('address'))}</div>}
      <div style={{ width: '60%', height: '0.15cqw', background: `linear-gradient(90deg,transparent,${color},transparent)`, margin: '2cqw auto' }} />
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: '1.8cqw', color: '#aaa', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.projectIn}</div>
      <div style={{ fontWeight: 700, color: color, textTransform: 'uppercase', margin: '1cqw 0' }}>{E('subject', d.subject || 'Subject', cqw(d.subject, 22, sz('subject')))}</div>
      <div style={{ fontSize: '1.7cqw', color: '#ccc', margin: '0.5cqw 0 1.5cqw' }}>{t.onTopic}</div>
      <div style={{ fontWeight: 700, color: '#111', lineHeight: 1.3, fontFamily: "'Playfair Display',serif", maxWidth: '88%' }}>
        {E('projectTitle', d.projectTitle || 'Project Title', cqw(d.projectTitle, 22, sz('projectTitle')))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontStyle: 'italic', color: '#888', marginBottom: '2cqw' }}>
        {E('description', t.descRoyal(d.session), sz('description'), true)}
      </div>
      <div style={{ width: '88%', borderTop: `0.15cqw solid ${color}55`, paddingTop: '2cqw', display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '2cqw' }}>
        <div style={{ borderLeft: `0.5cqw solid ${color}`, paddingLeft: '3%', textAlign: 'left' }}>
          <div style={{ fontSize: '1.5cqw', color: color, fontWeight: 700, textTransform: 'uppercase' }}>{t.subBy}</div>
          <div style={{ fontWeight: 700 }}>{E('studentName', d.studentName || 'Student Name', sz('studentName'))}</div>
          <div style={{ color: '#555' }}>{E('classSection', d.classSection || 'Class', sz('classSection'))}</div>
        </div>
        <div style={{ borderRight: `0.5cqw solid ${color}`, paddingRight: '3%', textAlign: 'right' }}>
          <div style={{ fontSize: '1.5cqw', color: color, fontWeight: 700, textTransform: 'uppercase' }}>{t.subTo}</div>
          <div style={{ fontWeight: 700 }}>{E('facultyName', d.facultyName || 'Faculty Name', sz('facultyName'))}</div>
          <div style={{ color: '#555' }}>{E('session', d.session || 'Session', sz('session'))}</div>
        </div>
      </div>
      <div style={{ fontSize: '2.8cqw', color: color, paddingBottom: '1cqw' }}>✦ ✦ ✦</div>
    </div>
  </div>
);

/* ── GRADIENT template ──────────────────────────────────── */
const Gradient = ({ d, color, school, logo, E, sz, t }) => (
  <div style={{ width: '100%', height: '100%', background: '#fff', fontFamily: "'Times New Roman',Georgia,serif" }}>
    <div style={{ height: '30%', background: `linear-gradient(135deg,${color} 0%,${color}99 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2cqw', padding: '0 6%' }}>
      <Logo school={school} customLogo={logo} sizeCqw={12 * (d.logoSizeScale || 1.0)} color="#fff" />
      <div style={{ fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.25 }}>{E('schoolName', school?.name || 'School Name', cqw(school?.name, 28, sz('schoolName')))}</div>
      {school?.address && <div style={{ color: 'rgba(255,255,255,0.82)', textAlign: 'center' }}>{E('address', school.address, sz('address'))}</div>}
    </div>
    <div style={{ height: '1cqw', background: `linear-gradient(90deg,${color},${color}44,transparent)` }} />
    <div style={{ height: 'calc(70% - 1cqw)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4% 7%', textAlign: 'center', overflow: 'hidden' }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.03, pointerEvents: 'none' }}>
        <Logo school={school} customLogo={logo} sizeCqw={55 * (d.logoSizeScale || 1.0)} color={color} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ background: `${color}18`, border: `0.2cqw solid ${color}44`, borderRadius: '1cqw', padding: '0.8cqw 3cqw', marginBottom: '2cqw' }}>
        <div style={{ fontSize: '1.6cqw', color: color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t.projReport}</div>
      </div>
      <div style={{ fontWeight: 700, color: color, textTransform: 'uppercase' }}>{E('subject', d.subject || 'Subject', cqw(d.subject, 22, sz('subject')))}</div>
      <div style={{ width: '45%', height: '0.35cqw', background: `linear-gradient(90deg,transparent,${color},transparent)`, borderRadius: 99, margin: '2.5cqw auto' }} />
      <div style={{ fontWeight: 700, color: '#111', lineHeight: 1.3, fontFamily: "'Playfair Display',serif" }}>
        {E('projectTitle', d.projectTitle || 'Project Title', cqw(d.projectTitle, 22, sz('projectTitle')))}
      </div>
      <div style={{ flex: 1.5 }} />
      <div style={{ fontStyle: 'italic', color: '#666', maxWidth: '82%', marginBottom: '3cqw' }}>
        {E('description', t.descGradient(d.session), sz('description'), true)}
      </div>
      <div style={{ width: '100%', borderTop: `0.5cqw solid ${color}`, paddingTop: '2.5cqw', display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'left' }}>
        <div>
          <div style={{ fontSize: '1.5cqw', color: color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '1cqw' }}>{t.subBy}</div>
          <div style={{ fontWeight: 700, color: '#111' }}>{E('studentName', d.studentName || 'Student Name', sz('studentName'))}</div>
          <div style={{ color: '#555' }}>{E('classSection', d.classSection || 'Class / Section', sz('classSection'))}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5cqw', color: color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '1cqw' }}>{t.subTo}</div>
          <div style={{ fontWeight: 700, color: '#111' }}>{E('facultyName', d.facultyName || 'Faculty Name', sz('facultyName'))}</div>
          <div style={{ color: '#555' }}>{E('session', d.session || 'Session', sz('session'))}</div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Main export ────────────────────────────────────────── */
const CoverPreview = forwardRef(({ data, selectedSchool, customLogo, template, fontSizes, onFontSizeChange, onInlineEdit, language }, ref) => {
  const [activeField, setActiveField] = useState(null);
  const color = data.themeColor || selectedSchool?.theme || '#1e3a8a';

  const TRANSLATIONS = {
    en: {
      projectIn: 'A Project in',
      onTopic: '— on the topic of —',
      descClassic: (sub, sess) => `A ${sub || 'Project'} submitted in partial fulfilment of the requirements for the academic examination, ${sess || 'Academic Session'}.`,
      descModern: (sess) => `Submitted in partial fulfilment of the requirements for ${sess || 'the Academic Session'}.`,
      descRoyal: (sess) => `Submitted in partial fulfilment · ${sess || 'Academic Session'}`,
      descGradient: (sess) => `Submitted in partial fulfilment of the academic requirements · ${sess || 'Session'}`,
      subBy: 'Submitted by',
      subTo: 'Submitted to',
      projReport: 'Project Report'
    },
    hi: {
      projectIn: 'परियोजना का विषय',
      onTopic: '— का विषय —',
      descClassic: (sub, sess) => `यह ${sub || 'परियोजना'} ${sess || 'सत्र'} की शैक्षणिक परीक्षा की आवश्यकताओं की आंशिक पूर्ति में प्रस्तुत की गई है।`,
      descModern: (sess) => `${sess || 'सत्र'} की आवश्यकताओं की आंशिक पूर्ति में प्रस्तुत।`,
      descRoyal: (sess) => `आंशिक पूर्ति में प्रस्तुत · ${sess || 'सत्र'}`,
      descGradient: (sess) => `आंशिक पूर्ति में प्रस्तुत · ${sess || 'सत्र'}`,
      subBy: 'प्रस्तुतकर्ता',
      subTo: 'मार्गदर्शक',
      projReport: 'परियोजना रिपोर्ट'
    }
  };
  const t = TRANSLATIONS[language || 'en'];

  /* sz(field) → current size number */
  const sz = (field) => fontSizes?.[field] ?? 3;

  /* E(field, value, size, block?) → EditableField element */
  const E = (field, value, size, block = false) => (
    <EditableField
      key={field}
      fieldKey={field}
      value={value}
      sizeCqw={typeof size === 'number' ? size : sz(field)}
      color={color}
      onEdit={(f, v) => {
        /* map inline-edit field back to data field */
        const MAP = {
          schoolName: 'customSchoolName', subject: 'subject',
          projectTitle: 'projectTitle', studentName: 'studentName',
          classSection: 'classSection', facultyName: 'facultyName',
          session: 'session', description: 'description',
        };
        if (MAP[f]) onInlineEdit(MAP[f], v);
      }}
      onActivate={setActiveField}
      block={block}
    />
  );

  const TEMPLATES = { classic: Classic, modern: Modern, royal: Royal, gradient: Gradient };
  const Template = TEMPLATES[template] || Classic;

  return (
    <>
      <FloatingToolbar active={activeField} fontSizes={fontSizes} onSizeChange={onFontSizeChange} />
      <div className="a4-wrapper">
        <div className="a4-paper" id="print-target" ref={ref} style={{ fontFamily: language === 'hi' ? "'Mukta', 'Inter', 'Times New Roman', serif" : "'Times New Roman', Georgia, serif" }}>
          <Template d={data} color={color} school={selectedSchool} logo={customLogo} E={E} sz={sz} t={t} />
        </div>
      </div>
    </>
  );
});

CoverPreview.displayName = 'CoverPreview';
export default CoverPreview;
