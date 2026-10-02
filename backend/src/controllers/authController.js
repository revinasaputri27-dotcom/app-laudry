const { User, Customer, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
  let transaction;
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || password.length < 8 || !phone) {
      return res.status(400).json({ message: 'Nama, email, nomor telepon, dan kata sandi minimal 8 karakter wajib diisi' });
    }
    const hash = await bcrypt.hash(password, 10);
    transaction = await sequelize.transaction();
    const user = await User.create({ name, email: email.toLowerCase(), password: hash, role: 'customer', phone }, { transaction });
    await Customer.create({ userId: user.id, name, phone, address: '' }, { transaction });
    await transaction.commit();
    res.status(201).json({ message: 'Pendaftaran berhasil', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    if (transaction) await transaction.rollback();
    res.status(e.name === 'SequelizeUniqueConstraintError' ? 409 : 400).json({ message: e.name === 'SequelizeUniqueConstraintError' ? 'Email sudah terdaftar' : e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email atau kata sandi salah' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Email atau kata sandi salah' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );
    res.json({ message: 'Login berhasil', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.me = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Customer, as: 'customer', include: [{ association: 'addresses' }] }]
  });
  if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
  res.json(user);
};