// middleware/authMiddleware.js
module.exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Please log in.' });
};

module.exports.isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden: Admins only.' });
};
