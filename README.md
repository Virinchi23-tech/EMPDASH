# Employee Dashboard - Admin & Employee System

# Employee Dashboard 🚀

## 🌐 Live Links

### Frontend (Vercel)
https://empdash23.vercel.app

### Backend (Render)
https://empdash.onrender.com

---

## ⚙️ Tech Stack
- Frontend: Vite + React
- Backend: Node.js + Express
- Database: Turso

---

## 🔗 API Base URL
Frontend uses:
VITE_API_URL=https://empdash23.vercel.app

A production-ready Enterprise Management System built with React, Node.js, and Turso (SQLite).

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access
Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Credentials (Demo)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | admin@empdash.com | admin123 |
| **Manager** | jane@empdash.com | manager123 |
| **HR** | robert@empdash.com | hr123 |
| **Employee** | alice@empdash.com | emp123 |

---

## 🛠 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Recharts, Lucide Icons, Framer Motion
- **Backend:** Node.js, Express.js, JWT Authentication
- **Database:** Turso (LibSQL / SQLite)
- **Architecture:** Clean Modular Controller-Service-Route Pattern

---

## 📊 Features
- ✅ **Real-time Analytics:** Visual charts for performance and growth.
- ✅ **Employee CRUD:** Comprehensive directory for user management.
- ✅ **Project Tracking:** Manage portfolios and team assignments.
- ✅ **Leave Workflow:** Automated requests and multi-role approvals.
- ✅ **Payroll System:** Generate and download digital payslips.
- ✅ **Smart Attendance:** Check-in/out protocols with break tracking.
- ✅ **Performance Audits:** Automated scoring based on work metrics.
- ✅ **Mobile Responsive:** Fluid UI/UX designed for all devices.

---

## 🗄 Database Schema
Powered by **Turso SQLite** for edge-ready performance.
- `users`: Identity and Role management.
- `projects`: Portfolio tracking.
- `project_assignments`: Team relational mapping.
- `leaves`: Time-off accountability.
- `salaries`: Financial disbursement logs.
- `attendance`: Presence and session tracking.
- `breaks`: Utilization monitoring.
- `performance`: Strategic audit scores.
