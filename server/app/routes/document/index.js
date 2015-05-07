var router = require('express').Router();
var Promise = require('bluebird');
var mkdirp = Promise.promisify(require('mkdirp'));
var cp = require('child_process');
var git = Promise.promisifyAll(require('gift'));
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var repo = null;

//set a repo for the user
router.use(function(req, res, next){
    req.userPath = path.join(__dirname, '/../../../../documents/' + req.body.id);
    req.docPath = path.join(req.userPath, '/' + req.body.name);
    req.repo = Promise.promisifyAll(git(req.docPath));
    next();
});



//create client's first folder
router.post('/', function(req, res, next){

    mkdirp(req.userPath)
        .then(function(){
            mkdirp(req.docPath);
        })
        .then(function(){
            fs.writeFileAsync(req.docPath + '/contents.md', 'welcome');
        })
        .then(function(){
            return git.initAsync(req.docPath);
        })
        .then(function(_repo){
            res.send(200);
        })
        .catch(function(err){
            return next(err);
        });

});

//update a user's file and commit
router.put('/', function(req, res, next){


    fs.writeFileAsync(req.docPath + '/contents.md', 'NOT anything else')
        .then(function(){
            return req.repo.addAsync('contents.md');
        })
        .then(function(){
            return req.repo.commitAsync('our first commit');
        })
        .then(function(){
            return req.repo.commitsAsync();
        })
        .then(function(commits){
            console.log(commits);
        })
        .catch(function(err){
            return next(err);
        });


});


module.exports = router;