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
    mammoth = require('mammoth'),
    md = require('markdown-it')();

router.use('/', function(req, res, next){
    req.userPath = path.join(__dirname, '/../../../../documents/' + req.user._id);
    next();
});

//Uploading a New Document
router.post('/', function(req, res, next){
    var busboy = new Busboy({ headers: req.headers });
    var docData;
    var newDoc;
    var result;

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var saveTo = path.join('.', filename);
        var body = new Buffer(0);

        file.on('data', function (chunk) {
            body = Buffer.concat([body, chunk]);
        });

        file.on('end', function () {
            mammoth.convertToMarkdown({buffer: body})
            .then(function(_result){
                req.docData = _result.value;
                return mkdirp(req.userPath);
            })
            .then(function(){
                return createRepo(req);
            })
            .then(function(doc){
                res.json(doc);
            });
        });
    });

    // busboy.on('finish', function() {
    //     console.log('Upload complete');
    //     console.log("this should contain the newly created doc",newDoc);
    //     // res.writeHead(200, { 'Connection': 'close' });
    //     res.end('This is the end');
    // });

    return req.pipe(busboy);

});


function createRepo(request) {

    var doc;
    var docPath = '';

    return Document.createAsync({})
        .then(function(_doc) {
            doc = _doc;
            doc.dateCreated = Date.now();
            return User.findByIdAndUpdateAsync(request.user._id, {$push: {'documents': doc._id}});
        })
        .then(function() {
            docPath = path.join(request.userPath, '/' + doc._id);
            return mkdirp(docPath);
        })
        .then(function(){
            doc.currentVersion = request.docData;
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
