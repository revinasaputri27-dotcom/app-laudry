const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'API Laundry Revina aktif 🚀' });
});

// Daftarkan seluruh rute API.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/packages', require('./routes/package'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/customers', require('./routes/customer'));
app.use('/api/addresses', require('./routes/address'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan' }));

// Seragamkan format kesalahan API.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.name === 'SequelizeValidationError' || err.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
  res.status(status).json({ message: status === 500 ? 'Terjadi kesalahan pada server' : err.message });
});

module.exports = app;