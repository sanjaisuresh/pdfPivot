const asyncHandler = require('express-async-handler');

// Middleware to check if user is an admin
const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
});

module.exports = admin; 