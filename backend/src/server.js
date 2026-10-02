const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => app.listen(PORT, () => console.log(`Server Laundry Revina berjalan di http://localhost:${PORT}`)))
  .catch((error) => {
    console.error('Koneksi database gagal:', error.message);
    process.exitCode = 1;
  });