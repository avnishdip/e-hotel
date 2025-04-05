const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token is required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

const authorizeEmployee = (req, res, next) => {
    if (!req.user || req.user.role !== 'employee') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Employee privileges required.'
        });
    }
    next();
};

const authorizeCustomer = (req, res, next) => {
    if (!req.user || req.user.role !== 'customer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Customer privileges required.'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeEmployee,
    authorizeCustomer
};
