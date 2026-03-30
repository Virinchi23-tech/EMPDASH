const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('❌ [AUTH] Handshake Interrupted: Identity Token Missing');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        req.user = decoded;
        next();
    } catch (err) {
        console.error('❌ [AUTH] Integrity Failure: Invalid JWT Handshake:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required for synchronization' });
        }

        const userRole = req.user.role?.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (allowedRoles.length && !allowedRoles.includes(userRole)) {
            console.warn(`❌ [AUTH] Unauthorized Access Attempt: Role ${userRole} not in sanctioned list [${allowedRoles}]`);
            return res.status(403).json({ message: 'Access denied: Insufficient permissions for this node' });
        }
        next();
    };
};

module.exports = { authMiddleware, authorize };
