app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('editor', {
        url: '/editor/:docId',
        controller: 'EditorController',
        templateUrl: 'js/editor/editor.html',
        resolve: {
            document: function(DocumentFactory, $stateParams){
                if($stateParams.docId === 'new') {
                    return {};
                }
                else return DocumentFactory.getDocument($stateParams.docId);
            },
            user: function(AuthService){
                return AuthService.getLoggedInUser()
            },
            commits: function(DocumentFactory, $stateParams){
                if($stateParams.docId === 'new'){
                    return {};
                }
                else return DocumentFactory.commitHistory($stateParams.docId);
            }
        }
    });

});


app.controller('EditorController', function($scope, DocumentFactory, $stateParams, document, user, commits, $window){
    var converter = $window.markdownit();

    $scope.markdownOptions = {
        extensions: {
            "markdown": new MeMarkdown(function(md){
                document.currentVersion = md;
            })
        }
    };

    $scope.contentToHtml = converter.render(document.currentVersion);


    $scope.docInfo = {
        message: $scope.message,
        document: document
    }



    $scope.checked = false; // This will be binded using the ps-open attribute
    $scope.toggle = function(){
        $scope.checked = !$scope.checked
    };

    $scope.message = 'a message';
    $scope.pullRequests = document.pullRequests;
    $scope.commits = commits;
    $scope.document = document;


    $scope.branchDocument = function(){
        DocumentFactory.branchOtherDocument($scope.docInfo.document).then(function(doc){
        });
    };

    $scope.getDiff = function(pullRequest){
        DocumentFactory.mergeDocument($scope.docInfo.document, pullRequest).then(function(diff){

            console.log(converter.render(diff).replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
                //
            //$scope.docInfo.content = converter.render(diff);
        });
    }


    $scope.createUserFolder = function(){
        DocumentFactory.createDocument().then(function(response){
          console.log('created', response);
      });
    };

    $scope.makePullRequest = function(){
        DocumentFactory.makePullRequest(document, 'this is a message!').then(function(doc){
            console.log(doc);
        });
    };

    $scope.saveUserDocument = function(docInfo){
        DocumentFactory.saveDocument(docInfo).then(function(document){

        });
    };


});

app.factory('DocumentFactory', function($http){

    return {
        createDocument: function(){
            return $http.post('api/documents/').then(function(response){
                return response.data;
            });
        },
        saveDocument: function(docInfo){
            return $http.put('api/documents/' + docInfo.document._id, docInfo).then(function(response){
                return response.data;
            });
        },
        getDocument: function(docId){
            return $http.get('api/documents/' + docId).then(function(response){
                return response.data;
            })
        },
        getUserDocuments: function(userId){
            return $http.get('api/user/' + userId + '/documents').then(function(response){
                return response.data;
            })
        },
        branchOtherDocument: function(doc){
            return $http.post('api/collaborate/branch', doc).then(function(response){
                return response.data;
            })
        },
        makePullRequest: function(doc, message){
            var data = {document: doc, message: message};
            return $http.post('api/collaborate/pullRequest', data).then(function(response){
                return response.data;
            })
        },
        mergeDocument: function(doc, pullRequest){
            var data = {document: doc, pullRequest: pullRequest}
            return $http.put('api/collaborate/merge', data).then(function(response){
                return response.data;
            })
        },
        getAllDocuments: function(){
            return $http.get('/api/document/').then(function(response){
                return response.data;
            })
        },
        commitHistory: function(docId){
            return $http.get('/api/commits/' + docId).then(function(response){
                return response.data;
            })
        }
    }

});
