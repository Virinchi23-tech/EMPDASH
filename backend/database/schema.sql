-- Employees table (Unified table for Staff, Managers, and Admins)
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, -- Job title (e.g. Senior Dev)
    department TEXT NOT NULL,
    salary REAL NOT NULL,
    employee_level TEXT DEFAULT 'Staff', -- Staff, Manager, Admin
    manager_id INTEGER,
    joining_date TEXT NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Attendance / Work Sessions
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    check_in TEXT,
    check_out TEXT,
    work_hours REAL DEFAULT 0,
    status TEXT DEFAULT 'Active', -- Active, Concluded
    date TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Breaks tracking
CREATE TABLE IF NOT EXISTS breaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    break_start TEXT,
    break_end TEXT,
    break_duration REAL DEFAULT 0,
    date TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Leave Management
CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Bonuses management
CREATE TABLE IF NOT EXISTS bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    bonus_amount REAL NOT NULL,
    bonus_reason TEXT,
    date_given TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Meetings Log
CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    meeting_date TEXT NOT NULL,
    duration INTEGER, -- in minutes
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Initial Admin (admin / admin123)
-- Hash: $2a$10$wT/J00iC7X7Z.K7TzGv1l.m5vN176L3x.GZ7k6N7rZ8H2zF8g5S
INSERT OR IGNORE INTO employees (username, password, name, email, role, department, salary, employee_level, joining_date) 
VALUES ('admin', '$2a$10$wT/J00iC7X7Z.K7TzGv1l.m5vN176L3x.GZ7k6N7rZ8H2zF8g5S', 'System Administrator', 'admin@company.com', 'Admin', 'IT', 0, 'Admin', '2023-01-01');
