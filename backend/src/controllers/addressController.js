const { Customer, CustomerAddress, Order } = require('../models');

async function getCustomer(userId) {
  return Customer.findOne({ where: { userId } });
}

exports.getAll = async (req, res) => {
  const customer = await getCustomer(req.user.id);
  if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
  res.json(await CustomerAddress.findAll({ where: { customerId: customer.id }, order: [['isDefault', 'DESC'], ['createdAt', 'DESC']] }));
};

exports.create = async (req, res) => {
  const customer = await getCustomer(req.user.id);
  const { label, address, city, postalCode, notes, isDefault } = req.body;
  if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
  if (!label || !address || !city || !postalCode) return res.status(400).json({ message: 'Label, alamat, kota, dan kode pos wajib diisi' });
  const count = await CustomerAddress.count({ where: { customerId: customer.id } });
  const transaction = await CustomerAddress.sequelize.transaction();
  try {
    if (isDefault || count === 0) await CustomerAddress.update({ isDefault: false }, { where: { customerId: customer.id }, transaction });
    const item = await CustomerAddress.create({ customerId: customer.id, label, address, city, postalCode, notes: notes || null, isDefault: isDefault || count === 0 }, { transaction });
    await transaction.commit();
    res.status(201).json(item);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.update = async (req, res) => {
  const customer = await getCustomer(req.user.id);
  const item = await CustomerAddress.findOne({ where: { id: req.params.id, customerId: customer?.id } });
  if (!item) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
  const { label, address, city, postalCode, notes, isDefault } = req.body;
  if (!label || !address || !city || !postalCode) return res.status(400).json({ message: 'Label, alamat, kota, dan kode pos wajib diisi' });
  const transaction = await CustomerAddress.sequelize.transaction();
  try {
    if (isDefault) await CustomerAddress.update({ isDefault: false }, { where: { customerId: customer.id }, transaction });
    await item.update({ label, address, city, postalCode, notes: notes || null, isDefault: Boolean(isDefault) }, { transaction });
    await transaction.commit();
    res.json(item);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.setDefault = async (req, res) => {
  const customer = await getCustomer(req.user.id);
  const item = await CustomerAddress.findOne({ where: { id: req.params.id, customerId: customer?.id } });
  if (!item) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
  const transaction = await CustomerAddress.sequelize.transaction();
  try {
    await CustomerAddress.update({ isDefault: false }, { where: { customerId: customer.id }, transaction });
    await item.update({ isDefault: true }, { transaction });
    await transaction.commit();
    res.json(item);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.remove = async (req, res) => {
  const customer = await getCustomer(req.user.id);
  const item = await CustomerAddress.findOne({ where: { id: req.params.id, customerId: customer?.id } });
  if (!item) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
  if (await Order.count({ where: { addressId: item.id } })) return res.status(409).json({ message: 'Alamat ini dipakai pada riwayat pesanan dan tidak dapat dihapus' });
  const wasDefault = item.isDefault;
  await item.destroy();
  if (wasDefault) {
    const next = await CustomerAddress.findOne({ where: { customerId: customer.id }, order: [['createdAt', 'ASC']] });
    if (next) await next.update({ isDefault: true });
  }
  res.json({ message: 'Alamat berhasil dihapus' });
};