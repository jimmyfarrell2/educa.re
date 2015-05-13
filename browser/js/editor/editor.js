app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('editor', {
        url: '/editor/:docId',
        controller: 'EditorController',
        controllerAs: 'EditCtrl',
        templateUrl: 'js/editor/editor.html',
        resolve: {
            document: function(DocumentFactory, $stateParams){
                if($stateParams.docId == 'new') {
                    return {};
                }
                else return DocumentFactory.getDocument($stateParams.docId);
            },
            user: function(AuthService){
                return AuthService.getLoggedInUser()
            }
        }
    });

});


app.controller('EditorController', function($scope, DocumentFactory, $stateParams, document, user){

    $scope.message = 'a message';
    $scope.pullRequests = document.pullRequests;

    $scope.branchDocument = function(){
        console.log("document", document);
        DocumentFactory.branchOtherDocument(document).then(function(doc){
            console.log(doc);
        });
    };

    $scope.mergeDocument = function(pullRequest){
        DocumentFactory.mergeDocument(document, pullRequest).then(function(diff){
            console.log(diff);
        });
    }

    $scope.docInfo = {
        message: $scope.message,
        document: document
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
        DocumentFactory.saveDocument(docInfo).then(function(response){
            console.log('saved', response);
        })
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
        }
    }

});
