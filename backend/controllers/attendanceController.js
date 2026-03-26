const { client } = require('../config/db');

/**
 * calculateHours - Helper to compute time difference in hours
 */
const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    try {
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        
        const startDate = new Date(0, 0, 0, h1, m1);
        const endDate = new Date(0, 0, 0, h2, m2);
        
        if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
        
        const diff = endDate - startDate;
        return parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
    } catch (e) {
        return 0;
    }
};

/**
 * checkIn - Synchronized arrival for individual personnel
 */
exports.checkIn = async (req, res) => {
    const employee_id = req.user.id; // From JWT (emp_id)
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log(`📡 [DB] ATTENDANCE IN: Candidate=${employee_id} Date=${date} Time=${time}`);

    try {
        if (!employee_id) return res.status(401).json({ success: false, message: 'Identity missing from token' });

        // Check for existing active session (checked in but not checked out)
        const active = await client.execute({
            sql: "SELECT id FROM attendance WHERE employee_id = ? AND date = ? AND check_out_time IS NULL",
            args: [employee_id, date]
        });

        if (active.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'You have an active session. Please check out first.' });
        }

        console.log(`🔍 [DB] INSERT Attendance: Args=[${employee_id}, ${date}, ${time}, 'Checked In']`);
        await client.execute({
            sql: "INSERT INTO attendance (employee_id, date, check_in_time, status) VALUES (?, ?, ?, ?)",
            args: [employee_id, date, time, 'Checked In']
        });

        res.status(201).json({ success: true, message: 'Arrival confirmed', checkIn: time });
    } catch (err) {
        console.error('🔥 Attendance DB Failure:', err.message);
        res.status(500).json({ success: false, message: 'Database rejection: ' + err.message });
    }
};

/**
 * checkOut - Synchronized departure for individual personnel
 */
exports.checkOut = async (req, res) => {
    const employee_id = req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log(`📡 [DB] ATTENDANCE OUT: Candidate=${employee_id} Date=${date} Time=${time}`);

    try {
        if (!employee_id) return res.status(401).json({ success: false, message: 'Identity missing from token' });

        const active = await client.execute({
            sql: "SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND check_out_time IS NULL",
            args: [employee_id, date]
        });

        if (active.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No active session found for today. Did you check in?' });
        }

        const session = active.rows[0];
        const totalHours = calculateHours(session.check_in_time, time);

        console.log(`🔍 [DB] UPDATE Attendance (ID ${session.id}): Args=[${time}, ${totalHours}, 'Checked Out']`);
        await client.execute({
            sql: "UPDATE attendance SET check_out_time = ?, total_hours = ?, status = ? WHERE id = ?",
            args: [time, totalHours, 'Checked Out', session.id]
        });
        console.log('✅ [DB] Update Successful');

        res.json({ success: true, message: 'Departure confirmed', checkOut: time, totalHours });
    } catch (err) {
        console.error('🔥 Attendance DB Failure:', err.message);
        res.status(500).json({ success: false, message: 'Database deactivation failed: ' + err.message });
    }
};

/**
 * getMyAttendance - Retrieve current user's attendance for today
 */
exports.getMyAttendance = async (req, res) => {
    const employee_id = req.user.id;
    const date = new Date().toISOString().split('T')[0];
    
    try {
        const result = await client.execute({
            sql: "SELECT * FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC LIMIT 1",
            args: [employee_id, date]
        });
        
        res.json({ success: true, data: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Identity sync error: ' + err.message });
    }
};

/**
 * getMyHistory - Retrieve individual operational history
 */
exports.getMyHistory = async (req, res) => {
    const employee_id = req.user.id;
    console.log(`📡 ATTENDANCE: History Fetch: ${employee_id}`);

    try {
        const results = await client.execute({
            sql: "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC, id DESC",
            args: [employee_id]
        });

        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 History sync failure:', err.message);
        res.status(500).json({ success: false, message: 'History retrieval suspended' });
    }
};

/**
 * getAllAttendance - Organizational pulse monitoring (Admin Only)
 */
exports.getAllAttendance = async (req, res) => {
    const { date, emp_id } = req.query;
    console.log(`📡 [DB] ATTENDANCE GLOBAL FETCH: FilterDate=${date}, FilterEmp=${emp_id}`);
    
    try {
        let query = `
            SELECT a.id, e.name as employee_name, a.date, a.check_in_time, a.check_out_time, a.total_hours, a.status, a.employee_id
            FROM attendance a
            LEFT JOIN employees e ON a.employee_id = e.id
        `;
        const args = [];
        const filters = [];

        if (date) {
            filters.push("a.date = ?");
            args.push(date);
        }
        if (emp_id) {
            filters.push("(a.employee_id LIKE ? OR e.name LIKE ?)");
            args.push(`%${emp_id}%`);
            args.push(`%${emp_id}%`);
        }

        if (filters.length > 0) {
            query += " WHERE " + filters.join(" AND ");
        }

        query += " ORDER BY a.date DESC, a.check_in_time DESC";

        const results = await client.execute({ sql: query, args });
        console.log(`✅ [DB] Global Fetch Successful: Rows=${results.rows.length}`);
        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error('🔥 Global Fetch Failure:', err.message);
        res.status(500).json({ success: false, message: 'Organizational pulses suspended' });
    }
};
