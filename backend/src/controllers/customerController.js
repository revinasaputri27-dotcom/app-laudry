const { Customer, Order } = require('../models');
exports.getAll = async (req, res) => res.json(await Customer.findAll({ order: [['createdAt', 'DESC']] }));
exports.create = async (req, res) => {
  const { name, phone, address, userId } = req.body;
  if (!name || !phone || !address) return res.status(400).json({ message: 'Nama, telepon, dan alamat wajib diisi' });
  res.status(201).json(await Customer.create({ name, phone, address, userId: userId || null }));
};
exports.update = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
  await customer.update(req.body);
  res.json(customer);
};
exports.remove = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
  if (await Order.count({ where: { customerId: customer.id } })) return res.status(409).json({ message: 'Pelanggan memiliki transaksi dan tidak dapat dihapus' });
  await customer.destroy();
  res.json({ message: 'Pelanggan berhasil dihapus' });
};