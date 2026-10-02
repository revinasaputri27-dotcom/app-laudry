const { Op } = require('sequelize');
const { Payment, Order, Customer, Package, OrderStatusHistory } = require('../models');
const orderIncludes = [{ model: Customer, as: 'customer' }, { model: Package, as: 'package' }];

async function findOwnedPayment(req, paymentId) {
  const where = { id: paymentId };
  if (req.user.role === 'customer') {
    const customer = await Customer.findOne({ where: { userId: req.user.id } });
    if (!customer) return null;
    where.orderId = { [Op.in]: (await Order.findAll({ attributes: ['id'], where: { customerId: customer.id } })).map((row) => row.id) };
  }
  return Payment.findOne({ where, include: [{ model: Order, as: 'order' }] });
}

exports.getAll = async (req, res) => {
  const where = {};
  if (req.user.role === 'customer') {
    const customer = await Customer.findOne({ where: { userId: req.user.id } });
    if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
    const orders = await Order.findAll({ attributes: ['id'], where: { customerId: customer.id } });
    where.orderId = { [Op.in]: orders.map((item) => item.id) };
  }
  const payments = await Payment.findAll({ where, include: [{ model: Order, as: 'order', include: orderIncludes }], order: [['createdAt', 'DESC']] });
  res.json(payments);
};

exports.create = async (req, res) => {
  const { orderId, amount, method } = req.body;
  const order = await Order.findByPk(orderId, { include: [{ model: Payment, as: 'payments' }] });
  if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  if (order.status === 'cancelled') return res.status(400).json({ message: 'Pesanan yang dibatalkan tidak dapat dibayar' });
  if (req.user.role === 'customer') {
    const customer = await Customer.findOne({ where: { userId: req.user.id } });
    if (!customer || order.customerId !== customer.id) return res.status(403).json({ message: 'Pesanan ini bukan milik akun Anda' });
  }
  const paidAmount = Number(amount);
  if (!Number.isFinite(paidAmount) || paidAmount <= 0) return res.status(400).json({ message: 'Jumlah pembayaran harus lebih dari 0' });
  if (!['cash', 'transfer', 'qris', 'ewallet'].includes(method)) return res.status(400).json({ message: 'Metode pembayaran tidak valid' });
  const alreadyPaid = order.payments.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0);
  if (paidAmount > Number(order.finalTotal) - alreadyPaid) return res.status(400).json({ message: 'Jumlah pembayaran melebihi sisa tagihan' });
  const payment = await Payment.create({ orderId, amount: paidAmount, method, status: 'pending' });
  res.status(201).json({ message: 'Pembayaran tercatat dan menunggu verifikasi', payment });
};

exports.myPayments = async (req, res) => {
  const customer = await Customer.findOne({ where: { userId: req.user.id } });
  if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
  const orders = await Order.findAll({ attributes: ['id'], where: { customerId: customer.id } });
  const payments = await Payment.findAll({ where: { orderId: { [Op.in]: orders.map((item) => item.id) } }, include: [{ model: Order, as: 'order' }], order: [['createdAt', 'DESC']] });
  res.json(payments);
};

exports.uploadProof = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Pilih gambar bukti pembayaran JPG, PNG, atau WEBP' });
  const payment = await findOwnedPayment(req, req.params.id);
  if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
  if (payment.status !== 'pending' || payment.method !== 'transfer') return res.status(400).json({ message: 'Bukti hanya dapat diunggah untuk transfer yang menunggu verifikasi' });
  await payment.update({ proof: `/uploads/${req.file.filename}` });
  res.json({ message: 'Bukti pembayaran berhasil dikirim', payment });
};

exports.updateStatus = async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, { include: [{ model: Order, as: 'order' }] });
  if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
  if (!['paid', 'failed', 'refunded'].includes(req.body.status)) return res.status(400).json({ message: 'Status pembayaran tidak valid' });
  await payment.update({ status: req.body.status, paidAt: req.body.status === 'paid' ? new Date() : null });
  const allPayments = await Payment.findAll({ where: { orderId: payment.orderId } });
  const totalPaid = allPayments.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0);
  const isPaid = totalPaid >= Number(payment.order.finalTotal);
  await payment.order.update({ paymentStatus: isPaid ? 'paid' : req.body.status === 'refunded' ? 'refunded' : req.body.status === 'failed' ? 'failed' : 'pending' });
  if (isPaid && payment.order.status === 'pending') {
    await payment.order.update({ status: 'confirmed' });
    await OrderStatusHistory.create({ orderId: payment.orderId, status: 'confirmed', note: 'Pembayaran terverifikasi', updatedBy: req.user.id });
  }
  res.json({ message: 'Status pembayaran diperbarui', payment });
};