const router = require('express').Router();
const ctrl   = require('../controllers/outletController');

router.get('/',          ctrl.getAllOutlets);
router.post('/qr-token', ctrl.createQRToken);
router.get('/resolve',   ctrl.resolveToken);

module.exports = router;
