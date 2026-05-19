import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const FloatingToolbar = ({ active, fontSizes, onSizeChange }) => {
  if (!active) return null;
  const { fieldKey, rect } = active;
  const size = fontSizes?.[fieldKey] ?? 3;
  const top = Math.max(8, rect.top - 46);
  const left = Math.min(window.innerWidth - 200, Math.max(8, rect.left + rect.width / 2 - 90));
  const btn = { background: '#1a2540', border: '1px solid #2e4080', borderRadius: 6, color: '#e8edf8', cursor: 'pointer', padding: '3px 10px', fontSize: 14, fontWeight: 700, fontFamily: 'Inter,sans-serif' };
  return createPortal(
    <div data-toolbar onMouseDown={e => e.preventDefault()} style={{ position: 'fixed', top, left, zIndex: 99999, background: '#0f1629', border: '1px solid #2e4080', borderRadius: 10, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 28px rgba(0,0,0,0.55)', color: '#e8edf8', fontSize: 12, fontFamily: 'Inter,sans-serif', userSelect: 'none' }}>
      <span style={{ color: '#8fa3cc', fontSize: 11, fontWeight: 600 }}>{fieldKey}</span>
      <div style={{ width: 1, height: 18, background: '#2e4080' }} />
      <button style={btn} onClick={() => onSizeChange(fieldKey, -0.2)}>A−</button>
      <span style={{ minWidth: 32, textAlign: 'center' }}>{size.toFixed(1)}</span>
      <button style={btn} onClick={() => onSizeChange(fieldKey, +0.2)}>A+</button>
    </div>,
    document.body
  );
};

const EditField = ({ value, fieldKey, sizeCqw, onEdit, onActivate, block, style }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && document.activeElement !== ref.current) ref.current.innerText = value || ''; }, [value]);
  return (
    <span ref={ref} contentEditable suppressContentEditableWarning className="ef"
      onFocus={() => { const rect = ref.current.getBoundingClientRect(); onActivate({ fieldKey, rect }); }}
      onBlur={e => { onActivate(null); const v = e.target.innerText.trim(); if (v !== (value || '')) onEdit(fieldKey, v); }}
      onKeyDown={e => { if (e.key === 'Escape') { ref.current.innerText = value || ''; ref.current.blur(); } }}
      style={{ display: block ? 'block' : 'inline', fontSize: `${sizeCqw}cqw`, cursor: 'text', outline: 'none', borderRadius: 3, whiteSpace: block ? 'pre-wrap' : 'normal', width: block ? '100%' : undefined, ...style }}
    />
  );
};

