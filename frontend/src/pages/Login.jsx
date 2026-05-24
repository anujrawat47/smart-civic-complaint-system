import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login({ setCurrentPage, showToast }) {
  const { login, error, setError, user } = useAuth();
  const { t, currentLanguage } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear errors when entering page
  useEffect(() => {
    setError(null);
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setCurrentPage('dashboard');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(currentLanguage === 'hi' ? 'कृपया सभी फ़ील्ड भरें।' : 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    const success = await login(username.trim(), password);
    setLoading(false);

    if (success) {
      if (showToast) showToast(currentLanguage === 'hi' ? 'लॉगिन सफल!' : 'Login successful!', 'success');
      setCurrentPage('dashboard');
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Background glow filters */}
      <div className="glowing-bg glow-top-left" style={{ opacity: 0.3 }} />
      <div className="glowing-bg glow-bottom-right" style={{ opacity: 0.3 }} />

      <div className="card-glass auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <div style={{
              background: 'var(--gradient-primary)',
              color: '#fff',
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}>
              <LogIn size={26} />
            </div>
          </div>
          <h2>{t('login.title')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('login.subtitle')}</p>
        </div>

        {/* Quick Role Login Switcher */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
            ⚡ Quick Sign-In Roles:
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={async () => {
                setUsername('citizen1');
                setPassword('citizen123');
                setLoading(true);
                const success = await login('citizen1', 'citizen123');
                setLoading(false);
                if (success) {
                  if (showToast) showToast('Logged in as Citizen (Jamie)!', 'success');
                  setCurrentPage('dashboard');
                }
              }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(15,23,42,0.12)', fontWeight: 700, background: '#ffffff', color: '#0f172a' }}
              disabled={loading}
            >
              👤 Citizen
            </button>
            <button
              type="button"
              onClick={async () => {
                setUsername('worker1');
                setPassword('worker123');
                setLoading(true);
                const success = await login('worker1', 'worker123');
                setLoading(false);
                if (success) {
                  if (showToast) showToast('Logged in as Worker (Inspector Roy)!', 'success');
                  setCurrentPage('dashboard');
                }
              }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(15,23,42,0.12)', fontWeight: 700, background: '#ffffff', color: '#0f172a' }}
              disabled={loading}
            >
              👷 Worker
            </button>
            <button
              type="button"
              onClick={async () => {
                setUsername('admin');
                setPassword('admin123');
                setLoading(true);
                const success = await login('admin', 'admin123');
                setLoading(false);
                if (success) {
                  if (showToast) showToast('Logged in as Administrator!', 'success');
                  setCurrentPage('dashboard');
                }
              }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(15,23,42,0.12)', fontWeight: 700, background: '#ffffff', color: '#0f172a' }}
              disabled={loading}
            >
              👑 Admin
            </button>
          </div>
        </div>


        {error && (
          <div className="badge badge-rejected" style={{
            width: '100%',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textTransform: 'none',
            fontSize: '0.8rem',
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('login.username')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={currentLanguage === 'hi' ? 'अपना यूजरनेम दर्ज करें' : 'Enter your username'}
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="password">{t('login.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', gap: '0.5rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ marginRight: '6px' }}></span>
                {currentLanguage === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Authenticating...'}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {t('login.btn')}
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>{t('login.noAccount')} </span>
            <button
              onClick={() => setCurrentPage('register')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              {t('login.signupLink')}
            </button>
          </div>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500,
              fontSize: '0.8rem',
              padding: 0
            }}
          >
            ← Back to Home
          </button>
        </div>


        {/* Demo Credentials Help */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            🔑 {currentLanguage === 'hi' ? 'परीक्षण क्रेडेंशियल्स:' : 'Local Testing Credentials:'}
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li><strong>Admin:</strong> admin / admin123</li>
            <li><strong>Worker:</strong> worker1 / worker123</li>
            <li><strong>Citizen:</strong> citizen1 / citizen123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
