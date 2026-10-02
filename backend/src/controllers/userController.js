const bcrypt = require('bcryptjs');
const { User, Customer } = require('../models');

exports.me = async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
  res.json(user);
};
exports.updateMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const { name, phone, avatar } = req.body;
  if (!name || !phone) return res.status(400).json({ message: 'Nama dan nomor telepon wajib diisi' });
  await user.update({ name, phone, avatar: avatar || null });
  await Customer.update({ name, phone }, { where: { userId: user.id } });
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role });
};
exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Pilih gambar JPG, PNG, atau WEBP' });
  const user = await User.findByPk(req.user.id);
  await user.update({ avatar: `/uploads/${req.file.filename}` });
  res.json({ avatar: user.avatar });
};
exports.updateMyPassword = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const { currentPassword, password } = req.body;
  if (!currentPassword || !password || password.length < 8) return res.status(400).json({ message: 'Kata sandi saat ini dan kata sandi baru minimal 8 karakter wajib diisi' });
  if (!(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ message: 'Kata sandi saat ini tidak cocok' });
  await user.update({ password: await bcrypt.hash(password, 10) });
  res.json({ message: 'Kata sandi berhasil diubah' });
};
exports.getAll = async (req, res) => res.json(await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] }));
exports.create = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || password.length < 8 || !['admin', 'kasir', 'customer'].includes(role)) return res.status(400).json({ message: 'Nama, email, kata sandi minimal 8 karakter, dan peran wajib valid' });
  const user = await User.create({ name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
};
exports.update = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
  const values = {};
  for (const field of ['name', 'email', 'role']) if (req.body[field] !== undefined) values[field] = req.body[field];
  if (values.role && !['admin', 'kasir', 'customer'].includes(values.role)) return res.status(400).json({ message: 'Peran tidak valid' });
  if (req.body.password) {
    if (req.body.password.length < 8) return res.status(400).json({ message: 'Kata sandi minimal 8 karakter' });
    values.password = await bcrypt.hash(req.body.password, 10);
  }
  await user.update(values);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
};
exports.remove = async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) return res.status(400).json({ message: 'Anda tidak dapat menghapus akun sendiri' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
  await user.destroy();
  res.json({ message: 'Pengguna berhasil dihapus' });
};