const { Order, Customer, Package, Payment } = require('../models');

exports.stats = async (req, res) => {
  const [totalOrder, totalPelanggan, totalPaket, pendapatan] = await Promise.all([
    Order.count(), Customer.count(), Package.count(),
    Order.sum('finalTotal', { where: { status: 'delivered' } })
  ]);
  const orderTerbaru = await Order.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ model: Customer, as: 'customer', attributes: ['id', 'name'] }, { model: Package, as: 'package', attributes: ['id', 'name'] }]
  });
  res.json({
    totalOrder,
    totalPelanggan,
    totalPaket,
    totalPendapatan: Number(pendapatan || 0),
    orderTerbaru: orderTerbaru.map((order) => ({ ...order.toJSON(), total: order.finalTotal }))
  });
};

exports.customerStats = async (req, res) => {
  const customer = await Customer.findOne({ where: { userId: req.user.id } });
  if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
  const [totalPesanan, sedangDiproses, selesai, totalBelanja] = await Promise.all([
    Order.count({ where: { customerId: customer.id } }),
    Order.count({ where: { customerId: customer.id, status: ['confirmed', 'picked_up', 'washing', 'ironing', 'ready'] } }),
    Order.count({ where: { customerId: customer.id, status: 'delivered' } }),
    Order.sum('finalTotal', { where: { customerId: customer.id, paymentStatus: 'paid' } })
  ]);
  const pesananAktif = await Order.findAll({
    where: { customerId: customer.id, status: ['pending', 'confirmed', 'picked_up', 'washing', 'ironing', 'ready'] },
    order: [['createdAt', 'DESC']],
    include: [
      { model: Package, as: 'package' },
      { model: Payment, as: 'payments', attributes: ['id', 'status', 'method', 'amount'] }
    ]
  });
  res.json({ totalPesanan, sedangDiproses, selesai, totalBelanja: Number(totalBelanja || 0), pesananAktif });
};

exports.myOrders = async (req, res) => {
  const customer = await Customer.findOne({ where: { userId: req.user.id } });
  if (!customer) return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
  const orders = await Order.findAll({
    where: { customerId: customer.id },
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ model: Package, as: 'package' }]
  });
  res.json(orders);
};