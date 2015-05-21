'use strict';
app.factory('DocumentFactory', function($http) {

    return {
        createDocument: function() {
            return $http.post('api/documents/').then(function(response) {
                return response.data;
            });
        },
        saveDocument: function(docInfo) {
            return $http.put('api/documents/' + docInfo.document._id, docInfo).then(function(response) {
                return response.data;
            });
        },
        getDocument: function(docId) {
            return $http.get('api/documents/' + docId).then(function(response) {
                return response.data;
            });
        },
        getUserDocuments: function(userId) {
            return $http.get('api/user/' + userId + '/documents').then(function(response) {
                return response.data;
            });
        },
        branchOtherDocument: function(doc) {
            return $http.post('api/collaborate/branch', doc).then(function(response) {
                return response.data;
            });
        },
        makePullRequest: function(doc, message) {
            var data = {
                document: doc,
                message: message
            };
            return $http.post('api/collaborate/pullRequest', data).then(function(response) {
                return response.data;
            });
        },
        mergeDocument: function(doc, pullRequest) {
            var data = {
               document: doc,
               pullRequest: pullRequest
           };
           return $http.put('api/collaborate/merge', data).then(function(response) {
               return response.data;
           });
        },
        getAllDocuments: function(categoryName) {
            return $http.get('/api/documents?category=' + categoryName).then(function(response) {
                return response.data;
            });
        },
        commitHistory: function(docId) {
            return $http.get('/api/documents/' + docId + '/commits').then(function(response) {
                return response.data;
            });
        },
        getVersion: function(docId, commitId) {
            return $http.get('/api/documents/' + docId + '/commits/' + commitId).then(function(response) {
                return response.data;
            });
        },
        restoreVersion: function(docId, commitId) {
            return $http.put('/api/documents/' + docId + '/restore/' + commitId).then(function(response) {
                return response.data;
            });
        },
        exportDocument: function(docId) {
            return $http.get('/api/documents/' + docId + '/export').then(function(response) {
                return response.data;
            });
        },
        likeDocument: function(docId){
            return $http.put('/api/documents/' + docId + '/likes').then(function(response){
                return response.data;
            });
        },
        addToBookmark: function(docId){
            return $http.put('/api/documents/' + docId + '/bookmarks').then(function(response){
                return response.data;
            });
        }
    };

});

