app.config(function($stateProvider) {

    $stateProvider.state('userProfile', {
        url: '/userProfile',
        controller: 'UserProfileController',
        templateUrl: 'js/userProfile/userProfile.html',
        resolve: {
            user: function(AuthService){
                return AuthService.getLoggedInUser()
            }
        }
    });

});


app.controller('UserProfileController', function($scope, user, Socket){
    $scope.user = user;
});


