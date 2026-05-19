import React, { useState, useEffect, useCallback } from 'react';
import FormPanel from './components/FormPanel';
import PreviewPanel from './components/PreviewPanel';
import LoginScreen from './components/LoginScreen';
import schoolsData from './data/schools.json';

const DEFAULT_DATA = {
  schoolId: 'st_thomas',
  customSchoolName: '',
  studentName: '',
  subject: '',
  projectTitle: '',
  facultyName: '',
  classSection: '',
  session: '',
  themeColor: schoolsData[0].theme,
  logoSizeScale: 1.0,
  // Acknowledgement editable text
  ackTitle: '', ackBody: '', ackStudentLabel: '', ackTeacherLabel: '',
  // Certificate editable text
  certTitle: '', certIntroText: '', certBody: '',
  certInternalLabel: '', certExternalLabel: '',
  certForwardedLabel: '', certPrincipalLabel: '',
};

export const DEFAULT_FONT_SIZES = {
  schoolName: 4.8, address: 2.2, subject: 4.2, projectTitle: 7.0,
  studentName: 3.2, classSection: 2.4, facultyName: 3.2, session: 2.4, description: 2.6,
  // Acknowledgement
  ackTitle: 5.0, ackBody: 2.8, ackSigs: 2.4,
  // Certificate
  certTitle: 4.8, certIntro: 2.6, certProjectTitle: 3.8, certBody: 2.8, certSigs: 2.5, certForwarded: 2.5,
};

function Toast({ id, message, type, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 3500);
    return () => clearTimeout(t);
  }, [id, onRemove]);
  return <div className={`toast ${type}`}>{message}</div>;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const [data, setData] = useState(DEFAULT_DATA);
  const [template, setTemplate] = useState('classic');
  const [customLogo, setCustomLogo] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [fontSizes, setFontSizes] = useState(DEFAULT_FONT_SIZES);
  
  // Initialize authentication state from sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('covercraft_auth') === 'true';
  });

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Called when user edits text inline on the preview
  const handleInlineEdit = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Called when user clicks A+ / A- on the floating toolbar
  const handleFontSizeChange = useCallback((field, delta) => {
    setFontSizes(prev => ({
      ...prev,
      [field]: Math.max(1, Math.min(15, +(prev[field] + delta).toFixed(1))),
    }));
  }, []);

  const handleReset = () => {
    setData(DEFAULT_DATA);
    setFontSizes(DEFAULT_FONT_SIZES);
    setCustomLogo(null);
    setTemplate('classic');
    addToast('Form reset successfully', 'info');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => {
      sessionStorage.setItem('covercraft_auth', 'true');
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className={`app-shell ${darkMode ? '' : 'light-mode'}`}>
      <header className="app-header">
        <div className="logo-mark">
          <div className="logo-icon">📄</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="logo-text" style={{ lineHeight: 1.1 }}>Cover<span>Craft</span></div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
              by Ashirwad Stationery, Mandsaur
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--success)', fontSize: '0.6rem' }}>●</span>
          Click any text on the preview to edit it directly
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')} title="Toggle Language">
            🌐 {language === 'en' ? 'EN' : 'HI'}
          </button>
          <button id="btn-dark-mode" className="btn btn-ghost btn-sm"
            onClick={() => setDarkMode(d => !d)}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <FormPanel
          data={data}
          onChange={setData}
          template={template}
          onTemplateChange={setTemplate}
          customLogo={customLogo}
          onCustomLogoChange={setCustomLogo}
        />
        <PreviewPanel
          data={data}
          customLogo={customLogo}
          template={template}
          onReset={handleReset}
          addToast={addToast}
          fontSizes={fontSizes}
          onFontSizeChange={handleFontSizeChange}
          onInlineEdit={handleInlineEdit}
          language={language}
        />
      </main>

      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} {...t} onRemove={removeToast} />)}
      </div>
    </div>
  );
}
