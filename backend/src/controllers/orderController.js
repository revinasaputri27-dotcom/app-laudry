const { Op } = require('sequelize');
const {
  Order, Customer, CustomerAddress, Package, Payment, AddOn,
  OrderItem, OrderStatusHistory, sequelize
} = require('../models');
const statuses = ['pending', 'confirmed', 'picked_up', 'washing', 'ironing', 'ready', 'delivered', 'cancelled'];
const orderIncludes = [
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] },
  { model: Package, as: 'package' },
  { model: CustomerAddress, as: 'address' },
  { model: OrderItem, as: 'items' },
  { model: Payment, as: 'payments' },
  { model: OrderStatusHistory, as: 'statusHistory', order: [['createdAt', 'ASC']] }
];

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

async function createOrderCode(transaction) {
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `LRV-${dateCode}-`;
  const lastOrder = await Order.findOne({
    where: { orderCode: { [Op.like]: `${prefix}%` } },
    order: [['id', 'DESC']],
    transaction
  });
  const sequence = Number(lastOrder?.orderCode.split('-').at(-1) || 0) + 1;
  return `${prefix}${String(sequence).padStart(3, '0')}`;
}

exports.createCustomer = async (req, res) => {
  const customer = await Customer.findOne({ where: { userId: req.user.id } });
  const item = await Package.findOne({ where: { id: req.body.packageId, isActive: true } });
  const address = await CustomerAddress.findOne({ where: { id: req.body.addressId, customerId: customer?.id } });
  const weight = Number(req.body.weight);
  const pickupMethod = req.body.pickupMethod;
  const pickupSchedule = new Date(req.body.pickupSchedule);
  if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
  if (!item || !address) return res.status(400).json({ message: 'Paket aktif dan alamat milik Anda wajib dipilih' });
  if (!Number.isFinite(weight) || weight < Number(item.minWeight)) return res.status(400).json({ message: `Berat minimal paket ini ${item.minWeight} ${item.unit}` });
  if (!['pickup', 'delivery'].includes(pickupMethod)) return res.status(400).json({ message: 'Metode antar-jemput tidak valid' });
  if (Number.isNaN(pickupSchedule.getTime()) || pickupSchedule.getTime() < Date.now()) return res.status(400).json({ message: 'Jadwal penjemputan harus berupa waktu mendatang' });

  const selectedAddOns = Array.isArray(req.body.addOns) ? req.body.addOns : [];
  const addOnIds = selectedAddOns.map((entry) => Number(entry.id)).filter(Number.isInteger);
  const availableAddOns = addOnIds.length ? await AddOn.findAll({ where: { id: addOnIds, isActive: true } }) : [];
  if (availableAddOns.length !== new Set(addOnIds).size) return res.status(400).json({ message: 'Layanan tambahan tidak valid' });
  const addOnItems = availableAddOns.map((addOn) => {
    const request = selectedAddOns.find((entry) => Number(entry.id) === addOn.id);
    const qty = addOn.unit === 'kg' ? weight : Math.max(1, Number(request?.qty || 1));
    return { name: addOn.name, qty, price: roundMoney(Number(addOn.price) * qty) };
  });
  const basePrice = roundMoney(Number(item.pricePerKg) * weight);
  const addOnTotal = roundMoney(addOnItems.reduce((sum, entry) => sum + entry.price, 0));
  const subtotal = roundMoney(basePrice + addOnTotal);
  const isFirstOrder = (await Order.count({ where: { customerId: customer.id } })) === 0;
  const discount = isFirstOrder ? roundMoney(subtotal * 0.2) : 0;
  const deliveryFee = pickupMethod === 'pickup' && subtotal - discount < 50000 ? 5000 : 0;
  const finalTotal = Math.max(0, roundMoney(subtotal - discount + deliveryFee));
  const estimatedHours = Number(item.estimasiJam || 0) || Number(item.estimasiHari) * 24;
  const estimatedDone = new Date(pickupSchedule.getTime() + estimatedHours * 60 * 60 * 1000);
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.create({
      orderCode: await createOrderCode(transaction),
      customerId: customer.id,
      packageId: item.id,
      addressId: address.id,
      weight,
      total: subtotal,
      discount,
      finalTotal,
      pickupMethod,
      deliveryFee,
      paymentStatus: 'pending',
      pickupSchedule,
      estimatedDone,
      note: req.body.note || null
    }, { transaction });
    const rows = [
      { orderId: order.id, name: item.name, qty: weight, price: basePrice, createdAt: new Date(), updatedAt: new Date() },
      ...addOnItems.map((entry) => ({ ...entry, orderId: order.id, createdAt: new Date(), updatedAt: new Date() }))
    ];
    await OrderItem.bulkCreate(rows, { transaction });
    await OrderStatusHistory.create({ orderId: order.id, status: 'pending', note: 'Pesanan berhasil dibuat', updatedBy: req.user.id }, { transaction });
    await transaction.commit();
    const saved = await Order.findByPk(order.id, { include: orderIncludes });
    res.status(201).json({ message: 'Pesanan berhasil dibuat', orderCode: saved.orderCode, id: saved.id, total: saved.finalTotal, estimasiSelesai: saved.estimatedDone, order: saved });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getMyOrders = async (req, res) => {
  const customer = await Customer.findOne({ where: { userId: req.user.id } });
  if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
  const orders = await Order.findAll({ where: { customerId: customer.id }, include: orderIncludes, order: [['createdAt', 'DESC']] });
  res.json(orders);
};

exports.getMyOrder = async (req, res) => {
  const customer = await Customer.findOne({ where: { userId: req.user.id } });
  const order = await Order.findOne({ where: { id: req.params.id, customerId: customer?.id }, include: orderIncludes });
  if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  res.json(order);
};

exports.cancelMyOrder = async (req, res) => {
  const customer = await Customer.findOne({ where: { userId: req.user.id } });
  const order = await Order.findOne({ where: { id: req.params.id, customerId: customer?.id } });
  if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  if (order.status !== 'pending') return res.status(400).json({ message: 'Pesanan hanya dapat dibatalkan sebelum dikonfirmasi' });
  await order.update({ status: 'cancelled' });
  await OrderStatusHistory.create({ orderId: order.id, status: 'cancelled', note: 'Dibatalkan oleh pelanggan', updatedBy: req.user.id });
  res.json({ message: 'Pesanan berhasil dibatalkan', order });
};

exports.track = async (req, res) => {
  const identifier = req.params.code;
  const where = /^\d+$/.test(identifier) ? { [Op.or]: [{ orderCode: identifier }, { id: Number(identifier) }] } : { orderCode: identifier.toUpperCase() };
  const order = await Order.findOne({
    where,
    attributes: ['id', 'orderCode', 'weight', 'total', 'discount', 'finalTotal', 'pickupMethod', 'deliveryFee', 'status', 'paymentStatus', 'estimatedDone', 'createdAt'],
    include: [
      { model: Customer, as: 'customer', attributes: ['name'] },
      { model: Package, as: 'package', attributes: ['name', 'unit', 'estimasiHari', 'estimasiJam'] },
      { model: OrderStatusHistory, as: 'statusHistory', attributes: ['status', 'note', 'createdAt'], order: [['createdAt', 'ASC']] }
    ]
  });
  if (!order) return res.status(404).json({ message: 'Kode pesanan tidak ditemukan' });
  res.json(order);
};

exports.create = async (req, res) => {
  const customer = await Customer.findByPk(req.body.customerId);
  const item = await Package.findByPk(req.body.packageId);
  const weight = Number(req.body.weight);
  if (!customer || !item) return res.status(404).json({ message: 'Pelanggan atau paket tidak ditemukan' });
  if (!Number.isFinite(weight) || weight <= 0) return res.status(400).json({ message: 'Berat harus lebih dari 0 kg' });
  const total = roundMoney(Number(item.pricePerKg) * weight);
  const code = await createOrderCode();
  const order = await Order.create({ orderCode: code, customerId: customer.id, packageId: item.id, weight, total, finalTotal: total, note: req.body.note || null });
  await OrderStatusHistory.create({ orderId: order.id, status: 'pending', note: 'Pesanan dibuat staf', updatedBy: req.user.id });
  res.status(201).json({ message: 'Transaksi berhasil dibuat', order: await Order.findByPk(order.id, { include: orderIncludes }) });
};

exports.getAll = async (req, res) => {
  const orders = await Order.findAll({ include: orderIncludes, order: [['createdAt', 'DESC']] });
  res.json(orders.map((order) => ({ ...order.toJSON(), total: order.finalTotal })));
};
exports.updateStatus = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
  if (!statuses.includes(req.body.status)) return res.status(400).json({ message: 'Status transaksi tidak valid' });
  await order.update({ status: req.body.status });
  await OrderStatusHistory.create({ orderId: order.id, status: req.body.status, note: req.body.note || null, updatedBy: req.user.id });
  res.json({ message: 'Status transaksi diperbarui', order });
};
exports.update = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
  const customer = await Customer.findByPk(req.body.customerId || order.customerId);
  const item = await Package.findByPk(req.body.packageId || order.packageId);
  const weight = Number(req.body.weight || order.weight);
  if (!customer || !item || !Number.isFinite(weight) || weight <= 0) return res.status(400).json({ message: 'Data transaksi tidak valid' });
  const total = roundMoney(Number(item.pricePerKg) * weight);
  await order.update({ customerId: customer.id, packageId: item.id, weight, total, finalTotal: total, note: req.body.note ?? order.note });
  res.json({ message: 'Transaksi diperbarui', order: await Order.findByPk(order.id, { include: orderIncludes }) });
};
exports.remove = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
  await Payment.destroy({ where: { orderId: order.id } });
  await order.destroy();
  res.json({ message: 'Transaksi berhasil dihapus' });
};