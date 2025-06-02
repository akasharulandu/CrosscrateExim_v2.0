import jwt from 'jsonwebtoken';

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user === 'admin') {
      req.user = decoded;
      next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Not admin' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
};