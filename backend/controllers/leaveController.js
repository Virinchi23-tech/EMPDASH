const { client } = require('../config/db');

/**
 * requestLeave - Individual personnel lifecycle request
 */
exports.requestLeave = async (req, res) => {
    const { emp_id, leave_type, start_date, end_date, reason } = req.body;
    console.log(`📡 API: POST /api/leaves/request (${emp_id})`);

    try {
        if (!emp_id) return res.status(400).json({ success: false, message: 'Digital ID required' });

        await client.execute({
            sql: "INSERT INTO leaves (emp_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)",
            args: [emp_id, leave_type, start_date, end_date, reason, 'Pending']
        });

        res.status(201).json({ success: true, message: 'Lifecycle Request Persisted' });
    } catch (err) {
        console.error('🔥 Lifecycle Request Failure:', err.message);
        res.status(500).json({ success: false, message: 'Lifecycle registry suspended' });
    }
};

/**
 * getMyLeaves - Retrieve individual personnel lifecycle history
 */
exports.getMyLeaves = async (req, res) => {
    const { id } = req.params; // emp_id
    console.log(`📡 API: GET /api/leaves/my-history/${id}`);

    try {
        if (!id) return res.status(400).json({ success: false, message: 'Digital ID required' });

        const results = await client.execute({
            sql: "SELECT * FROM leaves WHERE emp_id = ? ORDER BY start_date DESC",
            args: [id]
        });

        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 Lifecycle Fetch Failure:', err.message);
        res.status(500).json({ success: false, message: 'Lifecycle history suspended' });
    }
};

/**
 * getAllLeaves - Organizational lifecycle overview (Admin Only)
 */
exports.getAllLeaves = async (req, res) => {
    console.log(`📡 API: GET /api/leaves/all`);
    try {
        const results = await client.execute(`
            SELECT l.*, e.name as employee_name, e.department 
            FROM leaves l
            JOIN employees e ON l.emp_id = e.emp_id
            ORDER BY l.start_date DESC
        `);
        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 Global Lifecycle Fetch Failure:', err.message);
        res.status(500).json({ success: false, message: 'Organizational lifecycle suspended' });
    }
};

/**
 * updateLeaveStatus - Organizational tier decision (Admin Only)
 */
exports.updateLeaveStatus = async (req, res) => {
    const { id, status } = req.body; // leave id and new status
    console.log(`📡 API: PUT /api/leaves/update-status (${id} -> ${status})`);

    try {
        await client.execute({
            sql: "UPDATE leaves SET status = ? WHERE id = ?",
            args: [status, id]
        });
        res.json({ success: true, message: 'Lifecycle Status Synchronized' });
    } catch (err) {
        console.error('🔥 Lifecycle Update Failure:', err.message);
        res.status(500).json({ success: false, message: 'Lifecycle modification failed' });
    }
};
