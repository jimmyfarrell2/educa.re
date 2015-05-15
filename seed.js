/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

Refer to the q documentation for why and how q.invoke is used.

*/

var mongoose = require('mongoose');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Document = mongoose.model('Document');
var q = require('q');
var Promise = require('bluebird');
var chalk = require('chalk');
var chance = new require('chance')();
var mkdirp = Promise.promisify(require('mkdirp'));
var cp = Promise.promisifyAll(require('child_process'));
var git = Promise.promisifyAll(require('gift'));
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var getCurrentUserData = function () {
    return q.ninvoke(User, 'find', {});
};

var seedUsersAndDocuments = function () {

    var sonia = new User({
        email: 'sonia@fsa.com',
        password: 'sonia',
        name: {
            first: 'Sonia',
            last: 'Trehan'
        }
    });
    var nastia = new User({
        email: 'nastia@fsa.com',
        password: 'nastia',
        name: {
            first: 'Nastia',
            last: 'Sergiienko'
        }
    });
    var david = new User({
        email: 'david@fsa.com',
        password: 'david',
        name: {
            first: 'David',
            last: 'Phelan'
        }
    });
    var jimmy = new User({
            email: 'jimmy@fsa.com',
            password: 'jimmy',
            name: {
                first: 'Jimmy',
                last: 'Farrell'
            }
    });

    var docTextGenerator = function() {
        return '# ' + chance.sentence({words: 8}) + '\n\n' + chance.paragraph() + '\n\n## ' + chance.sentence({words: 5}) + '\n\n' + chance.paragraph() + '\n\n' + chance.paragraph() + '\n\n# ' + chance.sentence({words: 5}) + '\n\n' + chance.paragraph() + '\n\n' + chance.paragraph();
    };

    var documents = [
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: sonia._id,
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Technology', 'Health/Wellness', 'Science'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: sonia._id,
            editAccess: [nastia._id],
            readAccess: [nastia._id, david._id, jimmy._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Education'],
            tags: [chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            author: sonia._id,
            editAccess: [nastia._id],
            readAccess: [nastia._id, david._id, jimmy._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Business', 'Technology'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: nastia._id,
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Technology', 'Health/Wellness', 'Science'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: nastia._id,
            editAccess: [sonia._id],
            readAccess: [sonia._id, david._id, jimmy._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Education'],
            tags: [chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            author: nastia._id,
            editAccess: [sonia._id],
            readAccess: [sonia._id, david._id, jimmy._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Business', 'Technology'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: david._id,
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Technology', 'Health/Wellness', 'Science'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: david._id,
            editAccess: [jimmy._id],
            readAccess: [jimmy._id, sonia._id, nastia._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Education'],
            tags: [chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            author: david._id,
            editAccess: [jimmy._id],
            readAccess: [jimmy._id, sonia._id, nastia._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Business', 'Technology'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: jimmy._id,
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Technology', 'Health/Wellness', 'Science'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            public: false,
            author: jimmy._id,
            editAccess: [david._id],
            readAccess: [david._id, sonia._id, nastia._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Education'],
            tags: [chance.word(), chance.word(), chance.word()]
        },
        {
            title: chance.sentence({words: 4}),
            author: jimmy._id,
            editAccess: [david._id],
            readAccess: [david._id, sonia._id, nastia._id],
            currentVersion: docTextGenerator(),
            dateCreated: chance.date(),
            categories: ['Business', 'Technology'],
            tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        }
    ];

    return q.all([sonia.saveAsync(), nastia.saveAsync(), david.saveAsync(), jimmy.saveAsync()])
        .then(function() {
            return q.invoke(Document, 'create', documents);
        })
        .catch(function(err) {
            console.log(err);
        });

};

connectToDb
    .then(function () {
        return q.all([User.removeAsync({}), Document.removeAsync({})]);
    })
    .then(function() {
        return cp.execAsync('rm -rf documents', {cwd: __dirname});
    })
    .then(function() {
        return mkdirp(__dirname + '/documents');
    })
    .then(function () {
        return seedUsersAndDocuments();
    })
    .then(function() {
        return Document.findAsync({});
    })
    .then(function(docs) {

        var createRepoArray = [];

        docs.forEach(function(doc) {
            var docPath = path.join(__dirname, 'documents', doc.author.toString(), doc._id.toString());
            createRepoArray.push(mkdirp(docPath)
                .then(function() {
                    return fs.writeFileAsync(docPath + '/contents.md' +
                        '', doc.currentVersion);
                })
                .then(function(){
                    return git.initAsync(docPath);
                })
                .then(function() {
                    doc.pathToRepo = docPath;
                    return doc.saveAsync();
                })
                .then(function() {
                    return doc.addAndCommit('First save');
                })
                .then(function(){
                    return cp.execAsync("git branch -m master " + doc.author, {cwd: docPath});
                })
                .catch(function(err) {
                    console.log(err);
                }));
        });

        return q.all(createRepoArray);

    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
