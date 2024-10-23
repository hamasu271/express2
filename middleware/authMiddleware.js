// middleware/authMiddleware.js
module.exports = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === 'your-secret-api-key') {
    next();
  } else {
    res.status(401).json({ error: '인증이 필요합니다.' });
  }
};
