import React, { useState } from 'react';
import { FileText, MapPin, Navigation, Camera, AlertCircle, CheckCircle2, ChevronRight, X, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';


export default function SubmitComplaint({ setCurrentPage, preselectedCategory, setPreselectedCategory, showToast }) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  // Stateful Wizard step: 1 (Category), 2 (Details), 3 (Review)
  const [wizardStep, setWizardStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    category: preselectedCategory || '',
    priority: 'MEDIUM',
    description: '',
    location: '',
    latitude: '',
    longitude: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { value: 'DAMAGED_ROAD', labelKey: 'cat.form.roads' },
    { value: 'WATER_LEAKAGE', labelKey: 'cat.form.water' },
    { value: 'ELECTRICITY', labelKey: 'cat.form.electricity' },
    { value: 'GARBAGE', labelKey: 'cat.form.sanitation' },
    { value: 'STREETLIGHT', labelKey: 'cat.form.lighting' },
    { value: 'OTHER', labelKey: 'cat.form.other' }
  ];

  const priorities = [
    { value: 'LOW', label: currentLanguage === 'hi' ? 'कम (Low)' : 'Low' },
    { value: 'MEDIUM', label: currentLanguage === 'hi' ? 'मध्यम (Medium)' : 'Medium' },
    { value: 'HIGH', label: currentLanguage === 'hi' ? 'उच्च (High)' : 'High' },
    { value: 'URGENT', label: currentLanguage === 'hi' ? 'अति आवश्यक (Urgent)' : 'Urgent' }
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(currentLanguage === 'hi' ? 'अमान्य फ़ाइल प्रकार! केवल JPG, PNG, GIF, WEBP की अनुमति है।' : 'Invalid file type! Only JPG, PNG, GIF, and WEBP formats are allowed.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
  };

  const getCoordinates = () => {
    setGpsLoading(true);
    setError('');
    setTimeout(() => {
      const lat = (41.8781 + (Math.random() - 0.5) * 0.01).toFixed(4);
      const lng = (-87.6298 + (Math.random() - 0.5) * 0.01).toFixed(4);
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        location: prev.location || 'Springfield, Sector 4'
      }));
      setGpsLoading(false);
      showToast(currentLanguage === 'hi' ? 'स्थान निर्देशांक सफलतापूर्वक स्कैन किए गए।' : 'GPS location coordinates mapped successfully.', 'success');
    }, 1200);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.category || !formData.priority || !formData.description.trim() || !formData.location.trim()) {
      setError(currentLanguage === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('description', formData.description.trim());
      data.append('location', formData.location.trim());
      
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      if (imageFile) data.append('image', imageFile);

      const response = await fetch('/api/complaints', {
        method: 'POST',
        body: data
      });

      const resJson = await response.json();
      if (response.ok && resJson.success) {
        setSuccess(t('complaint.success'));
        if (showToast) showToast(t('complaint.success'), 'success');
        if (setPreselectedCategory) setPreselectedCategory('');
        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 1500);
      } else {
        setError(resJson.error || (currentLanguage === 'hi' ? 'शिकायत दर्ज करने में असमर्थ।' : 'Could not submit your complaint.'));
      }
    } catch (err) {
      setError(currentLanguage === 'hi' ? 'कनेक्शन त्रुटि।' : 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const selectCategoryCard = (catVal) => {
    setFormData(prev => ({
      ...prev,
      category: catVal
    }));
    setWizardStep(2); // Automatically advance to Step 2!
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem', textAlign: 'left' }}>
      
      {/* Wizard stepper indicator panel */}
      <div className="wizard-stepper-panel">
        <div className="wizard-stepper-steps">
          <div className={`wizard-step-node ${wizardStep >= 1 ? 'active' : ''} ${wizardStep > 1 ? 'completed' : ''}`}>
            <div className="wizard-step-circle">1</div>
            <span>Category</span>
          </div>
          <div className="wizard-step-connector"></div>
          <div className={`wizard-step-node ${wizardStep >= 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}`}>
            <div className="wizard-step-circle">2</div>
            <span>Details</span>
          </div>
          <div className="wizard-step-connector"></div>
          <div className={`wizard-step-node ${wizardStep >= 3 ? 'active' : ''}`}>
            <div className="wizard-step-circle">3</div>
            <span>Review</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="badge badge-rejected" style={{ width: '100%', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="badge badge-resolved" style={{ width: '100%', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Main Wizard Layout columns */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
        
        {/* Left Column (Wizard steps content - 2/3 width) */}
        <div style={{ flex: '1.8', minWidth: '320px' }}>
          
          {/* STEP 1: CATEGORY SELECTION (Matches Screen 4) */}
          {wizardStep === 1 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                What's the concern today?
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '2rem' }}>
                Select the category that best matches your observation.
              </p>

              {/* Grid of 4 beautiful category option cards */}
              <div className="category-option-grid">
                
                {/* Roads & Sidewalks */}
                <div onClick={() => selectCategoryCard('DAMAGED_ROAD')} className={`category-option-card ${formData.category === 'DAMAGED_ROAD' ? 'selected' : ''}`}>
                  <div className="category-square-icon square-green">🛣️</div>
                  <div>
                    <div className="category-card-title">Roads & Sidewalks</div>
                    <p className="category-card-desc">Potholes, damaged curbs, or street light outages.</p>
                  </div>
                </div>

                {/* Sanitation */}
                <div onClick={() => selectCategoryCard('GARBAGE')} className={`category-option-card ${formData.category === 'GARBAGE' ? 'selected' : ''}`}>
                  <div className="category-square-icon square-blue">🗑️</div>
                  <div>
                    <div className="category-card-title">Sanitation</div>
                    <p className="category-card-desc">Missed collection, illegal dumping, or litter.</p>
                  </div>
                </div>

                {/* Parks & Trees */}
                <div onClick={() => selectCategoryCard('OTHER')} className={`category-option-card ${formData.category === 'OTHER' ? 'selected' : ''}`}>
                  <div className="category-square-icon square-orange">🌲</div>
                  <div>
                    <div className="category-card-title">Parks & Trees</div>
                    <p className="category-card-desc">Fallen branches, park equipment damage.</p>
                  </div>
                </div>

                {/* Other Issue */}
                <div onClick={() => selectCategoryCard('OTHER')} className={`category-option-card ${formData.category === 'OTHER' ? 'selected' : ''}`}>
                  <div className="category-square-icon square-purple">💬</div>
                  <div>
                    <div className="category-card-title">Other Issue</div>
                    <p className="category-card-desc">Report something not listed above.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: CLAIM DETAILS */}
          {wizardStep === 2 && (
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#ffffff', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', paddingBottom: '0.75rem' }}>
                <FileText size={18} style={{ color: '#166534' }} />
                Report Details
              </h3>

              <div className="form-group">
                <label htmlFor="title">{t('complaint.title')} *</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t('complaint.titlePlaceholder')}
                  className="form-control"
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                  <label htmlFor="category">Refined Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-control"
                    style={{ borderRadius: '8px' }}
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat.value}>{t(cat.labelKey)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                  <label htmlFor="priority">{t('complaint.priority')} *</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-control"
                    style={{ borderRadius: '8px' }}
                  >
                    {priorities.map((p, idx) => (
                      <option key={idx} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Detailed Description *</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue, landmarks, and duration of the problem..."
                  className="form-control"
                  style={{ borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Add Incident Photo</label>
                <div
                  className={`upload-drag-area ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('image').click()}
                  style={{ border: '2px dashed rgba(15, 23, 42, 0.12)', borderRadius: '12px' }}
                >
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {imagePreview ? (
                    <div className="upload-preview" style={{ display: 'block' }}>
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" onClick={removeImage} className="upload-preview-remove">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="upload-icon" />
                      <p className="upload-text">Drag and drop or click here to upload photo</p>
                      <p className="upload-hint">Only JPG, PNG formats are allowed</p>
                    </>
                  )}
                </div>
              </div>

              {/* Step Navigation buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(1)} className="btn btn-outline" style={{ flex: 1, borderRadius: '8px' }}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.title.trim() || !formData.description.trim()) {
                      setError(currentLanguage === 'hi' ? 'शीर्षक और विवरण आवश्यक हैं।' : 'Title and description are required.');
                      return;
                    }
                    setError('');
                    setWizardStep(3); // Advance to Step 3!
                  }}
                  className="btn btn-primary"
                  style={{ flex: 2, background: '#166534', borderRadius: '8px' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & LOCATION (Matches Screen 4 final checks) */}
          {wizardStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#ffffff', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', paddingBottom: '0.75rem' }}>
                  <MapPin size={18} style={{ color: '#3b82f6' }} />
                   incident Coordinates & Location
                </h3>

                <div className="form-group">
                  <label htmlFor="location">Incident Address *</label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Block 4B, Sector 62, Landmark Park"
                    className="form-control"
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      id="latitude"
                      type="text"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="Latitude"
                      className="form-control"
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      id="longitude"
                      type="text"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="Longitude"
                      className="form-control"
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getCoordinates}
                  className="btn btn-outline"
                  style={{ width: '100%', display: 'flex', gap: '0.5rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.15)' }}
                  disabled={gpsLoading}
                >
                  {gpsLoading ? (
                    <>
                      <span className="spinner"></span>
                      Acquiring GPS coordinates...
                    </>
                  ) : (
                    <>
                      <Navigation size={14} />
                      Scan Current Geolocation Coordinates
                    </>
                  )}
                </button>
              </div>

              {/* Verified details */}
              <div className="card-glass" style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  👤 Contact Information Verification
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: '#64748b' }}>
                  <div><strong>Name:</strong> {user?.fullName}</div>
                  <div><strong>Email:</strong> {user?.email}</div>
                  <div><strong>Mobile:</strong> {user?.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Wizard Final Submit actions */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-outline" style={{ flex: 1, borderRadius: '8px' }} disabled={loading}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  style={{ flex: 2, background: '#166534', borderRadius: '8px', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Filing Grievance...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (AI helper bubble & live maps - 1/3 width) (Matches Screen 4 Right) */}
        <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Civic Guide AI Balloon helper */}
          <div className="civic-guide-card">
            <div className="civic-guide-header">
              <div className="civic-guide-avatar">🤖</div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a' }}>Civic Guide</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Online now to assist</div>
              </div>
            </div>

            <div className="civic-guide-bubble">
              "I can help you categorize your report or even transcribe your voice notes. If you're unsure about the location, just upload a photo and I'll try to extract the GPS data for you."
            </div>

            <div className="civic-guide-chips">
              <button onClick={() => showToast(currentLanguage === 'hi' ? 'आपातकालीन हॉटलाइन सक्रिय: डायल 112!' : 'Emergency hotline active: Dial 112!', 'warning')} className="guide-prompt-chip">
                ⚡ "Is this an emergency?"
              </button>
              <button onClick={() => { setCurrentPage('map'); showToast('Community map coordinates scanned.', 'success'); }} className="guide-prompt-chip">
                🔍 "Check for existing reports"
              </button>
            </div>
          </div>

          {/* Reports Nearby Card */}
          <div className="reports-nearby-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>Reports Nearby</span>
              <span className="pulse-badge">
                <span className="pulse-dot"></span>
                Live
              </span>
            </div>

            {/* Simulated interactive map canvas overlay */}
            <div className="reports-nearby-map">
              <div className="map-grid-overlay"></div>
              {/* Animated scanning rings */}
              <div className="map-radar-ring" style={{ top: '40%', left: '50%' }}></div>
              <div className="map-pin-bullet pin-red" style={{ top: '40%', left: '50%' }}></div>
              <div className="map-pin-bullet pin-green" style={{ top: '65%', left: '30%' }}></div>
              <div className="map-pin-bullet pin-blue" style={{ top: '55%', left: '70%' }}></div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'center', marginTop: '0.5rem' }}>
              📍 3 active reports in your neighborhood
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
