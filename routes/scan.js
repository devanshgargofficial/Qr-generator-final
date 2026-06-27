const router = require('express').Router();
const ctrl   = require('../controllers/qrController');

router.get('/:clubId', ctrl.scanRedirect);

module.exports = router;
