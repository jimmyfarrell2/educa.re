app.config(function($stateProvider) {

    $stateProvider.state('userProfile.userDocuments', {
        url: '/userDocuments',
        controller: 'UserDocsController',
        templateUrl: 'js/userProfile/userDocuments/userDocuments.html',
        resolve: {
            user: function(AuthService){
                return AuthService.getLoggedInUser()
            }
        }
    });

});

app.controller('UserDocsController', function($scope, Socket, UserFactory, user, $state, DocumentFactory, UserFactory){
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
        })
    }
});