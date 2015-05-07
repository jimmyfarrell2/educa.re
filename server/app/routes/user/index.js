var router = require('express').Router(),
    Promise = require('bluebird'),
    mongoose = require('mongoose'),
    Document = mongoose.model('Document'),
    User = mongoose.model('User');

router.post('/', function(req, res, next){

    User.createAsync(req.body)
       .then(function(user){
           res.json(user);
       })
       .catch(function(err){
           return next(err);
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

    User.findOneAsync(req.params.userId)
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

    User.findByIdAndUpdateAsync({_id: req.params.userId}, req.body)
        .then(function(user){
            res.json(user);
        })
        .catch(function(err){
            return next(err);
        })

});

module.exports = router;