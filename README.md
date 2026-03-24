# PROJECT1 - Internal Management Platform (LibSQL + React)

## 📋 Overview
A scalable enterprise dashboard architecture built with **React (Vite)** and **Node.js (Express)**. The platform features a robust role-based access control (RBAC) system powered by **Turso (LibSQL)** and **JWT Authentication**.

## ✨ Key Features
- **Security-First Architecture**: JWT-protected API endpoints with role-based middleware guarding.
- **Smart Backend Boot**: Automatic port conflict detection (starts at `3001`, auto-increments if busy).
- **Turso DB Integration**: Real-time synchronization with cloud-ready LibSQL database.
- **Modular Frontend**: Feature-sliced architecture (`/features`) for clean separation between Employee, Manager, and Admin domains.

## 📁 Repository Architecture

```text
PROJECT1/
├── backend/                # Node.js REST API
│   ├── config/             # DB & Env configuration (Turso/LibSQL)
│   ├── controllers/        # Logical request handlers (Auth, Employee, etc.)
│   ├── middleware/         # Auth guards & JWT verification
│   ├── models/             # Schema & DB Seeding (initDb.js)
│   ├── routes/             # Endpoint definitions
│   ├── .env                # Private credentials (TURSO_*, JWT_SECRET)
│   └── server.js           # Smart-boot Express entry point
│
├── frontend/               # React (Vite) Frontend
│   ├── src/
│   │   ├── components/     # Shared UI (Sidebar, Header, ProtectedRoute)
│   │   ├── context/        # Global State (AuthContext)
│   │   ├── features/       # Role-specific modules (Admin, Employee, Manager)
│   │   ├── services/       # API calling layer (apiClient, usersService, etc.)
│   │   ├── pages/          # Top-level Routing Pages (Login, Dashboard)
│   │   ├── App.jsx         # Routing configuration
│   │   └── main.jsx        # App entry point
│   └── vite.config.js      # Alias config (@ -> /src)
└── README.md
```

## 🛠️ Setup & Running Locally

### 1. Backend Service
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure `.env` based on `.env.example`:
   ```bash
   TURSO_DATABASE_URL=libsql://...
   TURSO_AUTH_TOKEN=...
   JWT_SECRET=...
   ```
3. Start the dev server (uses `nodemon`):
   ```bash
   npm run dev
   ```
   *Note: Server will automatically find an available port starting from 3001.*

### 2. Frontend Application
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the development environment:
   ```bash
   npm run dev
   ```
3. Access the browser at `http://localhost:5173`.

## 🔑 Default Test Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Manager** | `manager@company.com` | `manager123` |
| **Employee** | `employee@company.com` | `employee123` |

## 🛡️ Technical Stack
- **Frontend**: React 18, Vite, Lucide React (Icons), CSS-in-JS (Premium Glassmorphism).
- **Backend**: Express, JWT, BcryptJS.
- **Database**: LibSQL (@libsql/client) for Turso.
