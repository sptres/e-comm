const jwt = require('jsonwebtoken');
const User = require('../models/User');

// check if user is authenticated
module.exports.isAuthenticated = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// check if user is admin
exports.isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    console.error('Error in isAdmin middleware:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
