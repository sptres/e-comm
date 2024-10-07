const jwt = require('jsonwebtoken');

// middleware/authMiddleware.js
module.exports.isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden: Admins only.' });
};
