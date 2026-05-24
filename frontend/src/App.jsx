import React, { useState } from 'react';
import { 
  Sparkles, Globe, LogIn, LogOut, LayoutDashboard, PlusCircle, ShieldAlert, 
  Award, FileText, Sun, Moon, CheckCircle2, AlertCircle, Home, Map, Plus, 
  Settings, Accessibility, Bell, HelpCircle, Search, LogOut as LogOutIcon 
} from 'lucide-react';

// Providers
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import SubmitComplaint from './pages/SubmitComplaint';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import TrackComplaint from './pages/TrackComplaint';
import MyReportsList from './pages/MyReportsList';


// Floating Widget
import AiChatAssistant from './components/AiChatAssistant';

function MainAppContent() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { user, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home'); // home, login, register, submit, dashboard, timeline, map
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Dynamic Category Preselection State
  const [preselectedCategory, setPreselectedCategory] = useState('');

  // Dynamic Theme (Light / Dark) State
  const [theme, setTheme] = useState(localStorage.getItem('civic_theme') || 'light');

  // Dynamic Toast Notification Overlay State
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('civic_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setCurrentPage('home');
      showToast(currentLanguage === 'hi' ? 'सफलतापूर्वक लॉगआउट किया गया।' : 'Successfully logged out.', 'success');
    }
  };

  // Dynamic Dashboard routing based on user roles
  const renderDashboard = () => {
    if (!user) return <Login setCurrentPage={setCurrentPage} showToast={showToast} />;
    
    switch (user.role) {
      case 'ROLE_ADMIN':
        return <AdminDashboard setCurrentPage={setCurrentPage} setSelectedComplaintId={setSelectedComplaintId} showToast={showToast} />;
      case 'ROLE_WORKER':
        return <WorkerDashboard setCurrentPage={setCurrentPage} setSelectedComplaintId={setSelectedComplaintId} showToast={showToast} />;
      case 'ROLE_USER':
      default:
        return <UserDashboard setCurrentPage={setCurrentPage} setSelectedComplaintId={setSelectedComplaintId} />;
    }
  };

  // Main Page Router switch
  const renderPage = () => {
    if (loading) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <span className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></span>
        </div>
      );
    }

    switch (currentPage) {
      case 'login':
        return <Login setCurrentPage={setCurrentPage} showToast={showToast} />;
      case 'register':
        return <Register setCurrentPage={setCurrentPage} showToast={showToast} />;
      case 'submit':
        return <SubmitComplaint setCurrentPage={setCurrentPage} preselectedCategory={preselectedCategory} setPreselectedCategory={setPreselectedCategory} showToast={showToast} />;
      case 'personal-reports':
        return <MyReportsList setCurrentPage={setCurrentPage} setSelectedComplaintId={setSelectedComplaintId} showToast={showToast} />;
      case 'dashboard':
        return renderDashboard();
      case 'timeline':
        return <TrackComplaint complaintId={selectedComplaintId} setCurrentPage={setCurrentPage} />;

      case 'map':
        return (
          <div className="card-glass" style={{ padding: '2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="top-header-title" style={{ marginBottom: '1rem' }}>🌐 Community Concentration Map</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px' }}>
              Real-time regional satellite view mapping active hotspots, sanitation dispatches, and infrastructure priorities across Springfield.
            </p>
            <div className="concentration-map-canvas" style={{ width: '100%', maxWidth: '600px', height: '350px' }}>
              <div className="map-grid-overlay"></div>
              <div className="map-radar-ring" style={{ top: '35%', left: '40%' }}></div>
              <div className="map-radar-ring" style={{ top: '65%', left: '70%' }}></div>
              <div className="map-pin-bullet pin-red" style={{ top: '35%', left: '40%', width: '14px', height: '14px' }}></div>
              <div className="map-pin-bullet pin-green" style={{ top: '65%', left: '70%', width: '14px', height: '14px' }}></div>
              <div className="map-pin-bullet pin-blue" style={{ top: '50%', left: '55%', width: '14px', height: '14px' }}></div>
            </div>
            <div className="concentration-map-footer" style={{ width: '100%', maxWidth: '600px', justifyContent: 'space-around', marginTop: '1.5rem' }}>
              <div>
                <div className="footer-focus-label">ACTIVE HOTSPOTS</div>
                <div className="footer-focus-value">Downtown South</div>
              </div>
              <div>
                <div className="footer-focus-label">FOCUS WARD</div>
                <div className="footer-focus-value">Wards 4 & 7</div>
              </div>
            </div>
          </div>
        );
      case 'home':
      default:
        return <LandingPage setCurrentPage={setCurrentPage} setSelectedComplaintId={setSelectedComplaintId} setPreselectedCategory={setPreselectedCategory} />;
    }
  };

  // Determine if Left Sidebar is rendered (Hidden on login, register, and submit filing pages)
  const isSidebarVisible = ['home', 'dashboard', 'timeline', 'map', 'personal-reports'].includes(currentPage);


  if (!isSidebarVisible) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {currentPage === 'submit' && (
          <header className="wizard-top-header">
            <a href="/" onClick={handleLogoClick} className="wizard-brand-link">
              <span className="logo-icon" style={{ width: '1.85rem', height: '1.85rem', fontSize: '0.9rem', borderRadius: '4px' }}>C</span>
              Civic Resolve
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <HelpCircle size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
              <button onClick={() => setCurrentPage(user ? 'dashboard' : 'home')} className="btn btn-outline btn-sm" style={{ border: '1px solid rgba(15, 23, 42, 0.15)', borderRadius: '6px' }}>
                Cancel Report
              </button>
            </div>
          </header>
        )}
        <main style={{ flex: 1, position: 'relative' }}>
          {renderPage()}
        </main>
        
        {/* Dynamic Toast Popup Notification Overlay */}
        {toast.visible && (
          <div className="toast-popup" style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            animation: 'slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            background: toast.type === 'error' ? 'var(--danger-bg)' : toast.type === 'warning' ? 'var(--warning-bg)' : 'var(--success-bg)',
            color: toast.type === 'error' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--success)',
            border: `1px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
            fontWeight: 600,
            fontSize: '0.875rem'
          }}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Sidebar Layout Render (Screen 1, 2, 3)
  return (
    <div className="app-container">
      {/* Stick left sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-top">
          {/* Logo Header */}
          <a href="/" onClick={handleLogoClick} className="sidebar-brand">
            <div className="sidebar-brand-title">Civic Resolve</div>
            <div className="sidebar-brand-sub">Local Action Portal</div>
          </a>

          {/* Sidebar Menu options */}
          <ul className="sidebar-menu">
            <li>
              <a onClick={() => setCurrentPage('home')} className={`sidebar-link ${currentPage === 'home' ? 'active' : ''}`}>
                <Home className="sidebar-link-icon" />
                {currentLanguage === 'hi' ? 'गृह पृष्ठ' : 'Home'}
              </a>
            </li>
            <li>
              <a onClick={() => setCurrentPage(user ? 'personal-reports' : 'login')} className={`sidebar-link ${currentPage === 'personal-reports' ? 'active' : ''}`}>
                <FileText className="sidebar-link-icon" />
                {currentLanguage === 'hi' ? 'मेरी शिकायतें' : 'My Reports'}
              </a>
            </li>

            <li>
              <a onClick={() => setCurrentPage('map')} className={`sidebar-link ${currentPage === 'map' ? 'active' : ''}`}>
                <Map className="sidebar-link-icon" />
                {currentLanguage === 'hi' ? 'सामुदायिक मानचित्र' : 'Community Map'}
              </a>
            </li>
            <li>
              <a onClick={() => setCurrentPage(user ? 'dashboard' : 'login')} className={`sidebar-link ${currentPage === 'dashboard' ? 'active' : ''}`}>
                <LayoutDashboard className="sidebar-link-icon" />
                {currentLanguage === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
              </a>
            </li>
          </ul>
        </div>

        {/* New Report green button & Settings Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <button onClick={() => setCurrentPage(user ? 'submit' : 'login')} className="btn-sidebar-new">
            <Plus size={16} />
            {currentLanguage === 'hi' ? 'नई शिकायत दर्ज करें' : '+ New Report'}
          </button>

          {/* Footer settings actions */}
          <div className="sidebar-footer">
            <a onClick={() => showToast(currentLanguage === 'hi' ? 'नगरपालिका सेटिंग्स पुनर्प्राप्त की गईं।' : 'Municipal settings successfully retrieved.', 'success')} className="sidebar-footer-link">
              <Settings size={14} />
              {currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'}
            </a>
            <a onClick={() => showToast(currentLanguage === 'hi' ? 'उच्च कंट्रास्ट सहायक विकल्प सक्षम।' : 'High contrast accessibility helpers activated.', 'success')} className="sidebar-footer-link">
              <Accessibility size={14} />
              {currentLanguage === 'hi' ? 'अभिगम्यता' : 'Accessibility'}
            </a>
            
            {/* Sign Out drawer trigger */}
            {user && (
              <a onClick={handleLogout} className="sidebar-footer-link" style={{ color: 'var(--danger)', marginTop: '0.25rem' }}>
                <LogOutIcon size={14} />
                {currentLanguage === 'hi' ? 'साइन आउट' : 'Sign Out'}
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Main Right Area Viewport */}
      <div className="main-viewport">
        {/* Top bar search header */}
        <header className="top-header-bar">
          <div className="top-header-title">
            {currentPage === 'home' && (currentLanguage === 'hi' ? 'नागरिक संकल्प' : 'Civic Resolve')}
            {currentPage === 'personal-reports' && (currentLanguage === 'hi' ? 'मेरी रिपोर्ट' : 'My Reported Grievances')}
            {currentPage === 'dashboard' && (user?.role === 'ROLE_ADMIN' ? 'Admin/Community Overview' : 'Dashboard')}
            {currentPage === 'timeline' && (currentLanguage === 'hi' ? 'शिकायत की स्थिति' : 'Incident Status Tracker')}
            {currentPage === 'map' && 'Community Map'}
          </div>


          <div className="top-header-actions">
            {/* Search Input Widget */}
            <div className="search-reports-wrapper">
              <input 
                type="text" 
                placeholder={currentLanguage === 'hi' ? 'शिकायतें खोजें...' : 'Search reports...'} 
                className="search-reports-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showToast(currentLanguage === 'hi' ? 'खोज प्रक्रिया शुरू...' : 'Searching municipal databases...', 'success');
                  }
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            </div>

            {/* Notification Bell */}
            <button onClick={() => showToast(currentLanguage === 'hi' ? 'कोई नया संदेश नहीं।' : 'No new notifications.', 'success')} className="header-action-btn" title="Notifications">
              <Bell size={15} />
            </button>

            {/* Help Circle */}
            <button onClick={() => setCurrentPage('home')} className="header-action-btn" title="Help Guide">
              <HelpCircle size={15} />
            </button>

            {/* Language Switcher Dropdown */}
            <div className="flex-gap-2">
              <Globe size={13} style={{ color: '#94a3b8' }} />
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="lang-switcher"
                style={{ padding: '0.35rem' }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
                <option value="te">తెలుగు</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>

            {/* Theme Sun/Moon */}
            <button onClick={toggleTheme} className="header-action-btn" title="Switch Theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* User avatar thumbnail */}
            <div className="header-profile-avatar" onClick={() => user ? setCurrentPage('dashboard') : setCurrentPage('login')}>
              {user ? (
                user.fullName.charAt(0).toUpperCase()
              ) : (
                'G'
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page render */}
        <div style={{ flex: 1, position: 'relative' }}>
          {renderPage()}
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
