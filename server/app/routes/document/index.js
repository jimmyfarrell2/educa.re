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

router.get('/:docId', function(req, res, next){
    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            res.json(doc);
        })
        .catch(function(err){
            return next(err);
        })

});

router.get('/user/:userId', function(req, res, next){
   Document.findAsync({author: req.params.userId})
       .then(function(docs){
           res.json(docs);
       })
       .catch(function(err){
           return next(err);
       })
});

//get all commits
router.get('/commits/:docId', function(req, res, next){
    var repo;

    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            repo = Promise.promisifyAll(git(doc.pathToRepo));
            return repo.commitsAsync(doc.author);
        })
        .then(function(commits){
            res.json(commits);
        })
        .catch(function(err){
            return next(err);
        })

});

//get a particular commit
router.get('/:docId/commit/:commitId', function(req, res, next){
   var repo;

    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            doc.author = "5550f5108ca00ba60fe2d275";//change this!
            repo = Promise.promisifyAll(git(doc.pathToRepo));
            return repo.checkoutAsync(req.params.commitId)
        })
        .then(function(commit){
            res.sendFile(repo.path + '/contents.html')
        })
        .catch(function(err){
            return next(err);
        })

});


//reset to a previous version
router.put('/reset', function(req, res, next){
    var repo;
    var doc;

    Document.findByIdAsync(req.body.document._id)
        .then(function(_doc){
            console.log('1')
            doc = _doc;
            repo = Promise.promisifyAll(git(doc.pathToRepo));
            return cp.execAsync('git checkout ' + req.body.commit.id + " .", {cwd: doc.pathToRepo} );
            //return cp.execAsync('git revert ' + req.body.commitId, {cwd: doc.pathToRepo})
        })
        .then(function(){
            console.log('2')
            return repo.commitAsync('reverting');
            //return cp.execAsync('git commit -m "reverting"', {cwd: doc.pathToRepo});
        })
        .then(function(){
            console.log('3')
            return fs.readFileAsync(repo.path + '/contents.html');
        })
        .then(function(file){
            console.log('4')
            doc.currentVersion = file.toString();
            return doc.saveAsync();
        })
        .then(function(){
            res.json(doc);
        })
        .catch(function(err){
            return next(err);
        });


    //For a HARD reset:
    //Document.findByIdAsync(req.body.documentId)
    //    .then(function(_doc){
    //        doc = _doc;
    //        repo = Promise.promisifyAll(git(doc.pathToRepo));
    //        return cp.execAsync('git reset --hard ' + req.body.commitId, {cwd: doc.pathToRepo})
    //    })
    //    .then(function(){
    //        return fs.readFileAsync(repo.path + '/contents.html');
    //    })
    //    .then(function(file){
    //        doc.currentVersion = file.toString();
    //        return doc.saveAsync();
    //    })
    //    .then(function(){
    //        res.json(doc);
    //    })
    //    .catch(function(err){
    //        return next(err);
    //    });

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
        .catch(function(err){
            return next(err);
        });

});

//update a user's file and commit
router.put('/', function(req, res, next){
    console.log(req.body)
    var repo = Promise.promisifyAll(git(req.body.document.pathToRepo));

    repo.checkoutAsync(req.body.document.author)
        .then(function(){
            return fs.writeFileAsync(req.body.document.pathToRepo + '/contents.html', req.body.document.currentVersion);
        })
        .then(function(){
            return repo.addAsync('contents.html');
        })
        .then(function(){
            return repo.commitAsync(req.body.message);
        })
        .then(function(){
            return Document.findByIdAndUpdateAsync(req.body.document._id, {currentVersion: req.body.document.currentVersion});
        })
        .then(function(doc){
            res.json(doc);
        })
        .catch(function(err){
            return next(err);
        });


});

///creating user's branch
router.post('/branch', function(req, res, next){

    var originalAuthor = req.body.author;
    var repo;
    var currentBranch;
    var doc;


    req.body.author = req.user._id;
    req.body.readAccess = [];
    req.body.editAccess = [];
    console.log(originalAuthor);
    req.body.branchedFrom = originalAuthor;
    console.log(req.body.branchedFrom);
    delete req.body._id;
   
    Document.createAsync(req.body)
        .then(function(_doc) {
            doc = _doc;
            repo = Promise.promisifyAll(git(doc.pathToRepo));
            return repo.branchAsync();

        })
        .then(function(branch){
            currentBranch = branch;
            //TO DO
            if(currentBranch !== originalAuthor) return repo.checkoutAsync(originalAuthor);
            else return;
        })
        .then(function(){
            return repo.create_branchAsync(req.user._id);
        })
        .then(function(){
            return repo.checkoutAsync(req.user._id);
        })
        .then(function(){
            return User.findByIdAndUpdateAsync(req.user._id, {$push: {'documents': doc._id}});
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
    console.log(req.body.document);
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
            var diffToHtml = diff(req.body.pullRequest.proposedVersion, req.body.document.currentVersion);
            res.json(diffToHtml);
        });
        //.then(function(){
        //    return cp.execAsync('git diff ' + req.user._id + '..' + req.body.pullRequest.author, {cwd: req.body.document.pathToRepo});
        //})
        //.then(function(diff){
        //    res.json(diff);
        //    //something?!?!?
        //});

});

function createRepo(request) {

    var doc;
    var docPath = '';
    var repo = '';

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
        .then(function(){
            repo = Promise.promisifyAll(git(docPath));
            return repo.addAsync('contents.html');
        })
        .then(function(){
            return repo.commitAsync('Initial commit');
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
