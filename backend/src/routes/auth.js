const router = require('express').Router();
const c = require('../controllers/authController');
const auth = require('../middleware/auth');
const wrap = require('../middleware/asyncHandler');
router.post('/register', wrap(c.register));
router.post('/login', wrap(c.login));
router.get('/me', auth, wrap(c.me));
module.exports = router;