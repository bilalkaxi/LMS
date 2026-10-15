const jwt = require('jsonwebtoken');

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

module.exports = optionalAuth;
