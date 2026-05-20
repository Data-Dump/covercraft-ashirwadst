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

const CertificatePreview = forwardRef(({ data, selectedSchool, customLogo, template, onInlineEdit, fontSizes, onFontSizeChange, language }, ref) => {
  const [activeField, setActiveField] = useState(null);
  const color = data.themeColor || selectedSchool?.theme || '#1e3a8a';
  const scale = data.logoSizeScale || 1.0;
  const isBand = template === 'modern' || template === 'gradient';
  const isRoyal = template === 'royal';
  const edit = onInlineEdit || (() => {});
  const sz = f => fontSizes?.[f] ?? 3;

  // clear toolbar when clicking outside
  useEffect(() => {
    const handler = e => { if (!e.target.closest('.ef') && !e.target.closest('[data-toolbar]')) setActiveField(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const studentName = data.studentName || 'Student Name';
  const facultyName = data.facultyName || 'Subject Teacher';
  const projectTitle = data.projectTitle || '______________________________';
  const classSection = data.classSection || 'Class XII';
  const session = data.session || '20____ \u2013 20____';
  const schoolDisplay = `${selectedSchool?.name || 'School Name'}${selectedSchool?.address ? `, ${selectedSchool.address}` : ''}`;

  const TRANSLATIONS = {
    en: {
      certTitle: 'Certificate',
      certIntroText: 'This is to certify that the project work entitled',
      certBody: `has been successfully completed by ${studentName}, student of ${classSection}, during the academic session ${session}, under my guidance and supervision. The work submitted is original and fulfills the requirements prescribed by the school curriculum. To the best of my knowledge, this project has not been copied from any other source and reflects the sincere efforts of the student. I wish the student success in all future academic endeavors.`,
      certInternalLabel: 'Signature of',
      certInternalExaminer: 'Internal Examiner',
      certExternalLabel: 'Signature of',
      certExternalExaminer: 'External Examiner',
      certForwardedLabel: 'Forwarded by',
      certPrincipalLabel: 'Principal'
    },
    hi: {
      certTitle: 'प्रमाण पत्र',
      certIntroText: 'यह प्रमाणित किया जाता है कि परियोजना कार्य जिसका शीर्षक',
      certBody: `को ${studentName}, ${classSection} के छात्र द्वारा, मेरे मार्गदर्शन और पर्यवेक्षण के तहत शैक्षणिक सत्र ${session} के दौरान सफलतापूर्वक पूरा किया गया है। प्रस्तुत किया गया कार्य मूल है और स्कूल पाठ्यक्रम द्वारा निर्धारित आवश्यकताओं को पूरा करता है। मेरी सर्वोत्तम जानकारी के अनुसार, यह परियोजना किसी अन्य स्रोत से कॉपी नहीं की गई है और छात्र के सच्चे प्रयासों को दर्शाती है। मैं छात्र को भविष्य के सभी शैक्षणिक प्रयासों में सफलता की कामना करता हूँ।`,
      certInternalLabel: 'हस्ताक्षर',
      certInternalExaminer: 'आंतरिक परीक्षक',
      certExternalLabel: 'हस्ताक्षर',
      certExternalExaminer: 'बाह्य परीक्षक',
      certForwardedLabel: 'अग्रसारित',
      certPrincipalLabel: 'प्राचार्य'
    }
  };
  const t = TRANSLATIONS[language || 'en'];

  const E = (field, def, sizeKey, block = false, style = {}) => (
    <EditField key={field} fieldKey={field} value={data[field] || def} sizeCqw={sz(sizeKey || field)} onEdit={edit} onActivate={setActiveField} block={block} style={style} />
  );

  const renderContent = () => (
    <>
      <div style={{ textAlign: 'center', marginBottom: isBand ? '1.8cqw' : '1.2cqw' }}>
        {E('certTitle', t.certTitle, 'certTitle', false, { fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color, display: 'block' })}
        <div style={{ width: '40%', height: '0.3cqw', background: color, margin: '0.8cqw auto 0' }} />
      </div>
      <div style={{ textAlign: 'center', marginBottom: isBand ? '1.5cqw' : '1cqw' }}>
        {E('certIntroText', t.certIntroText, 'certIntro', false, { fontStyle: 'italic', color: '#555', display: 'block', textAlign: 'center' })}
      </div>
      <div style={{ textAlign: 'center', border: `0.2cqw solid ${color}55`, borderRadius: '1cqw', padding: isBand ? '1cqw 3cqw' : '0.8cqw 2.5cqw', marginBottom: isBand ? '1.5cqw' : '1cqw', background: `${color}08` }}>
        <span style={{ fontSize: `${sz('certProjectTitle')}cqw`, fontWeight: 800, color, fontFamily: "'Playfair Display',serif", fontStyle: 'italic' }}>
          &ldquo;<EditField fieldKey="projectTitle" value={data.projectTitle || projectTitle} sizeCqw={sz('certProjectTitle')} onEdit={edit} onActivate={setActiveField} style={{ fontWeight: 800, color, fontFamily: "'Playfair Display',serif", fontStyle: 'italic' }} />&rdquo;
        </span>
      </div>
      <div style={{ textAlign: 'justify', textIndent: '5cqw' }}>
        {E('certBody', t.certBody, 'certBody', true, { color: '#222', lineHeight: isBand ? 1.85 : 1.7, fontWeight: 400 })}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2cqw', marginTop: isBand ? '4cqw' : '2.5cqw', marginBottom: isBand ? '3cqw' : '1.5cqw' }}>
        <div>
          {E('certInternalLabel', t.certInternalLabel, 'certSigs', false, { display: 'block', fontWeight: 700, marginBottom: isBand ? '5cqw' : '3cqw' })}
          <div style={{ borderBottom: `0.15cqw solid ${color}`, width: '80%', marginBottom: '0.8cqw' }} />
          {E('certInternalExaminer', t.certInternalExaminer, 'certSigs', false, { fontWeight: 700 })}
        </div>
        <div style={{ textAlign: 'right' }}>
          {E('certExternalLabel', t.certExternalLabel, 'certSigs', false, { display: 'block', fontWeight: 700, marginBottom: isBand ? '5cqw' : '3cqw' })}
          <div style={{ borderBottom: `0.15cqw solid ${color}`, width: '80%', marginLeft: 'auto', marginBottom: '0.8cqw' }} />
          {E('certExternalExaminer', t.certExternalExaminer, 'certSigs', false, { fontWeight: 700 })}
        </div>
      </div>
      <div style={{ textAlign: 'center', borderTop: `0.15cqw solid ${color}33`, paddingTop: isBand ? '2.5cqw' : '1.5cqw' }}>
        {E('certForwardedLabel', t.certForwardedLabel, 'certForwarded', false, { display: 'block', color: '#555', marginBottom: isBand ? '4cqw' : '2cqw' })}
        <div style={{ borderBottom: `0.15cqw solid ${color}`, width: '45%', margin: '0 auto 0.8cqw' }} />
        {E('certPrincipalLabel', t.certPrincipalLabel, 'certForwarded', false, { display: 'block', fontWeight: 700 })}
        <div style={{ fontSize: `${sz('certForwarded') * 0.88}cqw`, color: '#555', marginTop: '0.3cqw' }}>{schoolDisplay}</div>
      </div>
      {isRoyal && <div style={{ fontSize: '2.5cqw', color, paddingTop: '0.5cqw', textAlign: 'center' }}>✦ ✦ ✦</div>}
    </>
  );

  if (isBand) {
    const bg = template === 'gradient' ? `linear-gradient(135deg,${color} 0%,${color}99 100%)` : color;
    return (
      <div className="a4-wrapper">
        <FloatingToolbar active={activeField} fontSizes={fontSizes} onSizeChange={onFontSizeChange} />
        <div className="a4-paper" ref={ref} style={{ fontFamily: language === 'hi' ? "'Mukta', 'Inter', 'Times New Roman', serif" : "'Times New Roman',Georgia,serif", display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <div style={{ background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1cqw', padding: '2cqw 6%' }}>
            <Logo school={selectedSchool} customLogo={customLogo} sizeCqw={9 * scale} color="#fff" />
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
      <div className="a4-paper" ref={ref} style={{ fontFamily: language === 'hi' ? "'Mukta', 'Inter', 'Times New Roman', serif" : "'Times New Roman',Georgia,serif", position: 'relative', background: '#fff' }}>
        <div style={{ position: 'absolute', inset: '2%', border: `0.5cqw ${isRoyal ? 'double' : 'solid'} ${color}`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '3.2%', border: `0.15cqw solid ${color}44`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '6%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isRoyal && <div style={{ fontSize: '2.5cqw', color, marginBottom: '0.5cqw' }}>✦ ✦ ✦</div>}
          <Logo school={selectedSchool} customLogo={customLogo} sizeCqw={10 * scale} color={color} />
          <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '3.8cqw', lineHeight: 1.2, textAlign: 'center', marginTop: '1cqw' }}>{selectedSchool?.name || 'School Name'}</div>
          <div style={{ color: '#666', fontStyle: 'italic', fontSize: '2cqw', marginTop: '0.4cqw' }}>{selectedSchool?.address || '\u00A0'}</div>
          {isRoyal ? <div style={{ width: '60%', height: '0.15cqw', background: `linear-gradient(90deg,transparent,${color},transparent)`, margin: '1cqw auto' }} />
                   : <div style={{ width: '75%', height: '0.2cqw', background: color, margin: '0.8cqw 0' }} />}
          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
          </div>
          {isRoyal && <div style={{ fontSize: '2.5cqw', color, paddingTop: '0.5cqw' }}>✦ ✦ ✦</div>}
        </div>
      </div>
    </div>
  );
});

CertificatePreview.displayName = 'CertificatePreview';
export default CertificatePreview;
