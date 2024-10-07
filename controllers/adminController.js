const User = require('../models/User');

exports.getAdminPage = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('favorites');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};
