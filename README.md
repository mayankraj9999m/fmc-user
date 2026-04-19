# 🏫 Fix My Campus (FMC) - Frontend

**A comprehensive complaint management system for campus infrastructure and facilities.**

🔗 **Live Application:** https://fmc-user.mayankrajtools.me/

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [User Roles & Workflows](#user-roles--workflows)
- [Feature Guides](#feature-guides)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

---

## 🎯 Overview

**Fix My Campus (FMC)** is a digital platform designed to streamline campus facility complaints and maintenance. It connects students, maintenance workers, wardens, and administrators in a unified system to resolve campus infrastructure issues efficiently.

### Key Objectives
- Enable students to lodge complaints about campus facilities
- Allow workers to track and resolve issues
- Provide wardens with oversight and performance analytics
- Give administrators comprehensive system management capabilities

---

## ✨ Features

### 🔐 Authentication System
- **Google OAuth** for students (institutional email validation)
- **Email/Password Authentication** for workers, wardens, and admins
- **Secure Session Management** with JWT tokens
- **Profile Management** for all user types

### 📝 Complaint Management
- **Lodge Complaints** - Submit issues with descriptions, categories, and photos
- **Track Complaints** - Real-time status updates (Open → In Progress → Resolved → Closed)
- **Escalate Complaints** - Escalate unresolved issues to higher authority
- **Provide Feedback** - Rate complaint resolution and leave feedback

### 👥 Role-Based Dashboards

#### Student Dashboard
- View personal complaints and their status
- Lodge new complaints
- Escalate complaints if needed
- Provide feedback on resolved complaints
- Track complaint history

#### Worker Dashboard
- View assigned complaints
- Update complaint status
- Add resolution notes with photos
- Track personal performance metrics
- View complaint categories (Electrical, Plumbing, Carpentry, etc.)

#### Warden Dashboard
- Monitor all workers under their hostel
- View worker performance statistics
- Track complaints by department
- Manage worker assignments
- Access hostel-wise analytics

#### Chief Warden Dashboard
- Oversee all hostels and wardens
- View system-wide analytics
- Manage warden accounts
- Monitor overall performance
- Generate reports

#### Admin Dashboard
- Manage student database (Import/Export CSV)
- Manage worker accounts
- Manage warden accounts
- System-wide reporting
- User management and access control

### 📊 Analytics & Reporting
- **Worker Performance** - Track resolution rate, average time
- **Hostel Analytics** - Complaint trends by hostel
- **Complaint Statistics** - By category, status, priority
- **Department Breakdown** - Performance by maintenance category

### 📢 Announcements
- Post campus-wide announcements
- Notify all users of important updates
- View announcement history

### 📁 Data Management
- **CSV Import** - Bulk upload student data
- **CSV Export** - Export student records
- **Search & Filter** - Find records by name, email, room, etc.
- **Pagination** - Efficient large dataset handling

---

## 🛠 Technology Stack

### Frontend
- **React 19.2** - UI Framework
- **Vite 7.2** - Build tool & dev server
- **React Router 7.13** - Client-side routing
- **Axios 1.13** - HTTP client for API calls
- **JWT Decode 4.0** - JWT token parsing
- **Lucide React 0.563** - Icon library
- **Recharts 3.8** - Data visualization

### Development Tools
- **ESLint 9.39** - Code linting
- **Node.js** - JavaScript runtime

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fix-my-campus-frontend.git
cd fix-my-campus-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the project root:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Frontend URL (for OAuth redirect)
VITE_FRONTEND_URL=http://localhost:5173
```

For production (`.env.production`):

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your_production_client_id
VITE_FRONTEND_URL=https://yourdomain.com
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

5. **Build for production**
```bash
npm run build
```

6. **Preview production build**
```bash
npm run preview
```

---

## 👥 User Roles & Workflows

### 1. **Student** 👨‍🎓

**How to Get Started:**
1. Visit https://fmc-user.mayankrajtools.me/
2. Click "Login with Google"
3. Authenticate with your institutional email
4. Complete your profile (room number, hostel)
5. Start lodging complaints!

**Key Permissions:**
- ✅ Lodge complaints
- ✅ View personal complaints
- ✅ Escalate complaints
- ✅ Provide feedback
- ✅ View announcements
- ❌ Cannot modify other complaints
- ❌ Cannot access admin functions

**Workflow:**
```
Login → Update Profile → Lodge Complaint → Track Status → 
Escalate (if needed) → View Resolution → Provide Feedback
```

### 2. **Worker** 🔧

**How to Get Started:**
1. Ask your warden for login credentials
2. Visit https://fmc-user.mayankrajtools.me/
3. Click "Login with Email/Password"
4. Go to **Worker Dashboard** (auto-redirected after login)
5. Start resolving complaints!

**Key Permissions:**
- ✅ View assigned complaints
- ✅ Update complaint status
- ✅ Add resolution notes & photos
- ✅ View personal performance metrics
- ❌ Cannot lodge complaints
- ❌ Cannot assign complaints
- ❌ Cannot access admin functions

**Workflow:**
```
Login → View Assigned Complaints → Select Complaint → 
Update Status → Add Notes/Photos → Mark Resolved
```

### 3. **Warden** 👔

**How to Get Started:**
1. Ask Chief Warden for login credentials
2. Visit https://fmc-user.mayankrajtools.me/
3. Click "Login with Email/Password"
4. Go to **Warden Dashboard** (auto-redirected after login)
5. Manage your hostel's maintenance operations

**Key Permissions:**
- ✅ View all complaints in hostel
- ✅ Manage workers (add, edit, delete)
- ✅ View worker performance
- ✅ View hostel-wise analytics
- ✅ Assign complaints to workers
- ❌ Cannot manage other hostels
- ❌ Cannot access system-wide settings

**Workflow:**
```
Login → View Worker Dashboard → Monitor Performance → 
Add/Remove Workers → View Analytics → Escalate Critical Issues
```

### 4. **Chief Warden** 🏛️

**How to Get Started:**
1. Login with Chief Warden credentials
2. Visit https://fmc-user.mayankrajtools.me/
3. Go to **Chief Warden Dashboard** (auto-redirected)
4. Oversee all campus operations

**Key Permissions:**
- ✅ View all hostels & analytics
- ✅ Manage wardens (add, edit, delete)
- ✅ View system-wide statistics
- ✅ Change password
- ✅ Receive analytics reports
- ✅ Manage announcements
- ❌ Cannot manage individual complaints directly

**Workflow:**
```
Login → View Overall Analytics → Manage Wardens → 
Review Performance Trends → Post Announcements
```

### 5. **Admin** 🔑

**How to Get Started:**
1. Login with Admin credentials
2. Visit https://fmc-user.mayankrajtools.me/
3. Go to **Admin Dashboard** (auto-redirected)
4. Manage the entire system

**Key Permissions:**
- ✅ Manage students (add, edit, delete, import/export)
- ✅ Manage workers (all workers)
- ✅ Manage wardens (all wardens)
- ✅ View all system statistics
- ✅ See reports
- ✅ System configuration
- ✅ Full database access
- ❌ Cannot override complaint decisions

**Workflow:**
```
Login → Manage Users → Import Data → View Analytics → 
Export Reports → Monitor System Health
```
---

## 🔌 API Endpoints

### Authentication Routes
```
POST   /api/auth/google          - Google OAuth login
POST   /api/auth/login           - Email/password login
GET    /api/auth/profile         - Get user profile
POST   /api/auth/logout          - Logout (clear session)
PUT    /api/auth/student/profile - Update student profile
PUT    /api/auth/admin/profile/password - Change admin password
```

### Student Routes
```
GET    /api/complaints/student/dashboard     - Get student complaints
POST   /api/complaints/student               - Lodge new complaint
PUT    /api/complaints/student/:id/escalate  - Escalate complaint
PUT    /api/complaints/student/:id/feedback  - Submit feedback
```

### Worker Routes
```
GET    /api/complaints/worker/dashboard      - Get assigned complaints
PUT    /api/complaints/worker/:id/resolve    - Resolve complaint
```

### Admin - Students
```
GET    /api/admin/students                   - Get all students
POST   /api/admin/students/add               - Add new student
PUT    /api/admin/students/:id               - Update student
DELETE /api/admin/students/:id               - Delete student
POST   /api/admin/students/bulk-delete       - Bulk delete students
POST   /api/admin/students/upload-csv        - Import students from CSV
GET    /api/admin/students/export            - Export students to CSV
```

### Admin - Workers (Warden)
```
GET    /api/admin/warden/workers             - Get all workers
POST   /api/admin/warden/workers             - Add new worker
PUT    /api/admin/warden/workers/:id         - Update worker
DELETE /api/admin/warden/workers/:id         - Delete worker
GET    /api/admin/warden/performance         - Get worker performance
GET    /api/admin/warden/workers/:id/complaints - Get worker complaints
```

### Admin - Wardens (Chief Warden)
```
GET    /api/admin/chief/wardens              - Get all wardens
POST   /api/admin/chief/wardens              - Add new warden
PUT    /api/admin/chief/wardens/:id          - Update warden
DELETE /api/admin/chief/wardens/:id          - Delete warden
GET    /api/admin/chief/hostel-analytics     - Get hostel analytics
```

### Announcements
```
GET    /api/announcements                    - Get all announcements
POST   /api/announcements                    - Create announcement (Admin only)
```

---

## 📁 Project Structure

```
fix-my-campus-frontend/
├── public/                          # Static assets
├── src/
│   ├── api.js                      # API client & endpoints
│   ├── App.jsx                     # Main app component
│   ├── App.css                     # Global styles
│   ├── index.css                   # Global CSS
│   ├── main.jsx                    # Entry point
│   ├── assets/                     # Images, fonts, etc.
│   ├── components/                 # Reusable components
│   │   ├── Buttons/                # Button components
│   │   ├── Card/                   # Card components
│   │   ├── ComplaintDetailModal/   # Complaint detail modal
│   │   ├── DetailItem.jsx          # Detail item component
│   │   ├── Footer.jsx              # Footer component
│   │   ├── FormElements/           # Form inputs
│   │   ├── Header.jsx              # Header/Navigation
│   │   ├── Modal/                  # Modal components
│   │   ├── NotFound.jsx            # 404 page
│   │   ├── NoticeBox/              # Notice components
│   │   ├── Pagination/             # Pagination component
│   │   └── Table/                  # Table component
│   ├── context/                    # React Context providers
│   │   ├── AlertProvider.jsx       # Alert state
│   │   ├── AuthContext.jsx         # Auth state
│   │   ├── AuthProvider.jsx        # Auth provider
│   │   └── ThemeProvider.jsx       # Theme state
│   ├── layouts/                    # Layout components
│   │   └── RootLayout.jsx          # Root layout
│   └── pages/                      # Page components
│       ├── Admin/                  # Admin dashboards
│       │   ├── AdminDashboard.jsx  # Student manager
│       │   ├── ChiefWardenDashboard.jsx
│       │   ├── HostelAnalytics.jsx
│       │   ├── WardenDashboard.jsx
│       │   └── WorkerPerformance.jsx
│       ├── Auth/                   # Authentication pages
│       │   ├── AuthCallback.jsx
│       │   ├── Login.jsx
│       │   ├── Profile.jsx
│       │   └── SignUp.jsx
│       ├── Home/                   # Home page
│       │   └── Home.jsx
│       ├── Student/                # Student pages
│       │   ├── StudentComplaints.jsx
│       │   └── WorkerDashboard.jsx
│       ├── Hostels.js
│       ├── LoadingScreen.jsx
│       └── Types_of_complaints.js
├── .env                            # Environment variables
├── .env.production                 # Production env vars
├── .eslintrc.js                    # ESLint config
├── package.json                    # Dependencies
├── vite.config.js                  # Vite config
└── index.html                      # HTML entry point
```

---

## 🚀 Quick Start Guide

### For Students
```bash
# 1. Visit the website
# https://fmc-user.mayankrajtools.me/

# 2. Click "Login with Google"

# 3. Authenticate with your campus email

# 4. Update your profile (hostel, room number)

# 5. Go to "Lodge Complaint"

# 6. Fill in the form with issue details and attach photos

# 7. Submit and track your complaint!
```

### For Workers
```bash
# 1. Ask your warden for login credentials

# 2. Visit https://fmc-user.mayankrajtools.me/

# 3. Click "Login with Email/Password"

# 4. You'll be directed to Worker Dashboard

# 5. View your assigned complaints

# 6. Click on a complaint to see details

# 7. Update status and add resolution notes

# 8. Upload completion photos

# 9. Mark as resolved
```

### For Wardens
```bash
# 1. Login with your credentials

# 2. Access Warden Dashboard

# 3. View all complaints in your hostel

# 4. Monitor worker performance

# 5. Add or remove workers

# 6. View analytics and trends
```

### For Admins
```bash
# 1. Login with admin credentials

# 2. Access Admin Dashboard

# 3. Import student data (CSV)

# 4. Manage users (add, edit, delete)

# 5. See reports
```

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Secure password hashing (backend)
- ✅ Role-based access control (RBAC)
- ✅ Protected API endpoints
- ✅ CORS protection
- ✅ Secure session management
- ✅ Input validation & sanitization
<!-- - ✅ Rate limiting (backend) -->

---

## 📞 Support & Help

- **Report Issues:** Contact your hostel warden or admin
- **Technical Support:** Reach out to the development team
- **Feature Requests:** Submit through the feedback form

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Follow the coding standards

---

## 🎉 Features Coming Soon

- 📱 Mobile app
- 🔔 Real-time notifications
- ⌛ Priority bases complaints
- 💬 In-app chat
- 🎯 Advanced scheduling
- 📊 Enhanced analytics dashboard
- 🤖 AI-powered issue categorization

---

**Made with ❤️ by the Development Team**

For the latest updates, visit: https://fmc-user.mayankrajtools.me/
