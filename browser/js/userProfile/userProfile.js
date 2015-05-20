app.config(function($stateProvider) {

    $stateProvider.state('userProfile', {
        url: '/userProfile/:userId',
        controller: 'UserProfileController',
        templateUrl: 'js/userProfile/userProfile.html',
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


app.controller('UserProfileController', function($scope, user, Socket, UserFactory){

    $scope.documents = [];

    UserFactory.getUserDocuments(user._id).then(function(docs){
        $scope.documents = docs.splice(docs.length - 3, 3);
        console.log(docs);
    });

    $scope.user = user;
});


