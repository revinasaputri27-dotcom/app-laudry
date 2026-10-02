const { Package, Order, AddOn } = require('../models');
exports.getAll = async (req, res) => res.json(await Package.findAll({ where: { isActive: true }, order: [['category', 'ASC'], ['pricePerKg', 'ASC']] }));
exports.getById = async (req, res) => {
  const item = await Package.findOne({ where: { id: req.params.id, isActive: true } });
  if (!item) return res.status(404).json({ message: 'Paket tidak ditemukan' });
  res.json(item);
};
exports.getAddOns = async (req, res) => res.json(await AddOn.findAll({ where: { isActive: true }, order: [['id', 'ASC']] }));
exports.create = async (req, res) => {
  const { name, pricePerKg, estimasiHari, description } = req.body;
  if (!name || Number(pricePerKg) <= 0 || Number(estimasiHari) < 1 || !description) return res.status(400).json({ message: 'Nama, harga, estimasi, dan deskripsi paket wajib valid' });
  res.status(201).json(await Package.create({ name, pricePerKg, estimasiHari, description }));
};
exports.update = async (req, res) => {
  const item = await Package.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Paket tidak ditemukan' });
  await item.update(req.body);
  res.json(item);
};
exports.remove = async (req, res) => {
  const item = await Package.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Paket tidak ditemukan' });
  if (await Order.count({ where: { packageId: item.id } })) return res.status(409).json({ message: 'Paket sudah digunakan pada transaksi dan tidak dapat dihapus' });
  await item.destroy();
  res.json({ message: 'Paket berhasil dihapus' });
};