import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Calendar, User, Phone, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function TrackComplaint({ complaintId, setCurrentPage }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Determine if we should query public or authenticated endpoint
      // If user is authenticated, query the full details endpoint.
      const url = user ? `/api/complaints/${complaintId}` : `/api/complaints/track/${complaintId}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComplaint(data.complaint);
        } else {
          setError(data.error || "Failed to load complaint details.");
        }
      } else {
        setError(currentLanguage === 'hi' ? 'विवरण प्राप्त करने में विफल।' : 'Complaint not found.');
      }
    } catch (err) {
      console.error(err);
      setError(currentLanguage === 'hi' ? 'कनेक्शन त्रुटि।' : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails();
    }
  }, [complaintId]);

  const handleBack = () => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'URGENT': return 'badge-urgent';
      case 'HIGH': return 'badge-high';
      case 'MEDIUM': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RESOLVED': return 'badge-resolved';
      case 'REJECTED': return 'badge-rejected';
      case 'IN_PROGRESS': return 'badge-progress';
      case 'ASSIGNED': return 'badge-assigned';
      default: return 'badge-pending';
    }
  };

  const getTimelineDotClass = (type, newStatus) => {
    if (newStatus === 'RESOLVED') return 'success';
    if (newStatus === 'REJECTED') return 'danger';
    if (newStatus === 'IN_PROGRESS') return 'info';
    if (newStatus === 'ASSIGNED') return 'warning';
    return '';
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <span className="spinner" style={{ width: '2.5rem', height: '2.5rem' }}></span>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          {currentLanguage === 'hi' ? 'शिकायत की समय-सीमा लोड हो रही है...' : 'Acquiring tracking records...'}
        </p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card-glass" style={{ borderLeft: '4px solid var(--danger)' }}>
          <AlertCircle size={40} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h3>{currentLanguage === 'hi' ? 'शिकायत नहीं मिली' : 'Tracking Record Missing'}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem', fontSize: '0.9rem' }}>{error}</p>
          <button onClick={handleBack} className="btn btn-outline" style={{ width: '100%' }}>
            <ArrowLeft size={14} /> {currentLanguage === 'hi' ? 'वापस जाएं' : 'Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Back link */}
      <button onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: '1.5rem', display: 'flex', gap: '0.35rem' }}>
        <ArrowLeft size={16} />
        {currentLanguage === 'hi' ? 'डैशबोर्ड पर वापस' : 'Back to Workspace'}
      </button>

      {/* Title Header Card */}
      <div className="card-glass" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="flex-gap-2" style={{ marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-assigned" style={{ fontSize: '0.8rem', fontWeight: 700 }}>CIV-{complaint.id}</span>
            <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>{complaint.statusDisplay || complaint.status}</span>
            <span className={`badge ${getPriorityBadgeClass(complaint.priority)}`}>{complaint.priorityDisplay || complaint.priority}</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{complaint.title}</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} />
              {new Date(complaint.createdAt).toLocaleString()}
            </span>
            <span>•</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{complaint.categoryDisplay || complaint.category}</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Side: Detail Specifications & Simulated Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Details Card */}
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
              📝 {currentLanguage === 'hi' ? 'शिकायत विवरण' : 'Incident Details'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {complaint.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <div>
                <strong>{t('complaint.location')}:</strong>
                <p style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>{complaint.location}</p>
              </div>
            </div>

            {/* Coordinates */}
            {complaint.latitude && complaint.longitude && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Navigation size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
                <div>
                  <strong>{currentLanguage === 'hi' ? 'निर्देशांक' : 'Coordinates'}:</strong>
                  <p style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>{complaint.latitude}, {complaint.longitude}</p>
                </div>
              </div>
            )}
          </div>

          {/* Incident Image Attachment */}
          {complaint.imagePath && (
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
                📸 {currentLanguage === 'hi' ? 'संलग्न चित्र' : 'Reported Attachment'}
              </h3>
              <img
                src={complaint.imagePath}
                alt="Complaint evidence"
                style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}
              />
            </div>
          )}

          {/* Assigned Worker Contact (authenticated only) */}
          {complaint.assignment && (
            <div className="card-glass" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                👮 {currentLanguage === 'hi' ? 'नियुक्त कार्यकर्ता' : 'Assigned Specialist'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>
                  <strong>{currentLanguage === 'hi' ? 'नाम' : 'Field Worker'}:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{complaint.assignment.workerName}</span>
                </div>
                {complaint.assignment.workerPhone && (
                  <div>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={12} /> {currentLanguage === 'hi' ? 'फ़ोन नंबर' : 'Contact Phone'}:
                    </strong> <span style={{ color: 'var(--text-primary)' }}>{complaint.assignment.workerPhone}</span>
                  </div>
                )}
                {complaint.assignment.notes && (
                  <div style={{ marginTop: '0.25rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                    <strong>{currentLanguage === 'hi' ? 'निर्देश' : 'Assignment Notes'}:</strong>
                    <p style={{ color: 'var(--text-primary)', fontStyle: 'italic', marginTop: '0.25rem' }}>"{complaint.assignment.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Simulated Premium Map Card */}
          {complaint.latitude && complaint.longitude && (
            <div className="card-glass" style={{ background: 'rgba(11, 15, 25, 0.6)' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                🗺️ {currentLanguage === 'hi' ? 'लाइव उपग्रह रडार' : 'Satellite Location Map'}
              </h3>
              <div style={{
                height: '150px',
                borderRadius: 'var(--radius-md)',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(11, 15, 25, 0.8) 100%)',
                border: '1px solid var(--border-glass)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Visual grid line aesthetics */}
                <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{
                  position: 'absolute',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(99, 102, 241, 0.3)',
                  animation: 'spin 10s linear infinite'
                }} />
                
                {/* Radar target pin */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <MapPin size={24} style={{ color: 'var(--danger)', animation: 'bounce 1s infinite alternate' }} />
                  <span style={{ fontSize: '0.7rem', color: '#fff', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                    CIV-{complaint.id} Location
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Chronological Visual Timeline */}
        <div className="card-glass">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} style={{ color: 'var(--primary)' }} />
            {currentLanguage === 'hi' ? 'शिकायत की समय-सीमा' : 'Resolution History'}
          </h3>

          {complaint.updates && complaint.updates.length > 0 ? (
            <div className="timeline">
              {complaint.updates.map((update, index) => (
                <div key={index} className="timeline-item">
                  <div className={`timeline-dot ${getTimelineDotClass(update.updateType, update.newStatus)}`} />
                  <div className="timeline-content">
                    <div className="timeline-time">
                      {new Date(update.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="timeline-title" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>{update.message}</span>
                      {update.newStatus && (
                        <span className={`badge ${getStatusBadgeClass(update.newStatus)}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                          {update.newStatus}
                        </span>
                      )}
                    </div>
                    {update.updatedBy && (
                      <div className="timeline-body" style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        👤 {currentLanguage === 'hi' ? 'द्वारा:' : 'Action by:'} <strong>{update.updatedBy}</strong> ({update.updatedByRole === 'ROLE_ADMIN' ? 'Admin' : 'Field Worker'})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {currentLanguage === 'hi' ? 'शिकायत पर अभी तक कोई अपडेट नहीं हुआ है।' : 'No activity timeline exists yet for this complaint.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
