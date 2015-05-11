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

    console.log(user);



    $scope.docInfo = {
        newContent: document.currentVersion,
        message: $scope.message,
        document: document
    }
    $scope.createUserFolder = function(){
        DocumentFactory.createDocument().then(function(response){
          console.log('created', response);
      });
    };

    document.author = user._id;
    $scope.saveUserDocument = function(docInfo){
        DocumentFactory.saveDocument(docInfo).then(function(response){
            console.log('saved', response);
        })
    };

});

app.factory('DocumentFactory', function($http){

    return {
        createDocument: function(){
            return $http.post('api/document/').then(function(response){
                return response.data;
            });
        },
        saveDocument: function(doc){
            return $http.put('api/document/', doc).then(function(response){
                return response.data;
            });
        },
        getDocument: function(docId){
            return $http.get('api/document/' + docId).then(function(response){
                return response.data;
            })
        },
        getUserDocuments: function(userId){
            return $http.get('api/document' + userId).then(function(response){
                return response.data;
            })
        }
    }

});
