import React, { useRef, useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CoverPreview from './CoverPreview';
import schoolsData from '../data/schools.json';

export default function PreviewPanel({ data, customLogo, template, onReset, addToast, fontSizes, onFontSizeChange, onInlineEdit, language }) {
  const previewRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [displayData, setDisplayData] = useState(data);

  useEffect(() => {
    if (language === 'en') {
      setDisplayData(data);
      return;
    }

    const fieldsToTranslate = ['studentName', 'subject', 'projectTitle', 'facultyName', 'classSection'];
    const textToTranslate = fieldsToTranslate.map(f => data[f] || '').join('\n');
    
    if (!textToTranslate.trim()) {
      setDisplayData(data);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=hi&dt=t&q=${encodeURIComponent(textToTranslate)}`)
        .then(res => res.json())
        .then(json => {
          if (json && json[0]) {
            const translatedText = json[0].map(s => s[0]).join('');
            const translatedLines = translatedText.split('\n');
            const newData = { ...data };
            fieldsToTranslate.forEach((f, i) => {
              newData[f] = translatedLines[i]?.trim() || data[f];
            });
            setDisplayData(newData);
          }
        })
        .catch(err => {
          console.error("Translation failed", err);
          setDisplayData(data);
        });
    }, 400);

    return () => clearTimeout(timeout);
  }, [data, language]);

  const selectedSchool = schoolsData.find(s => s.id === displayData.schoolId);
  
  let schoolName = displayData.schoolId === 'custom' ? (displayData.customSchoolName || 'School Name') : (selectedSchool?.name || '');
  let schoolAddress = selectedSchool?.city ? `${selectedSchool.city}, ${selectedSchool.state}` : '';

  if (language === 'hi' && displayData.schoolId !== 'custom') {
    schoolName = selectedSchool?.nameHi || schoolName;
    schoolAddress = selectedSchool?.cityHi ? `${selectedSchool.cityHi}, ${selectedSchool.stateHi}` : schoolAddress;
  }

  const school = { 
    ...(selectedSchool || {}), 
    name: schoolName,
    address: schoolAddress
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const el = previewRef.current;
      const canvas = await html2canvas(el, {
        scale: 3, useCORS: true, allowTaint: true,
        backgroundColor: '#ffffff', logging: false,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      const filename = (data.projectTitle || 'CoverPage').replace(/[^a-z0-9]/gi, '_') + '.pdf';
      pdf.save(filename);
      addToast('✅ PDF downloaded!', 'success');
    } catch (err) {
      addToast('❌ PDF generation failed.', 'error');
    } finally {
      setExporting(false);
    }
  }, [data, addToast]);

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <span className="preview-badge">📄 A4 Live Preview · Click text to edit</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button id="btn-reset" className="btn btn-danger btn-sm" onClick={onReset}>↺ Reset</button>
          <button id="btn-print" className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨 Print</button>
          <button id="btn-download" className="btn btn-success btn-sm" onClick={handleDownloadPDF} disabled={exporting}>
            {exporting ? <><span className="spinner" /> Generating…</> : '⬇ Download PDF'}
          </button>
        </div>
      </div>

      <CoverPreview
        ref={previewRef}
        data={displayData}
        selectedSchool={school}
        customLogo={customLogo}
        template={template}
        fontSizes={fontSizes}
        onFontSizeChange={onFontSizeChange}
        onInlineEdit={onInlineEdit}
        language={language}
      />

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '1rem' }}>
        Click any text to edit · Use A+/A− to resize · PDF matches preview exactly
      </p>
    </div>
  );
}
