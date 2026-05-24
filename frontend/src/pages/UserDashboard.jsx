import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Clock, CheckCircle2, AlertCircle, Eye, ShieldAlert, Heart, Calendar, PhoneCall, HelpCircle, ArrowRight, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard({ setCurrentPage, setSelectedComplaintId }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch('/api/stats/dashboard');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setMetrics(statsData.metrics || {});
        }
      }

      const complaintsRes = await fetch('/api/complaints');
      if (complaintsRes.ok) {
        const compData = await complaintsRes.json();
        if (compData.success) {
          setComplaints(compData.complaints || []);
        }
      }
    } catch (err) {
      console.error("Failed to load citizen dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTrackClick = (id) => {
    setSelectedComplaintId(id);
    setCurrentPage('timeline');
  };

  const filteredComplaints = complaints.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `CIV-${c.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Get first name or default to Jamie
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Jamie';

  // Find latest complaint to map to the stepper progress bar, or use a gorgeous mock default!
  const latestComplaint = complaints.length > 0 ? complaints[0] : null;
  const progressRef = latestComplaint ? `#CIV-${latestComplaint.id} - ${latestComplaint.title.toUpperCase()}` : '#CR-2024-8812 - OAK STREET MAINTENANCE';
  const progressStatus = latestComplaint ? latestComplaint.status : 'IN_PROGRESS';
  
  // Step state mapping: 1 (Submitted), 2 (Reviewing), 3 (Scheduled), 4 (Resolved)
  let activeProgressNode = 3; // Default Scheduled
  if (progressStatus === 'PENDING') activeProgressNode = 1;
  else if (progressStatus === 'ASSIGNED') activeProgressNode = 2;
  else if (progressStatus === 'IN_PROGRESS') activeProgressNode = 3;
  else if (progressStatus === 'RESOLVED') activeProgressNode = 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
      
      {/* SECTION 1: CITIZEN GREETING BANNER (Matches Screen 2 Greet) */}
      <div className="citizen-greeting-banner">
        <h1 className="citizen-greeting-title">Good morning, {firstName}.</h1>
        <p className="citizen-greeting-subtitle">
          Your neighborhood stability score is improving. Here is an overview of your active contributions and local updates.
        </p>
      </div>

      {/* SECTION 2: PROGRESS ROW & SUPPORT PANELS (Matches Screen 2 timeline section) */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
        
        {/* Left timeline card (2/3 width) */}
        <div style={{ flex: '1.8', minWidth: '320px' }}>
          <div className="progress-stepper-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="progress-stepper-header">
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--heading-color)', display: 'block' }}>Recent Report Progress</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600 }}>REF: {progressRef}</span>
              </div>
              <span className="badge badge-progress" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', background: 'var(--badge-soft-blue-bg)', color: 'var(--badge-soft-blue-text)' }}>
                In Progress
              </span>
            </div>

            {/* Horizontal Timeline Stepper circles */}
            <div className="horizontal-timeline-line">
              {/* Stepper progress fill color */}
              <div 
                className="timeline-line-fill" 
                style={{ width: `${((activeProgressNode - 1) / 3) * 100}%` }}
              ></div>

              {/* Node 1: Submitted */}
              <div className={`horizontal-timeline-node ${activeProgressNode >= 1 ? 'checked' : ''}`}>
                <div className="timeline-node-dot">✓</div>
                <span className="timeline-node-label">Submitted</span>
              </div>

              {/* Node 2: Reviewing */}
              <div className={`horizontal-timeline-node ${activeProgressNode >= 2 ? 'checked' : ''}`}>
                <div className="timeline-node-dot">✓</div>
                <span className="timeline-node-label">Reviewing</span>
              </div>

              {/* Node 3: Scheduled */}
              <div className={`horizontal-timeline-node ${activeProgressNode === 3 ? 'active' : activeProgressNode > 3 ? 'checked' : ''}`}>
                <div className="timeline-node-dot">👷</div>
                <span className="timeline-node-label">Scheduled</span>
              </div>

              {/* Node 4: Resolved */}
              <div className={`horizontal-timeline-node ${activeProgressNode >= 4 ? 'checked' : ''}`}>
                <div className="timeline-node-dot">✓</div>
                <span className="timeline-node-label">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right shortcut buttons card drawer (1/3 width) */}
        <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Contact Support */}
          <div onClick={() => setCurrentPage('map')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.15rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }} className="btn-hover-grow">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--badge-soft-green-bg)', color: 'var(--accent-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem' }}>
                📞
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--heading-color)', display: 'block' }}>Contact Support</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>24/7 Agent Availability</span>
              </div>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--muted-text)' }} />
          </div>

          {/* Chat with AI Assistant */}
          <div onClick={() => {
            const aiBtn = document.querySelector('.ai-chat-bubble');
            if (aiBtn) aiBtn.click();
          }} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.15rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--badge-soft-blue-bg)', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem' }}>
                🤖
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--heading-color)', display: 'block' }}>Chat with AI Assistant</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>Instant civic guidance</span>
              </div>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--muted-text)' }} />
          </div>

        </div>

      </div>

      {/* SECTION 3: MY ACTIVE REPORTS CARD GRID (Matches Screen 2 grid) */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--heading-color)', fontFamily: "'Outfit', sans-serif" }}>My Active Reports</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '0.25rem' }}>Ongoing cases currently in the resolution pipeline.</p>
          </div>
          <a onClick={() => {}} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', cursor: 'pointer', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            View History <ArrowRight size={12} />
          </a>
        </div>

        {/* 3 cards row (Mock overlays + actual reports) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          {/* Card 1: Reviewing */}
          <div className="card-glass" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-low" style={{ background: 'var(--badge-soft-yellow-bg)', color: 'var(--badge-soft-yellow-text)', fontSize: '0.7rem' }}>● Reviewing</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>2 days ago</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--heading-color)', marginBottom: '0.4rem' }}>Community Center Lighting</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', lineHeight: 1.4 }}>
                Requested improved LED installation for the main entrance...
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--subtle-border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
              <div className="avatar-overlap-row">
                <div className="overlap-avatar" style={{ background: '#3b82f6', color: '#ffffff' }}>JD</div>
                <div className="overlap-avatar" style={{ background: '#ec4899', color: '#ffffff' }}>AM</div>
              </div>
              <span style={{ color: 'var(--muted-text)', fontSize: '0.9rem', cursor: 'pointer' }}>•••</span>
            </div>
          </div>

          {/* Card 2: Scheduled */}
          <div className="card-glass" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-progress" style={{ background: 'var(--badge-soft-blue-bg)', color: 'var(--badge-soft-blue-text)', fontSize: '0.7rem' }}>● Scheduled</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>5 days ago</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--heading-color)', marginBottom: '0.4rem' }}>Park Bench Restoration</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', lineHeight: 1.4 }}>
                Graffiti removal and structural repair for the historical Central sector park bench.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--subtle-border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                <Calendar size={12} />
                Oct 14, 2024
              </div>
              <span style={{ color: 'var(--muted-text)', fontSize: '0.9rem', cursor: 'pointer' }}>•••</span>
            </div>
          </div>

          {/* Card 3: Resolved */}
          <div className="card-glass" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-resolved" style={{ background: 'var(--badge-soft-green-bg)', color: 'var(--badge-soft-green-text)', fontSize: '0.7rem' }}>✓ Resolved</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>2 weeks ago</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--heading-color)', marginBottom: '0.4rem' }}>Pothole Repair: 5th & Main</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', lineHeight: 1.4 }}>
                Hazardous road conditions fixed. Area surveyed and pothole paved with cement.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--subtle-border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, fontStyle: 'italic' }}>
                "Thank you for your report!"
              </div>
              <span style={{ color: 'var(--muted-text)', fontSize: '0.8rem', cursor: 'pointer' }}>🔗</span>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 4: CITIZEN SPRINGFIELD IMPACT & ISOMETRIC CSS (Matches Screen 2 Bottom) */}
      <div className="springfield-impact-card">
        
        {/* Left Side Content details */}
        <div className="impact-left-content">
          <h2 className="impact-title">Your Impact in Springfield</h2>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.875rem', lineHeight: 1.5, maxWidth: '500px' }}>
            By reporting local issues, you have contributed to a <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>15% increase</span> in maintenance efficiency this quarter. Your neighbors thank you for your vigilance.
          </p>

          <div style={{ display: 'flex', gap: '3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--badge-soft-green-bg)', color: 'var(--accent-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--heading-color)', lineHeight: 1 }}>12</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600 }}>Successful Resolutions</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--badge-soft-blue-bg)', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
                👥
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--heading-color)', lineHeight: 1 }}>342</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600 }}>Neighbors Assisted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Isometric city landscape graphic card */}
        <div className="isometric-neighborhood-pane">
          <div className="iso-city-grid">
            <div className="iso-block block-1"></div>
            <div className="iso-block block-2"></div>
            <div className="iso-block block-3"></div>
            <div className="iso-block block-4"></div>
            
            <div className="iso-road iso-road-h"></div>
            <div className="iso-road iso-road-v"></div>

            <div className="iso-house house-1"></div>
            <div className="iso-house house-2"></div>
            <div className="iso-house house-3"></div>
          </div>
        </div>

      </div>

    </div>
  );
}
