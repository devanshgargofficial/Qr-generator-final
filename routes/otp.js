const router = require('express').Router();
const ctrl   = require('../controllers/otpController');

router.post('/request', ctrl.request);
router.post('/verify',  ctrl.verify);

module.exports = router;
