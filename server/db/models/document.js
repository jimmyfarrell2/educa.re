'use strict';

var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var Promise = require('bluebird');
var git = Promise.promisifyAll(require('gift'));
Promise.promisifyAll(mongoose);


var schema = new mongoose.Schema({
    title: {
        type: String,
        default: 'untitled'
    },
    public: {
        type: Boolean,
        default: false
    },
    author: {
        type: Types.ObjectId, ref: 'User'
    },
    branchedFrom: {
        type: Types.ObjectId, ref: 'User'
    },
    readAccess: [{
        type: Types.ObjectId, ref: 'User'
    }],
    editAccess: [{
        type: Types.ObjectId, ref: 'User'
    }],
    references: [String],
    pathToRepo: String,
    currentVersion: {
        type: String,
        default: ''
    },
    pullRequests: [{
        proposedVersion: String,
        author: {
            type: Types.ObjectId, ref: 'User'
        },
        date: Date,
        message: String
    }],
    dateCreated: Date
});


schema.virtual('repo').get(function(){
    return Promise.promisifyAll(git(this.pathToRepo));
});

//schema.methods.getCurrentVersion = function(){

    //return this.repo.current_commitAsync()
        //.then(function(commit){
            //return commit;
        //})

//};

schema.methods.getHistory = function(num){

    return this.repo.commitsAsync(this.author, num)
        .then(function(commits){
            return commits;
        })

};

mongoose.model('Document', schema);
