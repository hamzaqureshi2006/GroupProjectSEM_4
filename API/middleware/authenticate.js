const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Get token from HttpOnly cookie
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
    console.error('No token provided in request');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
    console.error('Invalid or expired token:', err.message);
  }
};

module.exports = authenticate;

