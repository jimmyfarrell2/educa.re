var router = require('express').Router(),
    Promise = require('bluebird'),
    mkdirp = Promise.promisify(require('mkdirp')),
    git = Promise.promisifyAll(require('gift')),
    path = require('path'),
    mongoose = require('mongoose'),
    Document = Promise.promisifyAll(mongoose.model('Document')),

//get all commits for a document
router.get('/:docId', function(req, res, next){

    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            return doc.repo.commitsAsync(doc.author);
        })
        .then(function(commits){
            res.json(commits);
        })
       .catch(next);

});

//get a particular commit for a document
router.get('/:docId/commit/:commitId', function(req, res, next){

    Document.findByIdAsync(req.params.docId)
        .then(function(doc){
            return doc.repo.checkoutAsync(req.params.commitId)
        })
        .then(function(commit){
            res.sendFile(repo.path + '/contents.html')
        })
       .catch(next);

});

module.exports = router;
