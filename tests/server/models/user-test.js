var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var q = require('q');

require('../../../server/db/models/user');
require('../../../server/db/models/document');

var User = mongoose.model('User');
var Document = mongoose.model('Document');

describe('User model', function () {

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

    describe('email property', function() {

        it('is a string of valid email format', function(done) {

            var user1Info = {
                email: 'nastia@fullstack.com',
                password: 'UkraineRulez'
            };

            var user2Info = {
                email: 'sonia@fullstack',
                password: 'GuysThisIsCray'
            };

            User.createAsync(user1Info)
                .then(function(user1) {
                    expect(typeof user1.email).to.be.a('string');
                })
                .then(function() {
                    return User.createAsync(user2Info);
                })
                .catch(function(err) {
                    expect(err.errors.email.message).to.be.equal('invalid email');
                    done();
                });

        });

        it('is a required property', function(done) {

            var userInfo = {
                password: 'RIPGlobalPulse'
            };

            User.createAsync(userInfo)
                .catch(function(err) {
                    expect(err.errors.email.message).to.be.equal('Path `email` is required.');
                    done();
                });

        });

    });

    describe('password property', function() {

        it('is a String', function(done) {

            var userInfo = {
                email: 'david@fullstack.com',
                password: 'WhatIsThisPeasantry'
            };

            User.createAsync(userInfo)
                .then(function(user) {
                    expect(typeof user.password).to.be.a('string');
                    done();
                });

        });

        it('is a required property', function(done) {

            var userInfo = {
                email: 'jimmy@fullstack.com'
            };

            User.createAsync(userInfo)
                .catch(function(err) {
                    expect(err.errors.password.message).to.be.equal('Path `password` is required.');
                    done();
                });

        });

        describe('password encryption', function () {

            describe('generateSalt method', function () {

                it('should exist', function () {
                    expect(User.generateSalt).to.be.a('function');
                });

                it('should return a random string basically', function () {
                    expect(User.generateSalt()).to.be.a('string');
                });

            });

            describe('encryptPassword', function () {

                var cryptoStub;
                var hashUpdateSpy;
                var hashDigestStub;
                beforeEach(function () {

                    cryptoStub = sinon.stub(require('crypto'), 'createHash');

                    hashUpdateSpy = sinon.spy();
                    hashDigestStub = sinon.stub();

                    cryptoStub.returns({
                        update: hashUpdateSpy,
                        digest: hashDigestStub
                    });

                });

                afterEach(function () {
                    cryptoStub.restore();
                });

                it('should exist', function () {
                    expect(User.encryptPassword).to.be.a('function');
                });

                it('should call crypto.createHash with "sha1"', function () {
                    User.encryptPassword('asldkjf', 'asd08uf2j');
                    expect(cryptoStub.calledWith('sha1')).to.be.ok;
                });

                it('should call hash.update with the first and second argument', function () {

                    var pass = 'testing';
                    var salt = '1093jf10j23ej===12j';

                    User.encryptPassword(pass, salt);

                    expect(hashUpdateSpy.getCall(0).args[0]).to.be.equal(pass);
                    expect(hashUpdateSpy.getCall(1).args[0]).to.be.equal(salt);

                });

                it('should call hash.digest with hex and return the result', function () {

                    var x = {};
                    hashDigestStub.returns(x);

                    var e = User.encryptPassword('sdlkfj', 'asldkjflksf');

                    expect(hashDigestStub.calledWith('hex')).to.be.ok;
                    expect(e).to.be.equal(x);

                });

            });

            describe('on creation', function () {

                var encryptSpy;
                var saltSpy;

                var createUser = function () {
                    return User.create({ email: 'obama@gmail.com', password: 'potus' });
                };

                beforeEach(function () {
                    encryptSpy = sinon.spy(User, 'encryptPassword');
                    saltSpy = sinon.spy(User, 'generateSalt');
                });

                afterEach(function () {
                    encryptSpy.restore();
                    saltSpy.restore();
                });

                it('should call User.encryptPassword with the given password and generated salt', function (done) {
                    createUser().then(function () {
                        var generatedSalt = saltSpy.getCall(0).returnValue;
                        expect(encryptSpy.calledWith('potus', generatedSalt)).to.be.ok;
                        done();
                    });
                });

                it('should set user.salt to the generated salt', function (done) {
                   createUser().then(function (user) {
                       var generatedSalt = saltSpy.getCall(0).returnValue;
                       expect(user.salt).to.be.equal(generatedSalt);
                       done();
                   });
                });

                it('should set user.password to the encrypted password', function () {
                    createUser().then(function (user) {
                        var createdPassword = encryptSpy.getCall(0).returnValue;
                        expect(user.password).to.be.equal(createdPassword);
                        done();
                    });
                });

            });

        });

    });

    describe('documents property', function() {

        it('is an array of Document model references', function(done) {

            var documentInfo = {
                title: 'About Educa.re'
            };

            var userInfo = {
                email: 'nastia@fullstack.com',
                password: 'UkraineRulez'
            };

            Document.createAsync(documentInfo)
                .then(function(document) {
                    userInfo.documents = [document._id];
                    return User.createAsync(userInfo);
                })
                .then(function(user) {
                    expect(user.documents).to.be.an('array');
                    return Document.findByIdAsync(user.documents[0]);
                })
                .then(function(document) {
                    expect(document).to.exist;
                    expect(document.title).to.be.equal('About Educa.re');
                    done();
                })
                .catch(done);

        });

    });

    describe('bookmarks property', function() {

        it('is an array of Document model references', function(done) {

            var document1 = new Document({
                title: 'About Educa.re'
            });

            var document2 = new Document({
                title: 'Nunya Business!'
            });

            var userInfo = {
                email: 'nastia@fullstack.com',
                password: 'UkraineRulez',
                bookmarks: [document1._id, document2._id]
            };

            q.all([document1.saveAsync(), document2.saveAsync()])
                .then(function() {
                    return User.createAsync(userInfo)
                })
                .then(function(user) {
                    expect(user.bookmarks).to.be.an('array');
                    expect(user.bookmarks[0]).to.be.equal(document1._id);
                    expect(user.bookmarks[1]).to.be.equal(document2._id);
                    done();
                })
                .catch(done);

        });

    });

    describe('name.full virtual', function() {

        it('returns a string of name.first and name.last', function(done) {

            var userInfo = {
                email: 'nastia@fullstack.com',
                password: 'UkraineRulez',
                name: {
                    first: 'Nastia',
                    last: 'Sergiienko'
                }
            };

            User.createAsync(userInfo)
                .then(function(user) {
                    expect(user.name.full).to.be.equal('Nastia Sergiienko');
                    done();
                })
                .catch(done);

        });

    });


});
