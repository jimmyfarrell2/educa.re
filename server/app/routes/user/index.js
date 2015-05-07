var router = require('express').Router(),
    Promise = require('bluebird'),
    mongoose = require('mongoose');
    Document = Promise.promisifyAll(mongoose.model('Document'));
    User = Promise.promisifyAll(mongoose.model('User'));

router.post('/', function(req, res, next){

    User.create(req.body.user)
       .then(function(user){
           res.json(user);
       })
       .catch(function(err){
           return next(err);
       });

});

//??
router.get('/', function(req, res, next){

    User.find()
        .populate('documents')
        .exec()
        .then(function(suc){
            res.send(suc);
        })
        .catch(function(err){
           return next(err);
        });

});

router.get('/:userId', function(req, res, next){

    User.findOne(req.params.userId)
        .then(function(user){
            res.json(user);
        })
        .catch(function(err){
            return next(err);
        });

});


router.use('/:userId', function(req, res, next){
    if(req.user._id == req.params.userId) next();
    else next(new Error("You are not allowed."));
});

router.put('/:userId', function(req, res, next){

    User.findByIdAndUpdate({_id: req.params.userId}, req.body)
        .then(function(user){
            res.json(user);
        })
        .catch(function(err){
            return next(err);
        })

});

