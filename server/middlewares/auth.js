const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 12, (err, hash) => {
            if (err) return reject(err);
            resolve(hash);
        });
    });
}

const comparePassword = async (password, hashedPassword) => {
    return  bcrypt.compare(password, hashedPassword);
}

// Middleware to verify JWT token from Authorization header
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        console.log('=== authenticateToken Middleware ===');
        console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
        console.log('Token:', token ? 'Present' : 'Missing');

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error('JWT verification error:', err.message);
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            console.log('JWT verified successfully. User data:', user);
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Authentication error' });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    console.log('=== isAdmin Middleware ===');
    console.log('req.user:', req.user);
    console.log('req.user.role:', req.user?.role);
    
    if (req.user && req.user.role === 'admin') {
        console.log('Admin access granted');
        next();
    } else {
        console.log('Admin access denied - user role:', req.user?.role);
        res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = { hashPassword, comparePassword, authenticateToken, isAdmin };