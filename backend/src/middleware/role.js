module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melakukan tindakan ini' });
  }
  next();
};
module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) 
    return res.status(403).json({ message: 'Akses ditolak' });
  next();
};