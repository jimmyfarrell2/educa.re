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
    req.repo = Promise.promisifyAll(git(req.docPath));
    next();
});


//create client's first folder
router.post('/', function(req, res, next){

    mkdirp(req.userPath)
        .then(function() {
            return createRepo(req);
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

//clone a repo into another user's account and commit
router.post('/clone', function(req, res, next) {

    req.body.document.author = req.user._id;
    req.body.document.readAccess = [];
    req.body.document.editAccess = [];
    req.body.pathToRepo = '';
    var doc;
    Document.createAsync(req.body.document)
        .then(function(_doc) {
            doc = _doc;
            doc.pathToRepo = path(req.userPath, '/' + doc._id);
            return doc.saveAsync();
        })
        .then(function() {
            return git.cloneAsync(req.body.document.pathToRepo, doc.pathToRepo);
        })
        .then(function() {
            res.sendStatus(200);
        })
        .catch(function(err) {
            return next(err);
        });

});

function createRepo(request) {

    var doc;
    var docPath = '';

    return Document.createAsync(request.body.document)
        .then(function(_doc) {
            doc = _doc;
            return User.findByIdAndUpdateAsync(request.user._id, {$push: {'documents': doc._id}});
        })
        .then(function() {
            docPath = path.join(request.userPath, '/' + doc._id);
            return mkdirp(docPath);
        })
        .then(function(){
            return fs.writeFileAsync(docPath + '/contents.md', doc.currentVersion);
        })
        .then(function(){
            return git.initAsync(docPath);
        })
        .then(function() {
            doc.pathToRepo = docPath;
            return doc.saveAsync();
        });

}

module.exports = router;
