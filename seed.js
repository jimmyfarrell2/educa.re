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

var seedUsers = function () {

    var users = [
        {
            email: 'sonia@fsa.com',
            password: 'sonia',
            name: {
                first: 'Sonia',
                last: 'Trehan'
            }
        },
        {
            email: 'nastia@fsa.com',
            password: 'nastia',
            name: {
                first: 'Nastia',
                last: 'Sergiienko'
            }
        },
        {
            email: 'david@fsa.com',
            password: 'david',
            name: {
                first: 'David',
                last: 'Phelan'
            }
        },
        {
            email: 'jimmy@fsa.com',
            password: 'jimmy',
            name: {
                first: 'Jimmy',
                last: 'Farrell'
            }
        }
    ];

    return q.invoke(User, 'create', users);

};

var seedDocuments = function () {

    var docTextGenerator = function() {
        return '<h1>' + chance.sentence({words: 8}) + '</h1><p>' + chance.paragraph() + '</p><h2>' + chance.sentence({words: 5}) + '</h2><p>' + chance.paragraph() + '</p><p>' + chance.paragraph() + '</p><h2>' + chance.sentence({words: 5}) + '</h2><p>' + chance.paragraph() + '</p><p>' + chance.paragraph() + '</p>';
    };

    var usersFindArray = [
        User.findOneAsync({email: 'sonia@fsa.com'}),
        User.findOneAsync({email: 'nastia@fsa.com'}),
        User.findOneAsync({email: 'david@fsa.com'}),
        User.findOneAsync({email: 'jimmy@fsa.com'})
    ];

    return q.all(usersFindArray)
        .spread(function(sonia, nastia, david, jimmy) {
            var soniaId = sonia._id;
            var nastiaId = nastia._id;
            var davidId = david._id;
            var jimmyId = jimmy._id;
            var documents = [
                {
                    title: 'sonia@fsa.com',
                    public: false,
                    author: soniaId,
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Technology', 'Health/Wellness', 'Science'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'sonia@fsa.com',
                    public: false,
                    author: soniaId,
                    editAccess: [nastiaId],
                    readAccess: [nastiaId, davidId, jimmyId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Education'],
                    tags: [chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'sonia@fsa.com',
                    author: soniaId,
                    editAccess: [nastiaId],
                    readAccess: [nastiaId, davidId, jimmyId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Business', 'Technology'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'nastia@fsa.com',
                    public: false,
                    author: nastiaId,
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Technology', 'Health/Wellness', 'Science'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'nastia@fsa.com',
                    public: false,
                    author: nastiaId,
                    editAccess: [soniaId],
                    readAccess: [soniaId, davidId, jimmyId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Education'],
                    tags: [chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'nastia@fsa.com',
                    author: nastiaId,
                    editAccess: [soniaId],
                    readAccess: [soniaId, davidId, jimmyId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Business', 'Technology'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'david@fsa.com',
                    public: false,
                    author: davidId,
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Technology', 'Health/Wellness', 'Science'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'david@fsa.com',
                    public: false,
                    author: davidId,
                    editAccess: [jimmyId],
                    readAccess: [jimmyId, soniaId, nastiaId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Education'],
                    tags: [chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'david@fsa.com',
                    author: davidId,
                    editAccess: [jimmyId],
                    readAccess: [jimmyId, soniaId, nastiaId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Business', 'Technology'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'jimmy@fsa.com',
                    public: false,
                    author: jimmyId,
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Technology', 'Health/Wellness', 'Science'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'jimmy@fsa.com',
                    public: false,
                    author: jimmyId,
                    editAccess: [davidId],
                    readAccess: [davidId, soniaId, nastiaId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Education'],
                    tags: [chance.word(), chance.word(), chance.word()]
                },
                {
                    title: 'jimmy@fsa.com',
                    author: jimmyId,
                    editAccess: [davidId],
                    readAccess: [davidId, soniaId, nastiaId],
                    currentVersion: docTextGenerator(),
                    dateCreated: chance.date(),
                    categories: ['Business', 'Technology'],
                    tags: [chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
                }
            ];

            return q.invoke(Document, 'create', documents);
        })
        .catch(function (err) {
            console.error(err);
            process.kill(1);
        });

};

connectToDb
    .then(function () {
        console.log('1');
        return q.all([User.removeAsync({}), Document.removeAsync({})]);
    })
    .then(function() {
        console.log('3');
        return cp.execAsync('rm -rf documents', {cwd: __dirname});
    })
    .then(function() {
        return mkdirp(__dirname + '/documents');
    })
    .then(function () {
        console.log('4');
        return seedUsers();
    })
    .then(function() {
        console.log('5');
        return seedDocuments();
    })
    .then(function() {
        console.log('6');
        return Document.findAsync({});
    })
    .then(function(docs) {

        console.log('7');
        var createRepoArray = [];

        docs.forEach(function(doc) {
            var docPath = path.join(__dirname, 'documents', doc.author.toString(), doc._id.toString());
            createRepoArray.push(mkdirp(docPath)
                .then(function() {
                    console.log('in here')
                    return fs.writeFileAsync(docPath + '/contents.html', doc.currentVersion);
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
