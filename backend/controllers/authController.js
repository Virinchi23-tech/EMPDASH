const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { client } = require('../config/db');

/**
 * login - Authenticates user and returns JWT
 * Identity Registry: Unified users + employees handshake
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`📡 [AUTH] Login Handshake initiated for: ${email}`);

        // Join users and employees on emp_id
        const result = await client.execute({
            sql: `
                SELECT u.id, u.email, u.password, u.role, u.emp_id, e.name
                FROM users u 
                LEFT JOIN employees e ON u.emp_id = e.emp_id
                WHERE u.email = ? LIMIT 1
            `,
            args: [email]
        });

        const user = result.rows[0];

        if (!user) {
            console.warn(`❌ [AUTH] Node Registry Denial: User not registered: ${email}`);
            return res.status(401).json({ error: "User not registered. Please contact admin" });
        }

        // Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn(`❌ [AUTH] Protocol Mismatch: Invalid password for: ${email}`);
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate JWT for app consistency
        const payload = {
            id: user.emp_id || user.id, // Prefer emp_id for database operations
            email: user.email,
            role: user.role,
            name: user.name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey123', {
            expiresIn: '24h'
        });

        console.log(`✅ Login success: ${user.email} (${user.role})`);
        
        // Return both structure requested by user and the token required by AuthContext
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * getMe - Returns current authenticated user profile
 */
exports.getMe = async (req, res) => {
    try {
        // Query by email which is consistent across both tables
        const query = await client.execute({
            sql: "SELECT emp_id, name, email, role, department, joining_date, salary, profile_image FROM employees WHERE email = ? LIMIT 1",
            args: [req.user.email]
        });

        if (query.rows.length === 0) {
            console.warn(`⚠️ Profile not found in registry for: ${req.user.email}`);
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(query.rows[0]);
    } catch (err) {
        console.error('🔥 Get Profile Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * register - Create new user
 */
exports.register = async (req, res) => {
    const { emp_id, name, email, password, role, department } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await client.execute({
            sql: "INSERT INTO employees (emp_id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)",
            args: [emp_id, name, email, hashedPassword, role || 'Employee', department || 'General']
        });
        
        // Sync with users table for authentication
        await client.execute({
            sql: "INSERT OR IGNORE INTO users (email, password, role, emp_id, name) VALUES (?, ?, ?, ?, ?)",
            args: [email, hashedPassword, role || 'Employee', emp_id, name]
        });

        res.status(201).json({ success: true, message: 'Identity Node Provisioned and Synced' });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * getUsers - List all system users
 */
exports.getUsers = async (req, res) => {
    try {
        const query = await client.execute("SELECT emp_id, name, email, role, department FROM employees");
        res.json(query.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
/**
 * updateProfile - Updates authenticated user profile
 */
exports.updateProfile = async (req, res) => {
    const { name, email, password, profile_image } = req.body;
    const oldEmail = req.user.email;
    try {
        // 1. Update Employees Registry
        let updateSql = "UPDATE employees SET name = ?, email = ?, profile_image = ? ";
        let args = [name, email, profile_image];
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateSql += ", password = ? ";
            args.push(hashedPassword);
        }
        
        updateSql += " WHERE email = ?";
        args.push(oldEmail);
        
        await client.execute({ sql: updateSql, args });
        
        // 2. Sync with Users Table for Login Mappings
        let userUpdateSql = "UPDATE users SET name = ?, email = ?, profile_image = ? ";
        let userArgs = [name, email, profile_image];
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            userUpdateSql += ", password = ? ";
            userArgs.push(hashedPassword);
        }
        
        userUpdateSql += " WHERE email = ?";
        userArgs.push(oldEmail);
        
        await client.execute({ sql: userUpdateSql, args: userArgs });

        console.log(`✅ Profile Updated: ${email}`);
        res.json({ success: true, message: 'Identity node updated and synchronized.' });
    } catch (err) {
        console.error('🔥 Update Profile Failure:', err.message);
        res.status(500).json({ message: 'Strategic update failed. Hub rejected transmission.' });
    }
};
