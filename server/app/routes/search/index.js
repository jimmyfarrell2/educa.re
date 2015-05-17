var router = require('express').Router(),
    Promise = require('bluebird'),
    mongoose = require('mongoose'),
    Document = Promise.promisifyAll(mongoose.model('Document')),
    User = Promise.promisifyAll(mongoose.model('User'));

router.get('/', function(req, res, next) {

    if (req.query.type === 'user') {
        User.find({ $or: [
            { email: new RegExp(req.query.q, 'i') },
            { 'name.first': new RegExp(req.query.q, 'i') },
            { 'name.last': new RegExp(req.query.q, 'i') }
        ]})
            .select('_id name email')
            .execAsync()
            .then(function(users) {
                var filteredUsers = users.filter(function(user) {
                    return user._id.toString() !== req.user._id.toString();
                });
                res.json(filteredUsers);
            })
            .catch(next);
    }

    else if (req.query.type === 'document') {
        console.log('in else if')
        Document.find({ $or: [
            { title: new RegExp(req.query.q, 'i') },
            { currentVersion: new RegExp(req.query.q, 'i') }
        ]})
            .populate('author', 'name').execAsync()
            .then(function(documents) {
                res.json(documents);
            })
            .catch(next);
    }

});

module.exports = router;
