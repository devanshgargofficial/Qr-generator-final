const router = require('express').Router();
const ctrl   = require('../controllers/clubController');

router.get('/',          ctrl.getAllClubs);
router.get('/:clubCode', ctrl.getClubByCode);

module.exports = router;
