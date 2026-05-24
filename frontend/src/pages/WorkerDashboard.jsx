import React, { useState, useEffect } from 'react';
import { ShieldAlert, Award, Clock, FileText, Search, Play, CheckCircle2, ChevronRight, Eye, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function WorkerDashboard({ setCurrentPage, setSelectedComplaintId, showToast }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    totalAssigned: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0
  });

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, completed

  // Action Drawer Modal
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateType, setUpdateType] = useState('PROGRESS_UPDATE'); // PROGRESS_UPDATE, RESOLUTION
  const [updateMessage, setUpdateMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      // 1. Fetch metrics
      const statsRes = await fetch('/api/stats/dashboard');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setMetrics(statsData.metrics || {});
        }
      }

      // 2. Fetch assigned complaints list
      const complaintsRes = await fetch('/api/complaints');
      if (complaintsRes.ok) {
        const compData = await complaintsRes.json();
        if (compData.success) {
          setComplaints(compData.complaints || []);
        }
      }
    } catch (err) {
      console.error("Failed to load worker panel details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  // Accepts assignment and changes status to IN_PROGRESS
  const handleStartWork = async (complaintId) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          message: 'Worker arrived at incident site and started resolution work.'
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (showToast) showToast(currentLanguage === 'hi' ? 'मिशन शुरू किया गया!' : 'Mission accepted & started!', 'success');
          fetchWorkerData();
        }
      }
    } catch (err) {
      console.error("Failed to start work:", err);
    }
  };

  // Open action drawer
  const openActionDrawer = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateType('PROGRESS_UPDATE');
    setUpdateMessage('');
    setShowDrawer(true);
  };

  // Submit progress update or resolution
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: updateType,
          message: updateMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (showToast) {
            showToast(
              updateType === 'RESOLUTION'
                ? (currentLanguage === 'hi' ? 'मिशन सफलतापूर्वक पूर्ण!' : 'Mission resolved and closed successfully!')
                : (currentLanguage === 'hi' ? 'प्रगति रिपोर्ट प्रस्तुत!' : 'Progress report submitted successfully!'),
              'success'
            );
          }
          setShowDrawer(false);
          fetchWorkerData();
        }
      }
    } catch (err) {
      console.error("Failed to update activity:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrackClick = (id) => {
    setSelectedComplaintId(id);
    setCurrentPage('timeline');
  };

  // Separate active (ASSIGNED, IN_PROGRESS) vs completed (RESOLVED, REJECTED)
  const activeMissions = complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS');
  const completedMissions = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'REJECTED');
  
  const displayList = activeTab === 'active' ? activeMissions : completedMissions;

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

  return (
    <div className="container">
      {/* Header Greeting */}
      <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('dashboard.worker')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {currentLanguage === 'hi'
              ? `स्वागत है, ${user?.fullName}! आपकी दैनिक मिशन सूची तैयार है।`
              : `Welcome back, ${user?.fullName}! Ready for your dispatch missions?`}
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        
        <div className="card-glass stat-card">
          <div className="stat-info">
            <h3>{currentLanguage === 'hi' ? 'कुल सौंपे गए' : 'Total Assigned'}</h3>
            <p style={{ color: 'var(--text-primary)' }}>{loading ? '...' : metrics.totalAssigned}</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--neutral-bg)', color: 'var(--text-primary)' }}>
            👮
          </div>
        </div>

        <div className="card-glass stat-card">
          <div className="stat-info">
            <h3>{currentLanguage === 'hi' ? 'लंबित कार्य' : 'Pending Dispatch'}</h3>
            <p style={{ color: 'var(--warning)' }}>{loading ? '...' : metrics.pendingComplaints}</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Clock size={18} />
          </div>
        </div>

        <div className="card-glass stat-card">
          <div className="stat-info">
            <h3>{currentLanguage === 'hi' ? 'सक्रिय मिशन' : 'Active Resolution'}</h3>
            <p style={{ color: 'var(--info)' }}>{loading ? '...' : metrics.inProgressComplaints}</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Play size={16} />
          </div>
        </div>

        <div className="card-glass stat-card">
          <div className="stat-info">
            <h3>{currentLanguage === 'hi' ? 'सफलतापूर्वक पूर्ण' : 'Completed Missions'}</h3>
            <p style={{ color: 'var(--success)' }}>{loading ? '...' : metrics.resolvedComplaints}</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>

      </div>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('active')}
          className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          ⚡ {currentLanguage === 'hi' ? 'सक्रिय मिशन' : 'Active Missions'} ({activeMissions.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          🏆 {currentLanguage === 'hi' ? 'पूर्ण मिशन' : 'Mission History'} ({completedMissions.length})
        </button>
      </div>

      {/* Missions checklist cards or table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <span className="spinner" style={{ width: '2rem', height: '2rem' }}></span>
        </div>
      ) : displayList.length === 0 ? (
        <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 1.5rem', border: '1px dashed var(--border-glass)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {activeTab === 'active'
              ? (currentLanguage === 'hi' ? 'कोई सक्रिय मिशन नहीं सौंपा गया है।' : 'Hooray! No active pending missions assigned to you.')
              : (currentLanguage === 'hi' ? 'कोई पुराना मिशन इतिहास नहीं मिला।' : 'No resolved historical missions found.')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayList.map((c) => (
            <div key={c.id} className="card-glass" style={{
              background: 'var(--bg-glass)',
              borderLeft: `4px solid ${c.status === 'ASSIGNED' ? 'var(--warning)' : c.status === 'IN_PROGRESS' ? 'var(--info)' : 'var(--success)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <div className="flex-gap-2">
                  <span className="badge badge-assigned" style={{ fontWeight: 700 }}>CIV-{c.id}</span>
                  <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.statusDisplay}</span>
                  <span className={`badge ${getPriorityBadgeClass(c.priority)}`}>{c.priorityDisplay}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  🗓️ {currentLanguage === 'hi' ? 'सौंपा गया:' : 'Assigned:'} {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 Incident: {c.location}</p>
                {c.notes && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--primary)', marginTop: '0.5rem', fontStyle: 'italic', background: 'rgba(99,102,241,0.04)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(99,102,241,0.1)' }}>
                    📝 Instruction: "{c.notes}"
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => handleTrackClick(c.id)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', gap: '0.25rem' }}
                >
                  <Eye size={12} /> {currentLanguage === 'hi' ? 'विवरण' : 'Details'}
                </button>
                
                {/* Active specific action buttons */}
                {c.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStartWork(c.id)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', gap: '0.25rem' }}
                  >
                    🚀 Start Resolution
                  </button>
                )}

                {c.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => openActionDrawer(c)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', gap: '0.25rem' }}
                  >
                    ✍️ Update Progress / Resolve
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MISSION ACTION DRAWER SLIDE MODAL */}
      {showDrawer && selectedComplaint && (
        <div className="modal-backdrop active" onClick={() => setShowDrawer(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h4 className="modal-title">✍️ Report Mission Progress</h4>
              <button onClick={() => setShowDrawer(false)} className="modal-close">&times;</button>
            </div>

            <form onSubmit={handleActionSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
                  <strong>Mission:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedComplaint.title}</span>
                  <br />
                  <strong>Location:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedComplaint.location}</span>
                </div>

                <div className="form-group">
                  <label htmlFor="updateType">Activity Action *</label>
                  <select
                    id="updateType"
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="PROGRESS_UPDATE">Add Progress Update (Remain In Progress)</option>
                    <option value="RESOLUTION">Resolve & Close Mission (Mark Resolved)</option>
                  </select>
                </div>

                {updateType === 'RESOLUTION' && (
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.775rem', color: 'var(--success)', lineHeight: 1.4 }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span>This action will resolve the complaint. The citizen will be notified instantly of your closure statement!</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="updateMessage">Activity description / Message *</label>
                  <textarea
                    id="updateMessage"
                    rows={4}
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    placeholder={updateType === 'RESOLUTION' 
                      ? "Describe how you resolved this issue (e.g. Filled pothole with 15kg asphalt mixture, rolled flat and tested...)"
                      : "Describe what you are doing (e.g. Crew arrived with garbage dump truck, started loading trash bags...)"
                    }
                    className="form-control"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowDrawer(false)} className="btn btn-outline" disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading || !updateMessage.trim()}>
                  {actionLoading ? <span className="spinner"></span> : 'Submit Report'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
