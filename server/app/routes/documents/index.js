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
    cp = Promise.promisifyAll(require("child_process")),
    md = require('markdown-it')();

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

    Document.findById(req.params.docId)
        .populate("author branchedFrom readAccess editAccess pullRequests.author")
        .exec()
        .then(function(doc){
            res.json(doc);
        });
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
    var io = require('../../../io')();

    if(req.body.merge) {
        alertBranchesOfChange(req)
            .then(function(docs){
                io.emit('successfulMerge');
            });
    }

    Document.findByIdAndUpdateAsync(req.params.docId, {currentVersion: req.body.document.currentVersion})
        .then(function(_doc) {
            doc = _doc;
            return doc.repo.checkoutAsync(req.body.document.author._id);
        })
        .then(function(){
            return fs.writeFileAsync(req.body.document.pathToRepo + '/contents.md', req.body.document.currentVersion);
        })
        .then(function(){
            return doc.addAndCommit(req.body.message);
        })
        .then(function() {
            res.json(doc);
        })
        .catch(next);

});

//is this redundant/inelegant?
router.put('/:docId/removeNotification', function(req, res, next){

    Document.findByIdAndUpdateAsync(req.params.docId, {changedSinceBranch: false})
        .then(function(doc){
            res.json(doc);
        });

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
            return fs.readFileAsync(doc.repo.path + '/contents.md');
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


router.param('docId', function(req, res, next) {

    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            req.doc = doc;
            next();
        })
        .catch(next);

});

router.use('/:docId/commits', require('../commits'));

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
            doc.author = request.user._id;
            return doc.saveAsync();
        })
        .then(function() {
            return doc.addAndCommit('First save');
        })
        .then(function(){
            return cp.execAsync("git branch -m master " + request.user._id, {cwd: docPath});
        })
        .then(function(){
            return doc;
        });

}

function alertBranchesOfChange(request){
    var docsToSave = [];

    return Document.findAsync({branchedFrom: request.user._id})
        .then(function(docs){
            return Promise.map(docs, function(doc){
                doc.changedSinceBranch = true;
                return doc.saveAsync();
            });
        });

}

module.exports = router;
