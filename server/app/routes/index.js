'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/tutorial', require('./tutorial'));

router.use('/members', require('./members'));

router.use('/documents', require('./documents'));

router.use('/collaborate', require('./collaborate'));

router.use('/user', require('./user'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
