const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({
            message: 'Unauthorized, JWT token is required'
        });
    }

    try {
        // Expect: "Bearer <token>"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(403).json({
                message: 'Unauthorized, token format invalid'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            message: 'Unauthorized, JWT token wrong or expired'
        });
    }
};

module.exports = ensureAuthenticated;
