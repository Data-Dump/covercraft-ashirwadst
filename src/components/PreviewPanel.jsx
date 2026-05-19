import React, { useRef, useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CoverPreview from './CoverPreview';
import AcknowledgementPreview from './AcknowledgementPreview';
import CertificatePreview from './CertificatePreview';
import schoolsData from '../data/schools.json';

const PageLabel = ({ number, title }) => (
  <div className="page-label-bar" style={{
    width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.2rem 0',
  }}>
    <div style={{
      background: 'rgba(79,142,247,0.15)', border: '1px solid rgba(79,142,247,0.3)',
      color: 'var(--accent)', borderRadius: '99px', padding: '0.15rem 0.65rem',
      fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap',
    }}>Page {number}</div>
    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{title}</div>
  </div>
);

export default function PreviewPanel({ data, customLogo, template, onReset, addToast, fontSizes, onFontSizeChange, onInlineEdit, language }) {
  const coverRef = useRef(null);
  const ackRef = useRef(null);
  const certRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [displayData, setDisplayData] = useState(data);

  useEffect(() => {
    if (language === 'en') { setDisplayData(data); return; }
    const fieldsToTranslate = ['studentName', 'subject', 'projectTitle', 'facultyName', 'classSection'];
    const textToTranslate = fieldsToTranslate.map(f => data[f] || '').join('\n');
    if (!textToTranslate.trim()) { setDisplayData(data); return; }
    const timeout = setTimeout(() => {
      fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=hi&dt=t&q=${encodeURIComponent(textToTranslate)}`)
        .then(res => res.json())
        .then(json => {
          if (json && json[0]) {
            const translatedText = json[0].map(s => s[0]).join('');
            const translatedLines = translatedText.split('\n');
            const newData = { ...data };
            fieldsToTranslate.forEach((f, i) => { newData[f] = translatedLines[i]?.trim() || data[f]; });
            setDisplayData(newData);
          }
        })
        .catch(() => setDisplayData(data));
    }, 400);
    return () => clearTimeout(timeout);
  }, [data, language]);

  const selectedSchool = schoolsData.find(s => s.id === displayData.schoolId);
  let schoolName = displayData.schoolId === 'custom'
    ? (displayData.customSchoolName || 'School Name')
    : (selectedSchool?.name || '');
  let schoolAddress = selectedSchool?.city ? `${selectedSchool.city}, ${selectedSchool.state}` : '';
  if (language === 'hi' && displayData.schoolId !== 'custom') {
    schoolName = selectedSchool?.nameHi || schoolName;
    schoolAddress = selectedSchool?.cityHi ? `${selectedSchool.cityHi}, ${selectedSchool.stateHi}` : schoolAddress;
  }
  const school = { ...(selectedSchool || {}), name: schoolName, address: schoolAddress };

  const captureRef = async (ref) => {
    if (!ref.current) return null;
    return html2canvas(ref.current, {
      scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
    });
  };

  const handleDownloadAll = useCallback(async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const refs = [coverRef, ackRef, certRef];
      for (let i = 0; i < refs.length; i++) {
        const canvas = await captureRef(refs[i]);
        if (!canvas) continue;
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, 210, 297);
      }
      pdf.save((data.projectTitle || 'Project').replace(/[^a-z0-9]/gi, '_') + '_Complete.pdf');
      addToast('✅ All 3 pages downloaded!', 'success');
    } catch { addToast('❌ PDF generation failed.', 'error'); }
    finally { setExporting(false); }
  }, [data, addToast]);

  const handleDownloadSingle = useCallback(async (ref, label) => {
    setExporting(true);
    try {
      const canvas = await captureRef(ref);
      if (!canvas) return;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, 210, 297);
      pdf.save(label.replace(/[^a-z0-9]/gi, '_') + '.pdf');
      addToast(`✅ ${label} downloaded!`, 'success');
    } catch { addToast('❌ PDF generation failed.', 'error'); }
    finally { setExporting(false); }
  }, [addToast]);

  return (
    <div className="preview-panel">

      {/* ── Toolbar ── */}
      <div className="preview-toolbar">
        <span className="preview-badge">📄 3-Page Preview · Click cover text to edit</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button id="btn-reset" className="btn btn-danger btn-sm" onClick={onReset}>↺ Reset</button>
          <button id="btn-print" className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨 Print</button>
          <button
            id="btn-download-all"
            className="btn btn-success btn-sm"
            onClick={handleDownloadAll}
            disabled={exporting}
            title="Download all 3 pages as one PDF"
          >
            {exporting ? <><span className="spinner" /> Generating…</> : '📦 Download All (3 Pages)'}
          </button>
        </div>
      </div>

      {/* ── Page 1: Cover ── */}
      <PageLabel number={1} title="Cover Page" />
      <CoverPreview
        ref={coverRef}
        data={displayData}
        selectedSchool={school}
        customLogo={customLogo}
        template={template}
        fontSizes={fontSizes}
        onFontSizeChange={onFontSizeChange}
        onInlineEdit={onInlineEdit}
        language={language}
      />
      <div style={{ width: '100%', maxWidth: 600 }}>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '0.3rem' }}
          onClick={() => handleDownloadSingle(coverRef, data.projectTitle || 'CoverPage')} disabled={exporting}>
          ⬇ Download Cover Page
        </button>
      </div>

      {/* ── Page 2: Acknowledgement ── */}
      <PageLabel number={2} title="Acknowledgement" />
      <AcknowledgementPreview
        ref={ackRef}
        data={displayData}
        selectedSchool={school}
        customLogo={customLogo}
        template={template}
        onInlineEdit={onInlineEdit}
        fontSizes={fontSizes}
        onFontSizeChange={onFontSizeChange}
      />
      <div className="page-dl-btn" style={{ width: '100%', maxWidth: 600 }}>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '0.3rem' }}
          onClick={() => handleDownloadSingle(ackRef, 'Acknowledgement')} disabled={exporting}>
          ⬇ Download Acknowledgement
        </button>
      </div>

      {/* ── Page 3: Certificate ── */}
      <PageLabel number={3} title="Certificate" />
      <CertificatePreview
        ref={certRef}
        data={displayData}
        selectedSchool={school}
        customLogo={customLogo}
        template={template}
        onInlineEdit={onInlineEdit}
        fontSizes={fontSizes}
        onFontSizeChange={onFontSizeChange}
      />
      <div className="page-dl-btn" style={{ width: '100%', maxWidth: 600 }}>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '0.3rem' }}
          onClick={() => handleDownloadSingle(certRef, 'Certificate')} disabled={exporting}>
          ⬇ Download Certificate
        </button>
      </div>

      <p className="preview-hint-text" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '1rem' }}>
        Click any text on Cover to edit · Details auto-fill from the form · "Download All" combines all 3 pages into one PDF
      </p>
    </div>
  );
}
