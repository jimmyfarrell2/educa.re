app.config(function($stateProvider) {

    $stateProvider.state('userProfile', {
        url: '/userProfile/:userId',
        controller: 'UserProfileController',
        templateUrl: 'js/userProfile/userProfile.html',
        resolve: {
            user: function(AuthService){
                return AuthService.getLoggedInUser()
            }
        }
    });

});


app.controller('UserProfileController', function($scope, user){
    $scope.user = user;
});


