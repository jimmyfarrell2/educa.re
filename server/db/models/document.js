'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema.Types;
var Promise = require('bluebird');
var git = Promise.promisifyAll(require('gift'));


var schema = new mongoose.Schema({
    title: String,
    public: {type: Boolean, default: false},
    readAccess: [{type: Schema.ObjectId, ref: 'User'}],
    editAccess: [{type: Schema.ObjectId, ref: 'User'}],
    author: {type: Schema.ObjectId, ref: 'User'},
    references: [String],
    pathToRepo: String
});


schema.virtual('repo').get(function(){
    return Promise.promisifyAll(git(this.pathToRepo));
});

schema.methods.getCurrentVersion = function(){

    return this.repo.current_commitAsync()
        .then(function(commit){
            return commit;
        })
        .catch(function(err){
            return err;
        });

};

schema.methods.getHistory = function(num){

    return this.repo.commitsAsync('master', num)
        .then(function(commits){
            return commits;
        })
        .catch(function(err){
            return err;
        });

};

mongoose.model('Document', schema);