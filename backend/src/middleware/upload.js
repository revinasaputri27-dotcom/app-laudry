const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

module.exports = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => callback(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      const error = new Error('Bukti pembayaran harus berupa JPG, PNG, atau WEBP');
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  }
});