var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');

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

    var createDocument = function(documentInfo) {
        return Document.createAsync(documentInfo);
    };

    var createUser = function(userInfo) {
        return User.createAsync(userInfo);
    };

    describe('title property', function() {

        it('is a string', function(done) {

            var documentInfo = {
                title: 'About Educa.re'
            };

            createDocument(documentInfo)
                .then(function(document) {
                    expect(document.title).to.be.a('string');
                    expect(document.title).to.be.equal('About Educa.re');
                    done();
                });

        });

        it('defaults to \'untitled\'', function(done) {

            createDocument()
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

            createDocument(documentInfo)
                .then(function(document) {
                    expect(document.public).to.be.equal(true);
                    done();
                });

        });

        it('defaults to false', function(done) {

            createDocument()
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

            createUser(userInfo)
                .then(function(user) {
                    var documentInfo = {};
                    documentInfo.readAccess = [user._id];
                    documentInfo.editAccess = [user._id];
                    return createDocument(documentInfo);
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

            Promise.all([createUser(user1Info), createUser(user2Info)])
                .then(function(usersInfo) {
                    var documentInfo = {};
                    documentInfo.author = [usersInfo[0]._id];
                    documentInfo.branchedFrom = [usersInfo[1]._id];
                    return createDocument(documentInfo);
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

            createDocument(documentInfo)
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

            createDocument(documentInfo)
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

            createDocument(documentInfo)
                .then(function(document) {
                    expect(document.currentVersion).to.be.equal('This is some interesting content about broccoli and Gandhi');
                    done();
                });

        });

        it('defaults to an empty string', function(done) {

            createDocument()
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

            createDocument(documentInfo)
                .then(function(document) {
                    expect(document.pullRequests).to.be.an('array');
                    done();
                });

        });

        describe('proposedVersion and message properties', function(done) {

            it('are strings', function(done) {

                createDocument(documentInfo)
                    .then(function(document) {
                        expect(document.pullRequests[0].proposedVersion).to.be.equal('Gandhi is not broccoli.');
                        expect(document.pullRequests[0].message).to.be.equal('I think this change to your document is better.');
                        done();
                    })

            });

        });

        describe('author property', function(done) {

            it('is a User model reference', function(done) {

                createUser(userInfo)
                    .then(function(user) {
                        documentInfo.pullRequests[0].author = user._id;
                        return createDocument(documentInfo);
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

                createDocument(documentInfo)
                    .then(function(document) {
                        expect(document.pullRequests[0].date).to.be.a('date');
                        done();
                    })

            });

        });

    });

});
