import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldAlert, Award, FileText, PlusCircle, Search, ToggleLeft, ToggleRight, ExternalLink, Settings, Shield, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ setCurrentPage, setSelectedComplaintId, showToast }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('grievances'); // grievances, workers, citizens, addWorker
  const [metrics, setMetrics] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    assignedComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalCitizens: 0,
    totalWorkers: 0
  });

  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Assign Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Add Worker Form States
  const [newWorker, setNewWorker] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [workerSuccess, setWorkerSuccess] = useState('');
  const [workerError, setWorkerError] = useState('');
  const [workerLoading, setWorkerLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
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

      const workersRes = await fetch('/api/admin/workers');
      if (workersRes.ok) {
        const workersData = await workersRes.json();
        if (workersData.success) {
          setWorkers(workersData.workers || []);
        }
      }

      const citizensRes = await fetch('/api/admin/citizens');
      if (citizensRes.ok) {
        const citizensData = await citizensRes.json();
        if (citizensData.success) {
          setCitizens(citizensData.citizens || []);
        }
      }
    } catch (err) {
      console.error("Failed to load admin panel details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleWorker = async (workerId) => {
    try {
      const response = await fetch(`/api/admin/workers/${workerId}/toggle`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (showToast) showToast(currentLanguage === 'hi' ? 'कार्यकर्ता की स्थिति बदली!' : 'Worker status toggled successfully!', 'success');
          fetchAdminData();
        }
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handlePriorityChange = async (complaintId, newPriority) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/priority`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority: newPriority })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (showToast) showToast(currentLanguage === 'hi' ? 'प्राथमिकता अपडेट की गई!' : 'Priority updated successfully!', 'success');
          fetchAdminData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedWorkerId('');
    setAssignNotes('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedWorkerId) return;

    setAssignLoading(true);
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workerId: parseInt(selectedWorkerId),
          notes: assignNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (showToast) showToast(currentLanguage === 'hi' ? 'विशेषज्ञ नियुक्त!' : 'Agent dispatched successfully!', 'success');
          setShowAssignModal(false);
          fetchAdminData();
        }
      }
    } catch (err) {
      console.error("Dispatch assignment failed:", err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    setWorkerError('');
    setWorkerSuccess('');

    if (!newWorker.username.trim() || !newWorker.email.trim() || !newWorker.password || !newWorker.fullName.trim()) {
      setWorkerError(currentLanguage === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    setWorkerLoading(true);
    try {
      const response = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWorker)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setWorkerSuccess(currentLanguage === 'hi' ? 'नया कार्यकर्ता सफलतापूर्वक जोड़ा गया!' : 'New worker registered successfully!');
        if (showToast) showToast(currentLanguage === 'hi' ? 'कार्यकर्ता पंजीकृत!' : 'Field specialist registered successfully!', 'success');
        setNewWorker({
          username: '',
          email: '',
          password: '',
          fullName: '',
          phone: ''
        });
        fetchAdminData();
      } else {
        setWorkerError(data.error || 'Failed to register worker');
      }
    } catch (err) {
      setWorkerError('Connection error.');
    } finally {
      setWorkerLoading(false);
    }
  };

  const handleWorkerInputChange = (e) => {
    setNewWorker(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleTrackClick = (id) => {
    setSelectedComplaintId(id);
    setCurrentPage('timeline');
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `CIV-${c.id}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
      
      {/* SECTION 1: REDESIGNED METRICS GRID (Matches Screen 1 metrics) */}
      <div className="dashboard-metrics-grid">
        
        {/* TOTAL ACTIVE */}
        <div className="metric-value-card">
          <span className="metric-value-title">Total Active</span>
          <div className="metric-value-number">142</div>
          <span className="metric-value-trend" style={{ color: '#22c55e' }}>+12% vs last week</span>
        </div>

        {/* CRITICAL PRIORITY */}
        <div className="metric-value-card">
          <span className="metric-value-title">Critical Priority</span>
          <div className="metric-value-number" style={{ color: '#ef4444' }}>08</div>
          <span className="badge badge-urgent" style={{ alignSelf: 'flex-start', fontSize: '0.65rem', background: 'var(--badge-soft-red-bg)', color: '#ef4444', border: 'none' }}>
            High Attention
          </span>
        </div>

        {/* AVG RESOLUTION */}
        <div className="metric-value-card">
          <span className="metric-value-title">Avg Resolution</span>
          <div className="metric-value-number" style={{ color: 'var(--badge-soft-blue-text)' }}>3.4d</div>
          <span className="metric-value-trend" style={{ color: 'var(--muted-text)' }}>System Normal</span>
        </div>

        {/* CITIZEN SATISFACTION */}
        <div className="metric-value-card">
          <span className="metric-value-title">Citizen Satisfaction</span>
          <div className="metric-value-number" style={{ color: '#166534' }}>4.8/5</div>
          <span className="metric-value-trend" style={{ color: '#166534' }}>Excellent</span>
        </div>

      </div>

      {/* SECTION 2: UNEQUAL TWO COLUMN LAYOUT (Screen 1 Main area) */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
        
        {/* Left Column - Recent Grievances List (2/3 width) */}
        <div style={{ flex: '1.8', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--heading-color)', fontFamily: "'Outfit', sans-serif" }}>
              Recent Reports
            </h3>
            
            {/* Direct quick action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => showToast('Filtered by category', 'success')} className="btn btn-outline btn-sm" style={{ borderRadius: '9999px', border: '1px solid var(--card-border)', fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}>
                📂 Category
              </button>
              <button onClick={() => showToast('Filtered by priority', 'success')} className="btn btn-outline btn-sm" style={{ borderRadius: '9999px', border: '1px solid var(--card-border)', fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}>
                ⚡ Priority
              </button>
            </div>
          </div>

          <div className="report-list-container">
            
            {/* Card 1: Severe Pothole on Maple Ave */}
            <div className="report-item-card">
              <div className="report-item-thumbnail">
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '2.5rem' }}>
                  🕳️
                </div>
              </div>
              <div className="report-item-content">
                <div>
                  <div className="report-item-header">
                    <span className="badge badge-urgent" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', border: 'none' }}>CRITICAL</span>
                    <span>Infrastructure • 2 hours ago</span>
                  </div>
                  <h4 className="report-item-title">Severe Pothole on Maple Ave</h4>
                  <p className="report-item-desc">
                    Reported near the school entrance. Risk to school buses and active traffic...
                  </p>
                </div>
                
                <div className="report-item-buttons">
                  <button onClick={() => showToast('Dispatched Infrastructure Specialist.', 'success')} className="btn-dispatch-green">Assign Team</button>
                  <button onClick={() => showToast('Response dispatched.', 'success')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>Respond</button>
                  <button onClick={() => showToast('Maple Ave details retrieved.', 'success')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>View Details</button>
                </div>
              </div>
            </div>

            {/* Card 2: Street Light Outage - 5th & Oak */}
            <div className="report-item-card">
              <div className="report-item-thumbnail">
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #fef08a 0%, #eab308 100%)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '2.5rem' }}>
                  💡
                </div>
              </div>
              <div className="report-item-content">
                <div>
                  <div className="report-item-header">
                    <span className="badge badge-medium" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', border: 'none' }}>MEDIUM</span>
                    <span>Public Safety • 5 hours ago</span>
                  </div>
                  <h4 className="report-item-title">Street Light Outage - 5th & Oak</h4>
                  <p className="report-item-desc">
                    Main intersection lamp is flickering. Multiple residents report dark crossings...
                  </p>
                </div>
                
                <div className="report-item-buttons">
                  <button onClick={() => showToast('Dispatched Electrical Crew.', 'success')} className="btn-dispatch-green">Assign Team</button>
                  <button onClick={() => showToast('Status updated.', 'success')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>Update Status</button>
                  <button onClick={() => showToast('Street light details retrieved.', 'success')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>View Details</button>
                </div>
              </div>
            </div>

            {/* Card 3: Park Trash Collection Request */}
            <div className="report-item-card">
              <div className="report-item-thumbnail">
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #a7f3d0 0%, #059669 100%)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '2.5rem' }}>
                  🚮
                </div>
              </div>
              <div className="report-item-content">
                <div>
                  <div className="report-item-header">
                    <span className="badge badge-low" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', border: 'none' }}>LOW</span>
                    <span>Sanitation • Yesterday</span>
                  </div>
                  <h4 className="report-item-title">Park Trash Collection Request</h4>
                  <p className="report-item-desc">
                    Central Park East bin is full after weekend picnic hours. Litter spilling...
                  </p>
                </div>
                
                <div className="report-item-buttons">
                  <button onClick={() => showToast('Dispatched Sanitation Team.', 'success')} className="btn-dispatch-green">Assign Team</button>
                  <button onClick={() => showToast('Response dispatched.', 'success')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>Respond</button>
                  <button onClick={() => showToast('Sanitation details retrieved.', 'success')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>View Details</button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column - Map & TeamAvailability (1/3 width) (Matches Screen 1 Right) */}
        <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Concentration Map widget */}
          <div className="concentration-map-card">
            <div className="concentration-map-header">
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--heading-color)', fontFamily: "'Outfit', sans-serif" }}>Concentration Map</span>
              <a onClick={() => setCurrentPage('map')} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', cursor: 'pointer' }}>Full Screen</a>
            </div>

            <div className="concentration-map-canvas">
              <div className="map-grid-overlay"></div>
              {/* Radar rings */}
              <div className="map-radar-ring" style={{ top: '30%', left: '45%' }}></div>
              
              {/* Custom pins */}
              <div className="map-pin-bullet pin-red" style={{ top: '30%', left: '45%' }}></div>
              <div className="map-pin-bullet pin-red" style={{ top: '60%', left: '75%' }}></div>
              <div className="map-pin-bullet pin-green" style={{ top: '65%', left: '25%' }}></div>
              <div className="map-pin-bullet pin-blue" style={{ top: '70%', left: '50%' }}></div>
            </div>

            <div className="concentration-map-footer">
              <div>
                <div className="footer-focus-label">ACTIVE HOTSPOTS</div>
                <div className="footer-focus-value" style={{ color: '#166534' }}>Downtown South</div>
              </div>
              <div>
                <div className="footer-focus-label">FOCUS ZONE</div>
                <div className="footer-focus-value" style={{ color: '#166534' }}>Wards 4 & 7</div>
              </div>
            </div>
          </div>

          {/* Team Availability */}
          <div className="card-glass" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--heading-color)', marginBottom: '0.75rem', fontFamily: "'Outfit', sans-serif" }}>
              Team Availability
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', borderTop: '1px solid var(--subtle-border)', paddingTop: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--body-text)' }}>● Infrastructure Crew A</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>On Duty</span>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 3: SYSTEM DIRECTORIES & TABS (Integrates MVC actions) */}
      <div className="card-glass" style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', textAlign: 'left' }}>
        
        {/* Tab Header Selector buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--subtle-border)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('grievances')}
            className={`btn ${activeTab === 'grievances' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: activeTab === 'grievances' ? '#166534' : 'transparent', color: activeTab === 'grievances' ? '#ffffff' : '#64748b', borderRadius: '6px' }}
          >
            📂 {t('dashboard.allComplaints')}
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`btn ${activeTab === 'workers' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: activeTab === 'workers' ? '#166534' : 'transparent', color: activeTab === 'workers' ? '#ffffff' : '#64748b', borderRadius: '6px' }}
          >
            👮 {currentLanguage === 'hi' ? 'कार्यकर्ता सूची' : 'Workers Directory'}
          </button>
          <button
            onClick={() => setActiveTab('citizens')}
            className={`btn ${activeTab === 'citizens' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: activeTab === 'citizens' ? '#166534' : 'transparent', color: activeTab === 'citizens' ? '#ffffff' : '#64748b', borderRadius: '6px' }}
          >
            👥 {currentLanguage === 'hi' ? 'नागरिक सूची' : 'Citizens Directory'}
          </button>
          <button
            onClick={() => setActiveTab('addWorker')}
            className={`btn ${activeTab === 'addWorker' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: activeTab === 'addWorker' ? '#166534' : 'transparent', color: activeTab === 'addWorker' ? '#ffffff' : '#64748b', borderRadius: '6px' }}
          >
            ➕ {t('dashboard.newWorker')}
          </button>
        </div>

        {/* Tab content bodies */}
        {loading && activeTab !== 'addWorker' ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <span className="spinner" style={{ width: '2rem', height: '2rem' }}></span>
          </div>
        ) : activeTab === 'grievances' ? (
          <div>
            <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--heading-color)' }}>Database Grievance Records</span>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-control"
                  style={{ width: '130px', height: '32px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                <div style={{ position: 'relative', width: '200px' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search database..."
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '2rem', height: '32px', fontSize: '0.8rem', borderRadius: '6px' }}
                  />
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '10px', color: 'var(--muted-text)' }} />
                </div>
              </div>
            </div>

            {filteredComplaints.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted-text)', padding: '2rem 0', fontSize: '0.85rem' }}>No database complaints match search selection.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Grievance ID</th>
                      <th>Title & Location</th>
                      <th>Priority Level</th>
                      <th>Resolution Status</th>
                      <th>Assigned Worker</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: '#166534' }}>CIV-{c.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '0.15rem' }}>📍 {c.location} | 👤 {c.citizenName}</div>
                        </td>
                        <td>
                          <select
                            value={c.priority}
                            onChange={(e) => handlePriorityChange(c.id, e.target.value)}
                            className="form-control"
                            style={{ padding: '0.15rem 0.35rem', fontSize: '0.75rem', width: '90px', background: 'var(--surface-raised)', border: '1px solid var(--card-border)', borderRadius: '4px', fontWeight: 600 }}
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                          </select>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(c.status)}`} style={{ fontSize: '0.7rem' }}>
                            {c.statusDisplay}
                          </span>
                        </td>
                        <td>
                          {c.workerName ? (
                            <span style={{ fontWeight: 600 }}>👷 {c.workerName}</span>
                          ) : (
                            <button
                              onClick={() => openAssignModal(c)}
                              className="btn-dispatch-green"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            >
                              🚀 Dispatch
                            </button>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleTrackClick(c.id)}
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', gap: '0.2rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            <ExternalLink size={10} /> Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'workers' ? (
          <div>
            <h4 style={{ fontWeight: 700, color: 'var(--heading-color)', marginBottom: '1rem' }}>Workers Directory</h4>
            {workers.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted-text)', padding: '2rem 0' }}>No worker specialists registered.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Worker ID</th>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w) => (
                      <tr key={w.id}>
                        <td style={{ fontWeight: 700 }}>#{w.id}</td>
                        <td style={{ fontWeight: 600 }}>{w.fullName}</td>
                        <td>{w.username}</td>
                        <td>{w.email}</td>
                        <td>{w.phone || 'N/A'}</td>
                        <td>
                          <span className={`badge ${w.enabled ? 'badge-resolved' : 'badge-rejected'}`} style={{ fontSize: '0.7rem' }}>
                            {w.enabled ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleWorker(w.id)}
                            className={`btn ${w.enabled ? 'btn-ghost' : 'btn-outline'} btn-sm`}
                            style={{ color: w.enabled ? 'var(--danger)' : '#166534', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            {w.enabled ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'citizens' ? (
          <div>
            <h4 style={{ fontWeight: 700, color: 'var(--heading-color)', marginBottom: '1rem' }}>Citizens Directory</h4>
            {citizens.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted-text)', padding: '2rem 0' }}>No citizens registered.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Citizen ID</th>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citizens.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700 }}>#{c.id}</td>
                        <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                        <td>{c.username}</td>
                        <td>{c.email}</td>
                        <td>{c.phone || 'N/A'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{c.address || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Add Worker Form */
          <div style={{ maxWidth: '460px', margin: '0 auto' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--heading-color)', marginBottom: '1.25rem', borderBottom: '1px solid rgba(15, 23, 42, 0.06)', paddingBottom: '0.5rem' }}>
              Add New Worker
            </h4>

            {workerError && (
              <div className="badge badge-rejected" style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', textTransform: 'none' }}>
                <ShieldAlert size={14} /> {workerError}
              </div>
            )}

            {workerSuccess && (
              <div className="badge badge-resolved" style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', textTransform: 'none' }}>
                <CheckCircle2 size={14} /> {workerSuccess}
              </div>
            )}

            <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  value={newWorker.fullName}
                  onChange={handleWorkerInputChange}
                  placeholder="e.g. Field Inspector Roy"
                  className="form-control"
                  style={{ borderRadius: '6px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  type="text"
                  value={newWorker.username}
                  onChange={handleWorkerInputChange}
                  placeholder="workerusername"
                  className="form-control"
                  style={{ borderRadius: '6px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  value={newWorker.email}
                  onChange={handleWorkerInputChange}
                  placeholder="inspector@civicresolve.gov"
                  className="form-control"
                  style={{ borderRadius: '6px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={newWorker.phone}
                  onChange={handleWorkerInputChange}
                  placeholder="9876543210"
                  className="form-control"
                  style={{ borderRadius: '6px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="password">Temporary Password *</label>
                <input
                  id="password"
                  type="password"
                  value={newWorker.password}
                  onChange={handleWorkerInputChange}
                  placeholder="••••••••"
                  className="form-control"
                  style={{ borderRadius: '6px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: '#166534', borderRadius: '6px', height: '38px' }} disabled={workerLoading}>
                {workerLoading ? <span className="spinner"></span> : 'Register Field Specialist'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* DISPATCH ASSIGNMENT DRAW MODAL */}
      {showAssignModal && selectedComplaint && (
        <div className="modal-backdrop active" onClick={() => setShowAssignModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '16px' }}>
            
            <div className="modal-header">
              <h4 className="modal-title">🚀 Dispatch Field Specialist</h4>
              <button onClick={() => setShowAssignModal(false)} className="modal-close">&times;</button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.06)' }}>
                  <strong>Mission Task:</strong> <span style={{ color: 'var(--heading-color)' }}>{selectedComplaint.title}</span>
                  <br />
                  <strong>Location:</strong> <span style={{ color: 'var(--heading-color)' }}>📍 {selectedComplaint.location}</span>
                </div>

                <div className="form-group">
                  <label htmlFor="workerSelect">Select Available Specialist *</label>
                  <select
                    id="workerSelect"
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="form-control"
                    style={{ borderRadius: '8px' }}
                    required
                  >
                    <option value="">-- Choose Field Worker --</option>
                    {workers.filter(w => w.enabled).map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.fullName} ({w.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assignNotes">Dispatch Instructions / Notes</label>
                  <textarea
                    id="assignNotes"
                    rows={3}
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="e.g. Please repair the pothole on the left lane ASAP..."
                    className="form-control"
                    style={{ resize: 'vertical', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-outline" style={{ borderRadius: '8px' }} disabled={assignLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#166534', borderRadius: '8px' }} disabled={assignLoading || !selectedWorkerId}>
                  {assignLoading ? <span className="spinner"></span> : 'Dispatch Mission'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
