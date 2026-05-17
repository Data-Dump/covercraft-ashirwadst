import React, { useState } from 'react';

const PASSWORD_HASH = 'ec54e99514663edb97adef400fbf34a77daae108303d3da8008a7dfb4cdf0f52';

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use Web Crypto API to hash the password and compare
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex === PASSWORD_HASH) {
        onLogin();
      } else {
        setError(true);
        setPassword('');
      }
    } catch (err) {
      console.error('Hashing failed:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-icon">📄</div>
          <h2>Cover<span>Craft</span></h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            by Ashirwad Stationery, Mandsaur
          </p>
          <p>Please enter the password to access the generator.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              autoFocus
            />
            {error && <div className="error-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>Incorrect Password</div>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !password}>
            {loading ? <span className="spinner" /> : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
