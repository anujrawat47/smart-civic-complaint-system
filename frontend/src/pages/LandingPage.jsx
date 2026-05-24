import React, { useState, useEffect } from 'react';
import { Search, Eye, Camera, CheckCircle2, AlertCircle, ArrowRight, Activity, Clock, Shield, Heart, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ setCurrentPage, setSelectedComplaintId, setPreselectedCategory }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  
  const [trackerId, setTrackerId] = useState('');
  const [trackerError, setTrackerError] = useState('');
  const [stats, setStats] = useState({
    total: 12,
    pending: 4,
    inProgress: 3,
    resolved: 5
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats from backend public API
  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await fetch('/api/stats/public');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats({
              total: data.total,
              pending: data.pending,
              inProgress: data.inProgress,
              resolved: data.resolved
            });
          }
        }
      } catch (err) {
        console.error("Failed to load public stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchPublicStats();
  }, []);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setTrackerError('');
    if (!trackerId.trim()) return;

    try {
      const cleanedIdStr = trackerId.toUpperCase().replace("CIV-", "").trim();
      const response = await fetch(`/api/complaints/track/${cleanedIdStr}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedComplaintId(data.complaint.id);
          setCurrentPage('timeline');
        } else {
          setTrackerError(currentLanguage === 'hi' ? 'शिकायत नहीं मिली।' : 'Complaint not found.');
        }
      } else {
        setTrackerError(currentLanguage === 'hi' ? 'शिकायत संख्या अमान्य है।' : 'Invalid complaint ID number.');
      }
    } catch (err) {
      setTrackerError(currentLanguage === 'hi' ? 'कनेक्शन त्रुटि।' : 'Connection error.');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      
      {/* SECTION 1: HERO CONTAINER (Matches Screen 3) */}
      <section style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', margin: '1rem 0 3.5rem', flexWrap: 'wrap', textAlign: 'left' }}>
        
        {/* Left side text column (2/3 width) */}
        <div style={{ flex: '1.3', minWidth: '320px' }}>
          {/* Trusted pill */}
          <span className="pulse-badge" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
            <span className="pulse-dot"></span>
            Trusted by 50+ Municipalities
          </span>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--heading-color)', lineHeight: 1.1, margin: '0.5rem 0 1.25rem', fontFamily: "'Outfit', sans-serif" }}>
            Better Communities,<br />Together.
          </h1>

          <p style={{ color: 'var(--muted-text)', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '2rem', maxWidth: '580px' }}>
            A seamless platform for citizens and local governments to collaborate on resolving local issues, from potholes to park maintenance.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setCurrentPage(user ? 'submit' : 'login')} className="btn btn-primary" style={{ background: '#166534', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              Report an Issue <ArrowRight size={16} />
            </button>
            <button onClick={() => setCurrentPage('map')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem' }}>
              View Live Map
            </button>
          </div>
        </div>

        {/* Right side graphical card with floating metrics box */}
        <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', padding: '0.5rem' }}>
            <div style={{ height: '240px', background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '4.5rem', fontWeight: 800, position: 'relative' }}>
              👥
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(8px)', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                Springfield Citizen Coalition
              </div>
            </div>
          </div>

          {/* Average response time floating indicator */}
          <div className="card-glass" style={{ position: 'absolute', bottom: '-1.5rem', right: '-1rem', padding: '1rem', width: '210px', display: 'flex', gap: '0.75rem', alignItems: 'center', borderRadius: '12px', background: 'var(--floating-card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--badge-soft-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '1.2rem' }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--badge-soft-blue-text)', lineHeight: 1 }}>2.4h</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted-text)', fontWeight: 600, marginTop: '0.25rem', lineHeight: 1.2 }}>
                Avg response time for urgent safety claims.
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* SECTION 2: LIVE TRACKER BAR */}
      <section className="card-glass" style={{ padding: '1.5rem 2rem', marginBottom: '4rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              🎯 {currentLanguage === 'hi' ? 'शीघ्र शिकायत ट्रैकर' : 'Fast Tracker System'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '0.25rem' }}>
              {currentLanguage === 'hi' ? 'शिकायत संख्या दर्ज करें और तुरंत वास्तविक समय अपडेट प्राप्त करें' : 'Enter complaint number to view active field worker dispatches instantly.'}
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '420px', width: '100%' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={trackerId}
                onChange={(e) => setTrackerId(e.target.value)}
                placeholder={currentLanguage === 'hi' ? 'शिकायत आईडी दर्ज करें (e.g. 1)' : 'Enter Complaint ID (e.g. 1)'}
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem', height: '40px', fontSize: '0.85rem', borderRadius: '8px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--muted-text)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ background: '#166534', height: '40px', padding: '0 1.25rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              {t('hero.trackBtn')}
            </button>
          </form>
        </div>
        {trackerError && (
          <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
            <AlertCircle size={12} /> {trackerError}
          </p>
        )}
      </section>

      {/* SECTION 3: EMPOWERING LOCAL ACTION ROADMAP (Matches Screen 3 Roadmap) */}
      <section style={{ marginBottom: '5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--heading-color)', fontFamily: "'Outfit', sans-serif" }}>
          Empowering Local Action
        </h2>
        <p style={{ color: 'var(--muted-text)', fontSize: '0.9rem', maxWidth: '600px', margin: '0.5rem auto 3rem' }}>
          Our transparent 3-step process ensures your voice is heard and every issue is tracked to completion.
        </p>

        {/* 3 Step indicators horizontally aligned */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
          
          {/* Step 1 */}
          <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', background: 'var(--badge-soft-green-bg)' }}>
              <Eye size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading-color)', marginTop: '0.25rem' }}>Identify</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--muted-text)', lineHeight: 1.4, maxWidth: '240px' }}>
              Spot a problem in your neighborhood that needs municipal attention.
            </p>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--step-pill-text)', background: 'var(--step-pill-bg)', padding: '0.2rem 0.6rem', borderRadius: '9999px', marginTop: '0.5rem' }}>
              Step 01
            </span>
          </div>

          {/* Step 2 */}
          <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', background: 'var(--badge-soft-green-bg)' }}>
              <Camera size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading-color)', marginTop: '0.25rem' }}>Report</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--muted-text)', lineHeight: 1.4, maxWidth: '240px' }}>
              Snap a photo, add a location, and submit it instantly via the portal.
            </p>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--step-pill-text)', background: 'var(--step-pill-bg)', padding: '0.2rem 0.6rem', borderRadius: '9999px', marginTop: '0.5rem' }}>
              Step 02
            </span>
          </div>

          {/* Step 3 */}
          <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', background: 'var(--badge-soft-green-bg)' }}>
              <CheckCircle2 size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading-color)', marginTop: '0.25rem' }}>Resolve</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--muted-text)', lineHeight: 1.4, maxWidth: '240px' }}>
              Track progress as city teams work to fix the issue in real-time.
            </p>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--step-pill-text)', background: 'var(--step-pill-bg)', padding: '0.2rem 0.6rem', borderRadius: '9999px', marginTop: '0.5rem' }}>
              Step 03
            </span>
          </div>

        </div>
      </section>

      {/* SECTION 4: STATS SUCCESS PORTAL OVERVIEW (Matches Screen 3 Bottom card) */}
      <section className="card-glass" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '2.5rem', borderRadius: '24px', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative icon background */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'var(--badge-soft-green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          👥
        </div>

        <div style={{ maxWidth: '580px', textAlign: 'left', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--heading-color)', lineHeight: 1.2, fontFamily: "'Outfit', sans-serif" }}>
            Over 500 issues resolved this month.
          </h2>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.875rem', lineHeight: 1.5, marginTop: '0.75rem' }}>
            Each fixed streetlamp and cleared pathway is a step toward a more resilient, safer city for everyone. Join your neighbors in making a difference.
          </p>
        </div>

        {/* Stats metrics row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', borderTop: '1px solid var(--subtle-border)', paddingTop: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--heading-color)', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                {statsLoading ? '...' : (stats.total * 30 + 120)}+
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-text)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.4rem' }}>
                Active Users
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--heading-color)', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>94%</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-text)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.4rem' }}>
                Satisfaction
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--heading-color)', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>15min</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-text)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.4rem' }}>
                Avg Report Time
              </div>
            </div>
          </div>

          {/* Overlapping avatars stack */}
          <div className="avatar-overlap-row">
            <div className="overlap-avatar" style={{ background: '#3b82f6', color: '#ffffff' }}>JD</div>
            <div className="overlap-avatar" style={{ background: '#ec4899', color: '#ffffff' }}>AM</div>
            <div className="overlap-avatar" style={{ background: '#10b981', color: '#ffffff' }}>SK</div>
            <div className="overlap-avatar overlap-avatar-more">+4k</div>
          </div>

        </div>
      </section>

    </div>
  );
}