const Logo = ({ school, customLogo, sizeCqw, color }) => {
  const src = customLogo || school?.logo || null;
  const initials = (school?.name || 'S').split(' ').slice(0, 2).map(w => w[0]).join('');
  const sz = `${sizeCqw}cqw`;
  return (
    <div style={{ width: sz, height: sz, flexShrink: 0 }}>
      {src ? <img key={src} src={src} alt="logo" style={{ width: sz, height: sz, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
           : <div style={{ width: sz, height: sz, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: `${sizeCqw * 0.38}cqw` }}>{initials}</div>}
    </div>
  );
};

const AcknowledgementPreview = forwardRef(({ data, selectedSchool, customLogo, template, onInlineEdit, fontSizes, onFontSizeChange }, ref) => {
  const [activeField, setActiveField] = useState(null);
  const color = data.themeColor || selectedSchool?.theme || '#1e3a8a';
  const scale = data.logoSizeScale || 1.0;
  const isBand = template === 'modern' || template === 'gradient';
  const isRoyal = template === 'royal';
  const edit = onInlineEdit || (() => {});
  const sz = f => fontSizes?.[f] ?? 3;

  const facultyName = data.facultyName || 'Subject Teacher';
  const subject = data.subject || 'the subject';
  const classSection = data.classSection || 'Class XII';
  const studentName = data.studentName || 'Student Name';

  const defaultBody = `I would like to express my sincere gratitude to my subject teacher, ${facultyName}, school authorities, and parents for their valuable guidance, encouragement, and support throughout the completion of this ${classSection} project work. Their continuous motivation and constructive suggestions helped me successfully complete this project in a disciplined and systematic manner.\n\nI am also thankful to all those who directly or indirectly contributed towards the successful completion of this project. The experience gained during the preparation of this work has enhanced my understanding of ${subject} and improved my practical knowledge.\n\nLastly, I would like to thank my friends and classmates for their cooperation and assistance whenever required.`;

  const E = (field, def, sizeKey, block = false, style = {}) => (
    <EditField key={field} fieldKey={field} value={data[field] || def} sizeCqw={sz(sizeKey || field)} onEdit={edit} onActivate={setActiveField} block={block} style={style} />
  );

  const renderContent = () => (
    <>
      <div style={{ textAlign: 'center', marginBottom: '2cqw' }}>
        {E('ackTitle', 'Acknowledgement', 'ackTitle', false, { fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color, display: 'block' })}
        <div style={{ width: '40%', height: '0.3cqw', background: color, margin: '1cqw auto 0' }} />
      </div>
      <div style={{ flex: 1, width: '100%', textAlign: 'left' }}>
        {E('ackBody', defaultBody, 'ackBody', true, { color: '#222', textAlign: 'justify', lineHeight: 1.85, fontWeight: 400 })}
      </div>
      <div style={{ width: '100%', marginTop: 'auto', paddingTop: '1.5cqw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            {E('ackStudentLabel', "Student's Signature", 'ackSigs', false, { display: 'block', color: '#555' })}
            <div style={{ borderBottom: `0.15cqw solid ${color}`, width: '75%', margin: '4cqw 0 0.8cqw' }} />
            {E('studentName', studentName, 'ackSigs', false, { fontWeight: 700 })}
          </div>
          <div style={{ textAlign: 'right' }}>
            {E('ackTeacherLabel', "Teacher's Signature", 'ackSigs', false, { display: 'block', color: '#555' })}
            <div style={{ borderBottom: `0.15cqw solid ${color}`, width: '75%', margin: '4cqw 0 0.8cqw', marginLeft: 'auto' }} />
            {E('facultyName', facultyName, 'ackSigs', false, { fontWeight: 700 })}
          </div>
        </div>
      </div>
      {isRoyal && <div style={{ fontSize: '2.5cqw', color, paddingTop: '1cqw', textAlign: 'center' }}>✦ ✦ ✦</div>}
    </>
  );

  if (isBand) {
    const bg = template === 'gradient' ? `linear-gradient(135deg,${color} 0%,${color}99 100%)` : color;
    return (
      <div className="a4-wrapper">
        <FloatingToolbar active={activeField} fontSizes={fontSizes} onSizeChange={onFontSizeChange} />
        <div className="a4-paper" ref={ref} style={{ fontFamily: "'Times New Roman',Georgia,serif", display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <div style={{ background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1cqw', padding: '2.5cqw 6%' }}>
            <Logo school={selectedSchool} customLogo={customLogo} sizeCqw={10 * scale} color="#fff" />
            <div style={{ fontWeight: 700, color: '#fff', textAlign: 'center', fontSize: '4.2cqw', lineHeight: 1.2 }}>{selectedSchool?.name || 'School Name'}</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '2.2cqw', textAlign: 'center' }}>{selectedSchool?.address || '\u00A0'}</div>
          </div>
          <div style={{ height: '0.5cqw', background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '3% 7%' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="a4-wrapper">
      <FloatingToolbar active={activeField} fontSizes={fontSizes} onSizeChange={onFontSizeChange} />
      <div className="a4-paper" ref={ref} style={{ fontFamily: "'Times New Roman',Georgia,serif", position: 'relative', background: '#fff' }}>
        <div style={{ position: 'absolute', inset: '2%', border: `0.5cqw ${isRoyal ? 'double' : 'solid'} ${color}`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '3.2%', border: `0.15cqw solid ${color}44`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '6%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isRoyal && <div style={{ fontSize: '2.5cqw', color, marginBottom: '0.5cqw' }}>✦ ✦ ✦</div>}
          <Logo school={selectedSchool} customLogo={customLogo} sizeCqw={10 * scale} color={color} />
          <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '4.2cqw', lineHeight: 1.2, textAlign: 'center', marginTop: '1cqw' }}>{selectedSchool?.name || 'School Name'}</div>
          <div style={{ color: '#666', fontStyle: 'italic', fontSize: '2.2cqw', marginTop: '0.4cqw' }}>{selectedSchool?.address || '\u00A0'}</div>
          {isRoyal ? <div style={{ width: '60%', height: '0.15cqw', background: `linear-gradient(90deg,transparent,${color},transparent)`, margin: '1.2cqw auto' }} />
                   : <div style={{ width: '75%', height: '0.2cqw', background: color, margin: '1cqw 0' }} />}
          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
});

AcknowledgementPreview.displayName = 'AcknowledgementPreview';
export default AcknowledgementPreview;
