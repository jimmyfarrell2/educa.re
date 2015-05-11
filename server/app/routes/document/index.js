var router = require('express').Router(),
    Promise = require('bluebird'),
    mkdirp = Promise.promisify(require('mkdirp')),
    git = Promise.promisifyAll(require('gift')),
    fs = Promise.promisifyAll(require('fs')),
    path = require('path'),
    mongoose = require('mongoose'),
    Document = Promise.promisifyAll(mongoose.model('Document')),
    User = Promise.promisifyAll(mongoose.model('User')),
    diff = require('diff'),
    cp = Promise.promisifyAll(require("child_process"));

//set a repo for the user
router.use('/', function(req, res, next){
    req.userPath = path.join(__dirname, '/../../../../documents/' + req.user._id);
    next();
});

router.get('/:docId', function(req, res, next){
    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            res.json(doc);
        })
        .catch(function(err){
            return next(err);
        })

});

router.get('/:userId', function(req, res, next){
   Document.findAsync({author: req.params.userId})
       .then(function(docs){
           res.json(docs);
       })
       .catch(function(err){
           return next(err);
       })
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

    var repo = Promise.promisifyAll(git(req.body.document.pathToRepo));

    repo.checkoutAsync(req.body.document.author)
        .then(function(){
            return fs.writeFileAsync(req.docPath + '/contents.html', req.body.newContent);
        })
        .then(function(){
            return repo.addAsync('contents.html');
        })
        .then(function(){
            return repo.commitAsync(req.body.message);
        })
        .then(function(){
            return Document.findByIdAndUpdateAsync(req.body.document._id, {currentVersion: req.body.newContent});
        })
        .then(function(){
            return repo.commitsAsync();
        })
        .then(function(commits){
            res.json(commits);
        })
        .catch(function(err){
            return next(err);
        });


});

///creating user's branch
router.post('/branch', function(req, res, next){

    var originalAuthor = req.body.document.author;
    var repo;

    req.body.document.author = req.user._id;
    req.body.document.readAccess = [];
    req.body.document.editAccess = [];
    req.body.document.branchedFrom = originalAuthor;
   
    Document.createAsync(req.body.document)
        .then(function(doc) {
            repo = Promise.promisifyAll(git(doc.pathToRepo));
            return repo.checkoutAsync(originalAuthor);
        })
        .then(function(){
            return repo.create_branchAsync(req.user._id);
        })
        .then(function(){
            return repo.checkoutAsync(req.user._id);
        })
        .then(function(){
            res.sendStatus(200);
        })
        .catch(function(err){
            return next(err);
        });
});

//create a pullRequest to the document's original author
router.put('/pullRequest', function(req, res, next){

    var pullRequest = {
        proposedVersion: req.body.document.currentVersion,
        author: req.user._id,
        date: Date.now(),
        message: req.body.message
    };

    Document.findOneAsync({pathToRepo: req.body.document.pathToRepo, author: req.body.document.branchedFrom})
        .then(function(doc){
            doc.pullRequests.push(pullRequest);
            return doc.saveAsync();
        })
        .catch(function(err){
            return next(err);
        });

});

//merge another user's proposed changes
router.put('/merge', function(req, res, next){
    var repo =  Promise.promisifyAll(git(req.body.document.pathToRepo));

    repo.checkoutAsync(req.user._id)
        .then(function(){
            return cp.execAsync('git diff ' + req.user._id + '..' + req.body.pullRequest.author);
        })
        .then(function(diff){
            //something?!?!?
        });

});

function createRepo(request) {

    var doc;
    var docPath = '';
    var repo = '';

    return Document.createAsync(request.body.document)
        .then(function(_doc) {
            // console.log("got here1");
            doc = _doc;
            return User.findByIdAndUpdateAsync(request.user._id, {$push: {'documents': doc._id}});
        })
        .then(function() {
            // console.log("got here2");
            docPath = path.join(request.userPath, '/' + doc._id);
            return mkdirp(docPath);
        })
        .then(function(){
            // console.log("got here3");
            return fs.writeFileAsync(docPath + '/contents.html', doc.currentVersion);
        })
        .then(function(){
            // console.log("got here4");
            return git.initAsync(docPath);
        })
        .then(function(){
            repo = Promise.promisifyAll(git(docPath));
            return repo.addAsync('contents.html');
        })
        .then(function(){
            return repo.commitAsync('Initial commit');
        })
        .then(function(){
            // console.log("got here5");
            return cp.execAsync("git branch -m master " + request.user._id, {cwd: docPath});
        })
        .then(function() {
            // console.log("Branch", cp.execAsync("git branch ", {cwd: docPath}))
            doc.pathToRepo = docPath;
            return doc.saveAsync();
        });

}

module.exports = router;
