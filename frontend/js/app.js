/**
 * CivicResolve Core Application Script
 * 
 * Manages client-side state, central REST API fetch requests,
 * role-based authentication check routing, and pure client-side localization.
 */

// Global state
window.currentUser = null;
window.currentLanguage = localStorage.getItem('civic_lang') || 'en';

// Localization Dictionaries
const translations = {
    en: {
        "logo.resolve": "Resolve",
        "nav.features": "Features",
        "nav.howItWorks": "How It Works",
        "nav.categories": "Categories",
        "nav.submitComplaint": "Submit Complaint",
        "nav.signIn": "Sign In",
        "nav.register": "Register",
        "nav.dashboard": "Dashboard",
        "nav.signOut": "Sign Out",
        
        "hero.badge": "Smart Civic Management",
        "hero.title1": "Resolve Civic Grievances",
        "hero.title2": "Transparently & Swiftly",
        "hero.subtitle": "Report infrastructure issues, sanitation, water leakage, or lighting problems and watch them get assigned, tracked, and resolved by local authorities in real-time.",
        "hero.submitBtn": "Submit a Complaint",
        "hero.createAccount": "Create Citizen Account",
        "hero.trackLabel": "Fast Tracker System",
        "hero.trackPlaceholder": "Enter Complaint Number (e.g. 1)",
        "hero.trackBtn": "Track Status",

        "stats.resolved": "Resolved Complaints",
        "stats.active": "Active Issues",
        "stats.avgTime": "Average Resolution Time",
        "stats.satisfaction": "Resolution Rate",

        "footer.tagline": "CivicResolve is a Cloud-enabled municipal portal built to bridge the gap between citizens, administrators, and field workers to build smarter, cleaner cities.",
        "footer.quickLinks": "Quick Links",
        "footer.portals": "Municipal Portals",
        "footer.citizenPortal": "Citizen Portal",
        "footer.adminDashboard": "Admin Control Panel",
        "footer.workerPortal": "Worker Workspace",
        "footer.contact": "Contact Support",
        "footer.copyright": "© 2026 CivicResolve. All rights reserved.",
        "footer.credit": "Developed for Cloud Computing & Web Projects.",

        "login.title": "Welcome Back",
        "login.subtitle": "Log in to your portal using credentials",
        "login.username": "Username",
        "login.password": "Password",
        "login.btn": "Sign In",
        "login.noAccount": "Don't have an account?",
        "login.signupLink": "Sign up here",

        "register.title": "Register Citizen Account",
        "register.subtitle": "Sign up to submit and track local community complaints",
        "register.fullName": "Full Name",
        "register.email": "Email Address",
        "register.phone": "Mobile Number",
        "register.address": "Residential Address",
        "register.confirmPassword": "Confirm Password",
        "register.btn": "Register Account",
        "register.hasAccount": "Already registered?",
        "register.loginLink": "Log in here",

        "complaint.pageTitle": "Submit Civic Grievance",
        "complaint.pageSubtitle": "Please provide accurate details about the local issue to help us dispatch workers correctly.",
        "complaint.detailsTitle": "Complaint Details",
        "complaint.detailsSubtitle": "Tell us what is wrong and select a category and priority level",
        "complaint.title": "Complaint Title",
        "complaint.titlePlaceholder": "e.g. Potholes on Main Street near Metro Station",
        "complaint.category": "Category",
        "complaint.categoryPlaceholder": "Select a category",
        "complaint.priority": "Priority Level",
        "complaint.priorityPlaceholder": "Select priority",
        "complaint.description": "Detailed Description",
        "complaint.descriptionPlaceholder": "Describe the issue, landmarks, and duration of the problem...",
        "complaint.attachments": "Attachments & Pictures",
        "complaint.uploadText": "Drag and drop or click here to upload photo",
        "complaint.uploadHint": "Only JPG, PNG, GIF, and WEBP formats (Max 10MB)",
        "complaint.locationTitle": "Incident Location",
        "complaint.locationSubtitle": "Specify where the problem is located",
        "complaint.location": "Street Address",
        "complaint.locationPlaceholder": "e.g. Block 4B, Sector 62, Landmark Park",
        "complaint.coords": "Coordinates (Optional)",
        "complaint.latitude": "Latitude",
        "complaint.longitude": "Longitude",
        "complaint.contactTitle": "Contact Information Verification",
        "complaint.contactSubtitle": "These details will be used for follow-ups and notifications",
        "complaint.cancel": "Cancel",
        "complaint.submit": "Submit Complaint",
        "complaint.success": "Grievance submitted successfully!",

        "dashboard.citizen": "Citizen Workspace",
        "dashboard.admin": "Admin Control Dashboard",
        "dashboard.worker": "Worker Tasks Workspace",
        "dashboard.allComplaints": "Grievance Records",
        "dashboard.newWorker": "Add New Worker",
        "dashboard.workers": "Workers",
        "dashboard.citizens": "Citizens",

        "cat.form.roads": "Roads & Potholes",
        "cat.form.water": "Water Leakage & Supply",
        "cat.form.electricity": "Electricity Failure",
        "cat.form.sanitation": "Sanitation & Waste",
        "cat.form.safety": "Public Safety",
        "cat.form.parks": "Parks & Recreation",
        "cat.form.building": "Illegal Building & Construction",
        "cat.form.drainage": "Drainage & Sewage Leakage",
        "cat.form.lighting": "Streetlight Failure",
        "cat.form.noise": "Noise Pollution",
        "cat.form.other": "Other Grievances",
    },
    hi: {
        "logo.resolve": "निवारण",
        "nav.features": "विशेषताएं",
        "nav.howItWorks": "यह कैसे काम करता है",
        "nav.categories": "श्रेणियां",
        "nav.submitComplaint": "शिकायत दर्ज करें",
        "nav.signIn": "लॉग इन करें",
        "nav.register": "रजिस्टर करें",
        "nav.dashboard": "डैशबोर्ड",
        "nav.signOut": "लॉग आउट",

        "hero.badge": "स्मार्ट नागरिक प्रबंधन",
        "hero.title1": "नागरिक समस्याओं का",
        "hero.title2": "पारदर्शी और त्वरित निवारण",
        "hero.subtitle": "सड़क के गड्ढे, स्वच्छता, पानी का रिसाव, या बिजली की समस्याओं की रिपोर्ट करें और वास्तविक समय में स्थानीय अधिकारियों द्वारा उन्हें सौंपे, ट्रैक और हल होते देखें।",
        "hero.submitBtn": "शिकायत दर्ज करें",
        "hero.createAccount": "नागरिक खाता बनाएं",
        "hero.trackLabel": "फास्ट ट्रैकर सिस्टम",
        "hero.trackPlaceholder": "शिकायत संख्या दर्ज करें (जैसे 1)",
        "hero.trackBtn": "ट्रैक करें",

        "stats.resolved": "निवारण की गई शिकायतें",
        "stats.active": "सक्रिय समस्याएं",
        "stats.avgTime": "औसत निवारण समय",
        "stats.satisfaction": "सफलता दर",

        "footer.tagline": "CivicResolve एक क्लाउड-सक्षम नागरिक पोर्टल है जिसे नागरिकों, प्रशासकों और क्षेत्रीय कार्यकर्ताओं के बीच की दूरी को पाटने के लिए बनाया गया है।",
        "footer.quickLinks": "त्वरित लिंक्स",
        "footer.portals": "नगरपालिका पोर्टल",
        "footer.citizenPortal": "नागरिक पोर्टल",
        "footer.adminDashboard": "प्रशासक नियंत्रण कक्ष",
        "footer.workerPortal": "कार्यकर्ता कार्यक्षेत्र",
        "footer.contact": "सहायता से संपर्क करें",
        "footer.copyright": "© 2026 CivicResolve. सभी अधिकार सुरक्षित।",
        "footer.credit": "क्लाउड कंप्यूटिंग और वेब प्रोजेक्ट के लिए विकसित।",

        "login.title": "स्वागत हे",
        "login.subtitle": "क्रेडेंशियल्स का उपयोग करके अपने पोर्टल में लॉग इन करें",
        "login.username": "उपयोगकर्ता नाम",
        "login.password": "पासवर्ड",
        "login.btn": "लॉग इन करें",
        "login.noAccount": "खाता नहीं है?",
        "login.signupLink": "यहाँ रजिस्टर करें",

        "register.title": "नागरिक खाता पंजीकृत करें",
        "register.subtitle": "स्थानीय समुदाय की शिकायतें दर्ज करने और ट्रैक करने के लिए साइन अप करें",
        "register.fullName": "पूरा नाम",
        "register.email": "ईमेल पता",
        "register.phone": "मोबाइल नंबर",
        "register.address": "आवासीय पता",
        "register.confirmPassword": "पासवर्ड की पुष्टि करें",
        "register.btn": "खाता पंजीकृत करें",
        "register.hasAccount": "पहले से पंजीकृत हैं?",
        "register.loginLink": "यहाँ लॉग इन करें",

        "complaint.pageTitle": "नागरिक शिकायत दर्ज करें",
        "complaint.pageSubtitle": "कार्यकर्ताओं को सही ढंग से भेजने में हमारी मदद करने के लिए स्थानीय समस्या के बारे में सटीक विवरण प्रदान करें।",
        "complaint.detailsTitle": "शिकायत का विवरण",
        "complaint.detailsSubtitle": "हमें बताएं कि क्या गलत है और श्रेणी और प्राथमिकता स्तर चुनें",
        "complaint.title": "शिकायत का शीर्षक",
        "complaint.titlePlaceholder": "उदा. मेट्रो स्टेशन के पास मेन स्ट्रीट पर गड्ढे",
        "complaint.category": "श्रेणी",
        "complaint.categoryPlaceholder": "एक श्रेणी चुनें",
        "complaint.priority": "प्राथमिकता स्तर",
        "complaint.priorityPlaceholder": "प्राथमिकता चुनें",
        "complaint.description": "विस्तृत विवरण",
        "complaint.descriptionPlaceholder": "समस्या, स्थलों और समस्या की अवधि का वर्णन करें...",
        "complaint.attachments": "अनुलग्नक और चित्र",
        "complaint.uploadText": "फ़ोटो अपलोड करने के लिए खींचें और छोड़ें या यहाँ क्लिक करें",
        "complaint.uploadHint": "केवल JPG, PNG, GIF और WEBP प्रारूप (अधिकतम 10MB)",
        "complaint.locationTitle": "घटना स्थल",
        "complaint.locationSubtitle": "निर्दिष्ट करें कि समस्या कहाँ स्थित है",
        "complaint.location": "सड़क का पता",
        "complaint.locationPlaceholder": "उदा. ब्लॉक 4B, सेक्टर 62, लैंडमार्क पार्क",
        "complaint.coords": "निर्देशांक (वैकल्पिक)",
        "complaint.latitude": "अक्षांश",
        "complaint.longitude": "देशांतर",
        "complaint.contactTitle": "संपर्क जानकारी का सत्यापन",
        "complaint.contactSubtitle": "इन विवरणों का उपयोग फॉलो-अप और सूचनाओं के लिए किया जाएगा",
        "complaint.cancel": "रद्द करें",
        "complaint.submit": "शिकायत दर्ज करें",
        "complaint.success": "शिकायत सफलतापूर्वक दर्ज की गई!",

        "dashboard.citizen": "नागरिक कार्यक्षेत्र",
        "dashboard.admin": "प्रशासक नियंत्रण डैशबोर्ड",
        "dashboard.worker": "कार्यकर्ता कार्यक्षेत्र",
        "dashboard.allComplaints": "शिकायत रिकॉर्ड",
        "dashboard.newWorker": "नया कार्यकर्ता जोड़ें",
        "dashboard.workers": "कार्यकर्ता",
        "dashboard.citizens": "नागरिक",

        "cat.form.roads": "सड़कें और गड्ढे",
        "cat.form.water": "पानी का रिसाव और आपूर्ति",
        "cat.form.electricity": "बिजली की समस्या",
        "cat.form.sanitation": "स्वच्छता और कचरा",
        "cat.form.safety": "सार्वजनिक सुरक्षा",
        "cat.form.parks": "पार्क और मनोरंजन",
        "cat.form.building": "अवैध निर्माण",
        "cat.form.drainage": "जल निकासी और सीवेज रिसाव",
        "cat.form.lighting": "स्ट्रीटलाइट विफलता",
        "cat.form.noise": "ध्वनि प्रदूषण",
        "cat.form.other": "अन्य शिकायतें",
    }
};

