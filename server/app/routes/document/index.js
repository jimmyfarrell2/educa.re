var router = require('express').Router();
var Promise = require('bluebird');
var mkdirp = Promise.promisify(require('mkdirp'));
var cp = require('child_process');
var git = Promise.promisifyAll(require('gift'));
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');




//create client's first folder
router.post('/', function(req, res, next){

    var documentPath = path.join(__dirname, '/../../../../documents/' + req.body.id);

    mkdirp(documentPath)
        .then(function(){
            mkdirp(documentPath + '/' + req.body.name);
        })
        .then(function(){
            fs.writeFileAsync(documentPath + '/' + req.body.name + '/' + req.body.document + '.md');
        })
        .then(function(){
            return git.initAsync(__dirname + '/../../../../documents/' + req.body.id  + '/' +  req.body.name);
        })
        .then(function(repo){
            res.send(200);
        })
        .catch(function(err){
            return next(err);
        });

});

module.exports = router;