import React, { useState, useEffect } from 'react';
import { Search, Eye, Clock, CheckCircle2, AlertCircle, ShieldAlert, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function MyReportsList({ setCurrentPage, setSelectedComplaintId, showToast }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      // Fetch only personally submitted complaints (works for citizens, workers, and admins alike!)
      const response = await fetch('/api/complaints?personal=true');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComplaints(data.complaints || []);
        }
      }
    } catch (err) {
      console.error("Failed to load personal reported list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleTrackClick = (id) => {
    setSelectedComplaintId(id);
    setCurrentPage('timeline');
  };

  const filtered = complaints.filter(c =>
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

  return (
    <div className="card-glass" style={{ padding: '2rem', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.08)', textAlign: 'left' }}>
      
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            My Reported Grievances
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
            List of community issues reported personally by {user?.fullName} ({user?.role.replace('ROLE_', '')})
          </p>
        </div>

        {/* Search & Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="form-control"
              style={{ width: '100%', paddingLeft: '2rem', height: '34px', fontSize: '0.8rem', borderRadius: '6px' }}
            />
            <Search size={12} style={{ position: 'absolute', left: '8px', top: '11px', color: '#94a3b8' }} />
          </div>

          <button onClick={() => setCurrentPage('submit')} className="btn btn-primary btn-sm" style={{ background: '#166534', height: '34px', borderRadius: '6px', fontSize: '0.8rem' }}>
            + Report New
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <span className="spinner" style={{ width: '2.5rem', height: '2.5rem' }}></span>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem' }}>Fetching database logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '1.5px dashed rgba(15, 23, 42, 0.08)', borderRadius: '12px' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {searchTerm 
              ? 'No reported grievances match your search query.' 
              : 'You have not submitted any civic complaint reports yet.'}
          </p>
          {!searchTerm && (
            <button onClick={() => setCurrentPage('submit')} className="btn btn-primary btn-sm" style={{ background: '#166534' }}>
              Submit First Complaint
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Grievance ID</th>
                <th>Thumbnail</th>
                <th>Title & Address</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Filed Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#166534' }}>CIV-{c.id}</td>
                  <td>
                    {/* Render ACTUAL uploaded image thumbnail if it exists, else render default category emoji! */}
                    {c.imagePath ? (
                      <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                        <img 
                          src={`/${c.imagePath}`} 
                          alt="Incident" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.25rem', border: '1px solid rgba(15, 23, 42, 0.05)' }}>
                        {c.category === 'DAMAGED_ROAD' && '🛣️'}
                        {c.category === 'GARBAGE' && '🚮'}
                        {c.category === 'WATER_LEAKAGE' && '💧'}
                        {c.category === 'ELECTRICITY' && '⚡'}
                        {c.category === 'STREETLIGHT' && '💡'}
                        {c.category === 'OTHER' && '💬'}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>📍 {c.location}</div>
                  </td>
                  <td>
                    <span className="badge badge-low" style={{ background: '#f8fafc', border: '1px solid rgba(15,23,42,0.06)' }}>
                      {c.categoryDisplay}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(c.priority)}`}>
                      {c.priorityDisplay}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                      {c.statusDisplay}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleTrackClick(c.id)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      <Eye size={12} /> Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
