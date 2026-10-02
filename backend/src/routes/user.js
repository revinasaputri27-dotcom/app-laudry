const router = require('express').Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const wrap = require('../middleware/asyncHandler');
const upload = require('../middleware/upload');

router.get('/me', auth, wrap(controller.me));
router.put('/me', auth, wrap(controller.updateMe));
router.put('/me/password', auth, wrap(controller.updateMyPassword));
router.post('/me/avatar', auth, upload.single('avatar'), wrap(controller.uploadAvatar));
router.use(auth, role('admin'));
router.get('/', wrap(controller.getAll));
router.post('/', wrap(controller.create));
router.put('/:id', wrap(controller.update));
router.delete('/:id', wrap(controller.remove));
module.exports = router;