var router = require('express').Router(),
    Promise = require('bluebird'),
    mongoose = require('mongoose'),
    Document = Promise.promisifyAll(mongoose.model('Document')),
    User = Promise.promisifyAll(mongoose.model('User'));

router.get('/', function(req, res, next) {

    if (req.query.type === 'user') {
        User.find({ $or: [
            { email: new RegExp(req.query.q, 'i') },
            { username: new RegExp(req.query.q, 'i') },
            { 'name.first': new RegExp(req.query.q, 'i') },
            { 'name.last': new RegExp(req.query.q, 'i') }
        ]})
        .select('_id username')
        .execAsync()
            .then(function(users) {
                var filteredUsers = users.filter(function(user) {
                    return user._id.toString() !== req.user._id.toString();
                });
                res.json(filteredUsers);
            })
            .catch(next);
    }

    else if (req.query.type === 'all') {

        var results = [];

        User.find({ $or: [
            { email: new RegExp(req.query.q, 'i') },
            { username: new RegExp(req.query.q, 'i') },
            { 'name.first': new RegExp(req.query.q, 'i') },
            { 'name.last': new RegExp(req.query.q, 'i') }
        ]})
        .select('_id username')
        .execAsync()
            .then(function(users) {
                results = results.concat(users);
                return Document.find({ $or: [
                    { title: new RegExp(req.query.q, 'i') },
                    { currentVersion: new RegExp(req.query.q, 'i') }
                ]})
                .populate('author', 'username')
                .execAsync();
            })
            .then(function(documents) {
                results = results.concat(documents);
                res.json(results);
            })
            .catch(next);
    }

});

module.exports = router;
