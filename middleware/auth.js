const jwt = require('jsonwebtoken');

// middleware/authMiddleware.js
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

module.exports.isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden: Admins only.' });
};
