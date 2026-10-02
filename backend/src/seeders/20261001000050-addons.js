'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const items = [
      { name: 'Setrika Extra', description: 'Setrika tambahan untuk seluruh cucian.', price: 3000, unit: 'kg' },
      { name: 'Parfum Premium', description: 'Pilih aroma parfum premium.', price: 5000, unit: 'pesanan' },
      { name: 'Cuci Bersih Noda', description: 'Perawatan khusus untuk noda membandel.', price: 8000, unit: 'pesanan' },
      { name: 'Express Handling', description: 'Prioritas antrean pengerjaan.', price: 10000, unit: 'pesanan' },
      { name: 'Antar Jemput', description: 'Penjemputan dan pengantaran, gratis untuk total minimal Rp 50.000.', price: 5000, unit: 'pesanan' }
    ];
    for (const item of items) {
      const [existing] = await queryInterface.sequelize.query('SELECT id FROM AddOns WHERE name = :name LIMIT 1', { replacements: { name: item.name } });
      if (existing.length) await queryInterface.bulkUpdate('AddOns', { ...item, isActive: true, updatedAt: now }, { name: item.name });
      else await queryInterface.bulkInsert('AddOns', [{ ...item, isActive: true, createdAt: now, updatedAt: now }]);
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('AddOns', { name: ['Setrika Extra', 'Parfum Premium', 'Cuci Bersih Noda', 'Express Handling', 'Antar Jemput'] });
  }
};