// Pure client-side Translation Engine
function translatePage() {
    const lang = window.currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') {
                elem.setAttribute('placeholder', translations[lang][key]);
            } else {
                elem.innerText = translations[lang][key];
            }
        }
    });

    // Update language selectors visual state
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = lang;
    }
}

// Set up language switcher event listeners
document.addEventListener('DOMContentLoaded', () => {
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.addEventListener('change', (e) => {
            window.currentLanguage = e.target.value;
            localStorage.setItem('civic_lang', e.target.value);
            translatePage();
        });
    }
    translatePage();
});

// Centralized Fetch REST Client Wrapper
async function apiRequest(url, options = {}) {
    // Default headers
    if (!options.headers) {
        options.headers = {};
    }
    
    // Do not set Content-Type header if sending FormData (browser does it automatically with boundary!)
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, options);
        
        // Handle 401 Redirects automatically for protected routes
        if (response.status === 401) {
            const currentPath = window.location.pathname;
            if (!currentPath.endsWith('index.html') && 
                !currentPath.endsWith('login.html') && 
                !currentPath.endsWith('register.html') && 
                currentPath !== '/' &&
                currentPath !== '') {
                window.location.href = 'login.html';
                return null;
            }
        }

        return response;
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

// Authentication Check & Dynamic Header UI setup
async function checkAuth(requiredRole = null) {
    try {
        const response = await apiRequest('/api/auth/me');
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                window.currentUser = data;
                
                // Authorize roles
                if (requiredRole && data.role !== requiredRole) {
                    // Redirect unauthorized users to correct dashboard
                    if (data.role === 'ROLE_ADMIN') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (data.role === 'ROLE_WORKER') {
                        window.location.href = 'worker-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                    return;
                }

                setupHeaderUI(true);
                return data;
            }
        }
    } catch (e) {
        console.log("Not logged in");
    }

    setupHeaderUI(false);
    
    // Redirect if accessing a protected page
    if (requiredRole) {
        window.location.href = 'login.html';
    }
    return null;
}

