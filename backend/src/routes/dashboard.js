const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const wrap = require('../middleware/asyncHandler');

router.get('/stats', auth, role('admin', 'kasir'), wrap(controller.stats));
router.get('/customer-stats', auth, role('customer'), wrap(controller.customerStats));
router.get('/my-orders', auth, role('customer'), wrap(controller.myOrders));
module.exports = router;