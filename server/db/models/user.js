'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema.Types;
var Promise = require('bluebird');
var validator = require('validator');
Promise.promisifyAll(mongoose);


var schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: [ validator.isEmail, 'invalid email' ]
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    twitter: {
        id: String,
        username: String,
        token: String,
        tokenSecret: String
    },
    facebook: {
        id: String
    },
    google: {
        id: String
    },
    name: {
        first: String,
        last: String
    },
    documents: [{type: Schema.ObjectId, ref: 'Document'}],
    bookmarks: [String]
});

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

schema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

schema.virtual('name.full').get(function() {
    return this.name.first + ' ' + this.name.last;
});

mongoose.model('User', schema);
