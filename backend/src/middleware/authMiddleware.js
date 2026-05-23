const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Токен истёк' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ error: 'Недействительный токен' });
    next(err);
  }
};

const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    }
  } catch (_) {}
  next();
};

module.exports = { authenticate, optionalAuthenticate };