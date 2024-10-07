const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Some fields are missing' });
    }

    // validate username
    if (
      username.length < 3 ||
      username.length > 30 ||
      !/^[a-zA-Z0-9]+$/.test(username)
    ) {
      return res.status(400).json({
        error: 'Username must be 3-30 characters with no special characters.',
      });
    }

    // validate email
    if (
      email.length < 5 ||
      email.length > 50 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // validate password matching, then further validate password strength
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (
      password.length < 8 ||
      password.length > 100 ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(password)
    ) {
      return res.status(400).json({
        error:
          'Password must be 8-100 characters and contain uppercase, lowercase, number, and special character.',
      });
    }

    // check if user already exists by checking duplicate email or username
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // now we can hash the password, then create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Handle the error appropriately
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

// allow user to log in with either username or email
exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Some fields are missing' });
    }

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

// logout user
exports.logout = (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.session = async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Fetch user to get isAdmin status
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.json({ isAuthenticated: false });
    }
    res.json({
      isAuthenticated: true,
      userId: decoded.userId,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.json({ isAuthenticated: false });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favorites');
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching favorites' });
  }
};
