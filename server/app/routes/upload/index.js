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
    Busboy = require('busboy'),
    md = require('markdown-it')();

//create client's first folder
router.post('/', function(req, res, next){
    var busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      var saveTo = path.join('.', filename);
      console.log('Uploading: ' + saveTo);
      file.pipe(fs.createWriteStream(saveTo));
    });

    busboy.on('finish', function() {
      console.log('Upload complete');
      res.writeHead(200, { 'Connection': 'close' });
      res.end("That's all folks!");
    });

    return req.pipe(busboy);
    // mkdirp(req.userPath)
    //     .then(function() {
    //         return createRepo(req);
    //     })
    //     .then(function(doc){
    //         res.send(doc);
    //     })
    //     .catch(next);

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

module.exports = router;
