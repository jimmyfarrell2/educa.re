var router = require('express').Router(),
    Promise = require('bluebird'),
    mkdirp = Promise.promisify(require('mkdirp')),
    git = Promise.promisifyAll(require('gift')),
    path = require('path'),
    mongoose = require('mongoose'),
    Document = Promise.promisifyAll(mongoose.model('Document'));


//get all commits for a document
router.get('/', function(req, res, next){

        req.doc.repo.commitsAsync(req.doc.author)
            .then(function(commits){
                res.json(commits);
            })
            .catch(next);

});

//get a particular commit for a document
router.get('/:commitId', function(req, res, next){

        req.doc.repo.checkoutAsync(req.params.commitId)
            .then(function(commit){
                res.sendFile(req.doc.repo.path + '/contents.md');
            })
            .catch(next);

});

module.exports = router;
