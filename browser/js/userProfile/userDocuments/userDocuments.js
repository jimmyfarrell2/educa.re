app.config(function($stateProvider) {

    $stateProvider.state('userProfile.userDocuments', {
        url: '/:userId/userDocuments',
        controller: 'UserDocsController',
        templateUrl: 'js/userProfile/userDocuments/userDocuments.html',
        resolve: {
            user: function(AuthService, $stateParams, UserFactory){
                if($stateParams.userId){
                    return UserFactory.getUser($stateParams.userId);
                }
                return AuthService.getLoggedInUser();
            }
        }
    });

});

app.controller('UserDocsController', function($scope, Socket, UserFactory, user, $state, DocumentFactory){

    $scope.documents = '';

    UserFactory.getUserDocuments(user._id).then(function(docs){
        $scope.documents = docs;
    });

    Socket.on('successfulMerge', function(data){
        UserFactory.getUserDocuments(user._id).then(function(docs){
            $scope.documents = docs;
            console.log(docs);
        });
    });

    $scope.removeFromNotifications = function(docId){
        UserFactory.removeNotifications(docId).then(function(doc){
            console.log(doc);
        });
    };

});