// Dynamic Nav-Links and User avatar builder
function setupHeaderUI(isLoggedIn) {
    const navLinks = document.getElementById('navLinks');
    const navActions = document.getElementById('navActions');
    
    if (!navLinks || !navActions) return;

    if (isLoggedIn && window.currentUser) {
        // Set up links based on Role
        let dashboardPage = 'user-dashboard.html';
        if (window.currentUser.role === 'ROLE_ADMIN') {
            dashboardPage = 'admin-dashboard.html';
        } else if (window.currentUser.role === 'ROLE_WORKER') {
            dashboardPage = 'worker-dashboard.html';
        }

        let linksHtml = `
            <a href="index.html" class="nav-link" data-i18n="nav.howItWorks">How It Works</a>
        `;

        if (window.currentUser.role === 'ROLE_USER') {
            linksHtml += `
                <a href="submit-complaint.html" class="nav-link" data-i18n="nav.submitComplaint">Submit Complaint</a>
            `;
        }

        linksHtml += `
            <a href="${dashboardPage}" class="nav-link" data-i18n="nav.dashboard">Dashboard</a>
        `;
        navLinks.innerHTML = linksHtml;

        // User profile menu with logout hook
        const initials = window.currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        navActions.innerHTML = `
            <select id="languageSwitcher" class="lang-switcher">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
            </select>
            <div class="user-menu">
                <div class="user-avatar">${initials}</div>
                <span class="user-username">${window.currentUser.fullName}</span>
            </div>
            <button id="signOutBtn" class="btn btn-outline btn-sm" data-i18n="nav.signOut">Sign Out</button>
        `;

        document.getElementById('signOutBtn').addEventListener('click', handleSignOut);

    } else {
        // Default anonymous links
        navLinks.innerHTML = `
            <a href="index.html#features" class="nav-link" data-i18n="nav.features">Features</a>
            <a href="index.html#how-it-works" class="nav-link" data-i18n="nav.howItWorks">How It Works</a>
        `;
        
        navActions.innerHTML = `
            <select id="languageSwitcher" class="lang-switcher">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
            </select>
            <a href="login.html" class="btn btn-ghost btn-sm" data-i18n="nav.signIn">Sign In</a>
            <a href="register.html" class="btn btn-primary btn-sm" data-i18n="nav.register">Register</a>
        `;
    }

    // Bind lang switcher event
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = window.currentLanguage;
        switcher.addEventListener('change', (e) => {
            window.currentLanguage = e.target.value;
            localStorage.setItem('civic_lang', e.target.value);
            translatePage();
        });
    }

    translatePage();
}

