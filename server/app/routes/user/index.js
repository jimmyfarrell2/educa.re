var router = require('express').Router(),
    Promise = require('bluebird'),
    mongoose = require('mongoose'),
    Document = mongoose.model('Document'),
    User = mongoose.model('User'),
    _ = require("lodash"),
    path = require('path'),
    mkdirp = require('mkdirp');

router.post('/', function(req, res, next){

    var newUser = req.body;
    var user = null;

    if (newUser.password !== newUser.passwordConfirm) {
        var error = new Error('Passwords do not match');
        error.status = 401;
        return next(error);
    }

    delete newUser.passwordConfirm;

    User.create(newUser, function(err, user){
        if(err) return next(err);
        req.logIn(user, function(err){
            if(err) return next(err);
            mkdirp(path.join(__dirname, '/../../../../documents/' + user._id), function(err) {
                if(err) return next(err);
                res.status(200).send({ user: _.omit(user.toJSON(), ['password', 'salt']) });
            });
        });
    });

});

router.get('/', function(req, res, next){

    User.find()
        .populate('documents')
        .exec()
        .then(function(suc){
            res.send(suc);
        });

});

router.get('/:userId', function(req, res, next){

    User.findOneAsync({_id: req.params.userId})
        .then(function(user){
            res.json(user);
        })
        .catch(function(err){
            return next(err);
        });

});

// Get all documents for a user
router.get('/:userId/documents', function(req, res, next){

   Document.findAsync({author: req.params.userId})
       .then(function(docs){
           res.json(docs);
       })
       .catch(next);

});

router.use('/:userId', function(req, res, next){

    if (req.user._id.toString() === req.params.userId) next();
    else next(new Error("You are not allowed."));

});

router.put('/:userId', function(req, res, next){

    User.findByIdAndUpdateAsync({_id: req.params.userId}, req.body)
        .then(function(user){
            res.json(user);
        })
        .catch(function(err){
            return next(err);
        });

});

module.exports = router;
