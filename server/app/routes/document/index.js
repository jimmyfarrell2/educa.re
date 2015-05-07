var router = require('express').Router(),
    Promise = require('bluebird'),
    mkdirp = Promise.promisify(require('mkdirp')),
    git = Promise.promisifyAll(require('gift')),
    fs = Promise.promisifyAll(require('fs')),
    path = require('path'),
    mongoose = require('mongoose'),
    Document = Promise.promisifyAll(mongoose.model('Document')),
    User = Promise.promisifyAll(mongoose.model('User'));

//set a repo for the user
router.use('/', function(req, res, next){
    req.userPath = path.join(__dirname, '/../../../../documents/' + req.user._id);
    req.docPath = path.join(req.userPath, '/' + req.body.document.title);
    req.repo = Promise.promisifyAll(git(req.docPath));
    next();
});


//create client's first folder
router.post('/', function(req, res, next){

    var currentVersion = '';
    mkdirp(req.userPath)
        .then(function(){
            mkdirp(req.docPath);
        })
        .then(function(){
            return fs.writeFileAsync(req.docPath + '/contents.md', 'welcome');
        })
        .then(function(_currentVersion){
            currentVersion = _currentVersion;
            return git.initAsync(req.docPath);
        })
        .then(function(){
            req.body.document.currentVersion = currentVersion;
            return Document.createAsync(req.body.document);
        })
        .then(function(doc){
            return User.findByIdAndUpdateAsync(req.user._id, {$push: {'documents': doc._id}});
        })
        .then(function(){
            res.send(200);
        })
        .catch(function(err){
            return next(err);
        });

});

//update a user's file and commit
router.put('/', function(req, res, next){

    fs.writeFileAsync(req.docPath + '/contents.md', 'again again!')
        .then(function(){
            return req.repo.addAsync('contents.md');
        })
        .then(function(){
            return req.repo.commitAsync(req.body.message);
        })
        .then(function(){
            return req.repo.commitsAsync();
        })
        .then(function(commits){
            res.json(commits);
        })
        .catch(function(err){
            return next(err);
        });


});


module.exports = router;