// Process Sign Out REST request
async function handleSignOut() {
    try {
        const response = await apiRequest('/api/auth/logout', { method: 'POST' });
        if (response && response.ok) {
            window.currentUser = null;
            window.location.href = 'index.html';
        }
    } catch (e) {
        console.error("Logout failed:", e);
    }
}

// Helpers for badges and tags
function getStatusBadge(status) {
    const displayNames = {
        'PENDING': 'Pending Review',
        'ASSIGNED': 'Assigned',
        'IN_PROGRESS': 'In Progress',
        'RESOLVED': 'Resolved',
        'REJECTED': 'Rejected'
    };
    const lower = status.toLowerCase().replace('_', '-');
    return `<span class="badge badge-${lower}">${displayNames[status] || status}</span>`;
}

function getPriorityBadge(priority) {
    const lower = priority.toLowerCase();
    return `<span class="badge badge-${lower}">${priority}</span>`;
}

function getCategoryDisplay(category) {
    const categories = {
        'GARBAGE': 'Garbage Collection',
        'WATER_LEAKAGE': 'Water Leakage',
        'DAMAGED_ROAD': 'Damaged Road',
        'ELECTRICITY': 'Electricity Issue',
        'STREETLIGHT': 'Streetlight Failure',
        'OTHER': 'Other'
    };
    return categories[category] || category;
}

// Standard notification popup builder
function showToast(message, type = 'success') {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 24px;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            transform: translateY(100px);
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }

    if (type === 'success') {
        toast.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }

    toast.innerText = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 4000);
}
