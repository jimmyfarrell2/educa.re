'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema.Types;
var Promise = require('bluebird');
var git = Promise.promisifyAll(require('gift'));
Promise.promisifyAll(mongoose);


var schema = new mongoose.Schema({
    title: {type: String, default:'untitled'},
    public: {type: Boolean, default: false},
    readAccess: [{type: Schema.ObjectId, ref: 'User'}],
    editAccess: [{type: Schema.ObjectId, ref: 'User'}],
    author: {type: Schema.ObjectId, ref: 'User'},
    references: [String],
    pathToRepo: String,
    currentVersion: String
});


schema.virtual('repo').get(function(){
    return Promise.promisifyAll(git(this.pathToRepo));
});

schema.methods.getCurrentVersion = function(){

    return this.repo.current_commitAsync()
        .then(function(commit){
            return commit;
        })

};

schema.methods.getHistory = function(num){

    return this.repo.commitsAsync('master', num)
        .then(function(commits){
            return commits;
        })

};

mongoose.model('Document', schema);