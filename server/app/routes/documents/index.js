var router = require('express').Router(),
    Promise = require('bluebird'),
    mkdirp = Promise.promisify(require('mkdirp')),
    git = Promise.promisifyAll(require('gift')),
    fs = Promise.promisifyAll(require('fs')),
    path = require('path'),
    mongoose = require('mongoose'),
    Document = Promise.promisifyAll(mongoose.model('Document')),
    User = Promise.promisifyAll(mongoose.model('User')),
    diff = require('htmldiff/src/htmldiff.js'),
    cp = Promise.promisifyAll(require("child_process"));

//set a repo for the user
router.use('/', function(req, res, next){
    req.userPath = path.join(__dirname, '/../../../../documents/' + req.user._id);
    next();
});

router.get('/', function(req, res, next){

    Document.find({})
        .then(function(docs){
            res.json(docs);
        })
        .catch(next);

});

router.get('/:docId', function(req, res, next){

    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            res.json(doc);
        })
        .catch(next);

});

//create client's first folder
router.post('/', function(req, res, next){

    mkdirp(req.userPath)
        .then(function() {
            return createRepo(req);
        })
        .then(function(doc){
            res.send(doc);
        })
        .catch(next);

});

//update a user's file and commit
router.put('/:docId', function(req, res, next){

    var doc;

    Document.findByIdAndUpdateAsync(req.params.docId, {currentVersion: req.body.document.currentVersion})
        .then(function(doc) {
            doc = _doc;
            return doc.repo.checkoutAsync(req.body.document.author);
        })
        .then(function(){
            return fs.writeFileAsync(req.body.document.pathToRepo + '/contents.html', req.body.document.currentVersion);
        })
        .then(function(){
            return doc.addAndCommit(req.body.message);
        })
        .then(function() {
            res.json(doc);
        })
        .catch(next);

});

//reset to a previous version
router.put('/:docId/reset', function(req, res, next){

    var doc;

    Document.findByIdAsync(req.params.docId)
        .then(function(_doc){
            doc = _doc;
            return cp.execAsync('git checkout ' + req.body.commit.id + " .", {cwd: doc.pathToRepo} );
        })
        .then(function(){
            return doc.repo.commitAsync('Restore previous version');
        })
        .then(function(){
            return fs.readFileAsync(repo.path + '/contents.html');
        })
        .then(function(file){
            doc.currentVersion = file.toString();
            return doc.saveAsync();
        })
        .then(function(){
            res.json(doc);
        })
        .catch(next);

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
            return fs.writeFileAsync(docPath + '/contents.html', doc.currentVersion);
        })
        .then(function(){
            return git.initAsync(docPath);
        })
        .then(function() {
            return doc.addAndCommit('First save');
        })
        .then(function(){
            return cp.execAsync("git branch -m master " + request.user._id, {cwd: docPath});
        })
        .then(function() {
            doc.pathToRepo = docPath;
            doc.author = request.user._id;
            return doc.saveAsync();
        })
        .then(function(){
            return doc;
        });

}

module.exports = router;
