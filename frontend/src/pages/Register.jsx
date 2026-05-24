import React, { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Phone, MapPin, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Register({ setCurrentPage, showToast }) {
  const { t, currentLanguage } = useLanguage();
  const { setError, error } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Reset errors when entering page
  useEffect(() => {
    setError(null);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    // Client side basic validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword || !formData.fullName.trim() || !formData.phone.trim()) {
      setError(currentLanguage === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(currentLanguage === 'hi' ? 'पासवर्ड मेल नहीं खाते हैं।' : 'Passwords do not match.');
      return;
    }

    if (formData.phone.length < 10) {
      setError(currentLanguage === 'hi' ? 'मोबाइल नंबर कम से कम 10 अंकों का होना चाहिए।' : 'Mobile number must be at least 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(currentLanguage === 'hi' ? 'पंजीकरण सफल! कृपया लॉगिन करें।' : 'Registration successful! Redirecting to login...');
        if (showToast) showToast(currentLanguage === 'hi' ? 'पंजीकरण सफल!' : 'Registration successful!', 'success');
        setTimeout(() => {
          setCurrentPage('login');
        }, 2000);
      } else {
        setError(data.error || (currentLanguage === 'hi' ? 'पंजीकरण विफल रहा।' : 'Registration failed.'));
      }
    } catch (err) {
      setError(currentLanguage === 'hi' ? 'कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।' : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '2rem 1.5rem' }}>
      {/* Background glow filters */}
      <div className="glowing-bg glow-top-left" style={{ opacity: 0.25 }} />
      <div className="glowing-bg glow-bottom-right" style={{ opacity: 0.25 }} />

      <div className="card-glass auth-card" style={{ maxWidth: '500px' }}>
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
              <UserPlus size={26} />
            </div>
          </div>
          <h2>{t('register.title')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('register.subtitle')}</p>
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

        {successMsg && (
          <div className="badge badge-resolved" style={{
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
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="fullName">{t('register.fullName')} *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={currentLanguage === 'hi' ? 'पूरा नाम' : 'John Doe'}
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0 1rem' }}>
            <div className="form-group">
              <label htmlFor="username">{t('login.username')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={currentLanguage === 'hi' ? 'यूजरनेम' : 'john_doe'}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('register.email')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0 1rem' }}>
            <div className="form-group">
              <label htmlFor="phone">{t('register.phone')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">{t('register.address')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={currentLanguage === 'hi' ? 'आवासीय पता' : 'Sector 62, Noida'}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '0 1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="password">{t('login.password')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('register.confirmPassword')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ marginRight: '6px' }}></span>
                {currentLanguage === 'hi' ? 'पंजीकरण किया जा रहा है...' : 'Registering Account...'}
              </>
            ) : (
              t('register.btn')
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>{t('register.hasAccount')} </span>
            <button
              onClick={() => setCurrentPage('login')}
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
              {t('register.loginLink')}
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

      </div>
    </div>
  );
}
