var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Promise = require('bluebird');
var mkdirp = Promise.promisify(require('mkdirp'));
var path = require('path');
var git = Promise.promisifyAll(require('gift'));
var cp = Promise.promisifyAll(require("child_process"));
var fs = Promise.promisifyAll(require('fs'));

require('../../../server/db/models/document');
require('../../../server/db/models/user');

var Document = mongoose.model('Document');
var User = mongoose.model('User');

describe('Document model', function () {

    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

    it('should exist', function () {
        expect(User).to.be.a('function');
    });

    describe('title property', function() {

        it('is a string', function(done) {

            var documentInfo = {
                title: 'About Educa.re'
            };

            Document.createAsync(documentInfo)
                .then(function(document) {
                    expect(document.title).to.be.a('string');
                    expect(document.title).to.be.equal('About Educa.re');
                    done();
                });

        });

        it('defaults to \'untitled\'', function(done) {

            Document.createAsync({})
                .then(function(document) {
                    expect(document.title).to.be.equal('untitled');
                    done();
                })

        });

    });

    describe('public property', function() {

        it('is a boolean', function(done) {

            var documentInfo = {
                public: true,
            };

            Document.createAsync(documentInfo)
                .then(function(document) {
                    expect(document.public).to.be.equal(true);
                    done();
                });

        });

        it('defaults to false', function(done) {

            Document.createAsync({})
                .then(function(document) {
                    expect(document.public).to.be.equal(false);
                    done();
                })

        });

    });

    describe('readAccess and editAccess properties', function() {

        it('are arrays of User model references', function(done) {

            var userInfo = {
                email: 'david@fullstack.com',
                password: 'WhatIsThisPeasantry'
            };

            var document;

            User.createAsync(userInfo)
                .then(function(user) {
                    var documentInfo = {};
                    documentInfo.readAccess = [user._id];
                    documentInfo.editAccess = [user._id];
                    return Document.createAsync(documentInfo);
                })
                .then(function(_document) {
                    document = _document;
                    expect(document.readAccess).to.be.an('array');
                    expect(document.editAccess).to.be.an('array');
                    return User.findByIdAsync(document.readAccess[0]);
                })
                .then(function(user) {
                    expect(user).to.exist;
                    return User.findByIdAsync(document.editAccess[0]);
                })
                .then(function(user) {
                    expect(user).to.exist;
                    done();
                });

        });

    });

    describe('author and branchedFrom properties', function() {

        it('are User model references', function(done) {

            var user1Info = {
                email: 'david@fullstack.com',
                password: 'WhatIsThisPeasantry'
            };

            var user2Info = {
                email: 'jimmy@fullstack.com',
                password: 'UkulelesUnite'
            };

            var document;

            Promise.all([User.createAsync(user1Info), User.createAsync(user2Info)])
                .then(function(usersInfo) {
                    var documentInfo = {};
                    documentInfo.author = [usersInfo[0]._id];
                    documentInfo.branchedFrom = [usersInfo[1]._id];
                    return Document.createAsync(documentInfo);
                })
                .then(function(_document) {
                    document = _document;
                    return User.findByIdAsync(document.author);
                })
                .then(function(user) {
                    expect(user).to.exist;
                    return User.findByIdAsync(document.branchedFrom);
                })
                .then(function(user) {
                    expect(user).to.exist;
                    done();
                });

        });

    });

    describe('references property', function() {

        it('is an array of strings', function(done) {

            var documentInfo = {
                references: ['http://en.wikipedia.org/wiki/Broccoli', 'http://en.wikipedia.org/wiki/Mahatma_Gandhi']
            };

            Document.createAsync(documentInfo)
                .then(function(document) {
                    expect(document.references).to.be.an('array');
                    expect(document.references[0]).to.be.equal('http://en.wikipedia.org/wiki/Broccoli');
                    expect(document.references[1]).to.be.equal('http://en.wikipedia.org/wiki/Mahatma_Gandhi');
                    done();
                });

        });

    });

    describe('pathToRepo property', function() {

        it('is a string', function(done) {

            var documentInfo = {
                pathToRepo: 'some/really/cool/path'
            };

            Document.createAsync(documentInfo)
                .then(function(document) {
                    expect(document.pathToRepo).to.be.equal('some/really/cool/path');
                    done();
                });

        });

    });

    describe('currentVersion property', function() {

        it('is a string', function(done) {

            var documentInfo = {
                currentVersion: 'This is some interesting content about broccoli and Gandhi'
            };

            Document.createAsync(documentInfo)
                .then(function(document) {
                    expect(document.currentVersion).to.be.equal('This is some interesting content about broccoli and Gandhi');
                    done();
                });

        });

        it('defaults to an empty string', function(done) {

            Document.createAsync({})
                .then(function(document) {
                    expect(document.currentVersion).to.be.equal('');
                    done();
                });

        });

    });

    describe('pullRequests property', function() {

        var userInfo = {
            email: 'sonia@fullstack.com',
            password: 'GuysThisIsCray'
        };

        var documentInfo = {
            pullRequests: [{
                proposedVersion: 'Gandhi is not broccoli.',
                date: Date.now(),
                message: 'I think this change to your document is better.'
            }]
        };

        it('is an array', function(done) {

            Document.createAsync(documentInfo)
                .then(function(document) {
                    expect(document.pullRequests).to.be.an('array');
                    done();
                });

        });

        describe('proposedVersion and message properties', function(done) {

            it('are strings', function(done) {

                Document.createAsync(documentInfo)
                    .then(function(document) {
                        expect(document.pullRequests[0].proposedVersion).to.be.equal('Gandhi is not broccoli.');
                        expect(document.pullRequests[0].message).to.be.equal('I think this change to your document is better.');
                        done();
                    })

            });

        });

        describe('author property', function(done) {

            it('is a User model reference', function(done) {

                User.createAsync(userInfo)
                    .then(function(user) {
                        documentInfo.pullRequests[0].author = user._id;
                        return Document.createAsync(documentInfo);
                    })
                    .then(function(document) {
                        return User.findByIdAsync(document.pullRequests[0].author);
                    })
                    .then(function(user) {
                        expect(user).to.exist;
                        done();
                    });

            });

        });

        describe('date property', function(done) {

            it('is a date', function(done) {

                Document.createAsync(documentInfo)
                    .then(function(document) {
                        expect(document.pullRequests[0].date).to.be.a('date');
                        done();
                    })

            });

        });

    });

    describe('repo virtual', function() {

        it('returns a promise for a git repo object', function(done) {

            var documentInfo = {
                title: 'About Educa.re'
            };

            Document.createAsync(documentInfo)
                .then(function(document) {
                    expect(document.repo).to.be.an('object');
                    expect(document.repo.constructor.name).to.be.equal('Repo');
                    done();
                })

        });

    });

    describe('getHistory method', function() {

        var document;
        var tempPath = path.join(__dirname, 'tempFolder');

        before(function(done) {

            var userInfo = {
                email: 'jimmy@fullstack.com',
                password: 'UkulelesUnite'
            };

            var documentInfo = {
                pathToRepo: tempPath
            };

            var user;

            mkdirp(tempPath)
                .then(function(){
                    return Promise.all([User.createAsync(userInfo), git.initAsync(tempPath)]);
                })
                .then(function(promiseResults){
                    user = promiseResults[0];
                    documentInfo.author = user._id;
                })
                .then(function() {
                    return git.initAsync(tempPath);
                })
                .then(function() {
                    var repo = git(tempPath);
                    return Promise.all([
                        Document.createAsync(documentInfo),
                        fs.writeFileAsync(tempPath + '/contents.md', 'Broccoli vs Gandhi')
                    ]);
                })
                .then(function(promiseResults) {
                    document = promiseResults[0];
                    return document.repo.addAsync('contents.md');
                })
                .then(function(){
                    return document.repo.commitAsync('This is the first commit');
                })
                .then(function() {
                    cp.execAsync('git branch -m master ' + user._id, {cwd: tempPath});
                })
                .then(function() {
                    return fs.writeFileAsync(tempPath + '/contents.md', 'Carrots vs Gandhi');
                })
                .then(function() {
                    return document.repo.addAsync('contents.md');
                })
                .then(function(){
                    return document.repo.commitAsync('This is the second commit');
                })
                .then(function() {
                    fs.writeFileAsync(tempPath + '/contents.md', 'Peas vs Gandhi');
                })
                .then(function() {
                    return document.repo.addAsync('contents.md');
                })
                .then(function(){
                    document.repo.commitAsync('This is the third commit');
                    done();
                })

        });

        after(function(done) {
            cp.execAsync('rm -r ' + tempPath);
            done();
        });

        it('returns an array of the repo\'s commit history for the user\'s branch', function(done) {

            document.getHistory()
                .then(function(commits) {
                    expect(commits).to.be.an('array');
                    expect(commits[0].constructor.name).to.be.equal('Commit');
                    done();
                });

        });

        it('takes an argument of the number of commits to return', function(done) {

            document.getHistory(2)
                .then(function(commits) {
                    expect(commits.length).to.be.equal(2);
                    done();
                });

        });

    });

});
