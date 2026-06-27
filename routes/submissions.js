const router = require('express').Router();
const ctrl   = require('../controllers/submissionController');

router.post('/', ctrl.create);

module.exports = router;
