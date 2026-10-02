const router = require('express').Router();
const controller = require('../controllers/addressController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const wrap = require('../middleware/asyncHandler');

router.use(auth, role('customer'));
router.get('/', wrap(controller.getAll));
router.post('/', wrap(controller.create));
router.put('/:id', wrap(controller.update));
router.delete('/:id', wrap(controller.remove));
router.patch('/:id/default', wrap(controller.setDefault));
module.exports = router;