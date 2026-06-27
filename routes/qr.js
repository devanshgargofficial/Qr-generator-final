const router = require('express').Router();
const ctrl = require('../controllers/qrController');

router.get('/qr-records', ctrl.getAllRecords);
router.get('/qr-records/:clubId', ctrl.getRecordByClub);
router.post('/generate', ctrl.generate);
router.post('/generate-all', ctrl.generateAll);
router.delete('/qr-records/:clubId', ctrl.deleteRecord);
router.post('/qr/generate', ctrl.generateQR);

module.exports = router;



