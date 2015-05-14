
app.config(function ($stateProvider) {

    $stateProvider.state('userDashboard', {
        url: '/userDashboard/:userId',
        controller: 'UserDashboardController',
        controllerAs: 'UserDashboardCtrl',
        templateUrl: 'js/userDashboard/userDashboard.html',
        resolve: {
            userDocuments: function(DocumentFactory, $stateParams){
                    return DocumentFactory.getUserDocuments($stateParams.userId);
            },
            user: function(AuthService){
                return AuthService.getLoggedInUser();
            }   
        }
    });
});


app.controller('UserDashboardController', function($scope, UserDashboardFactory, $stateParams, userDocuments, user){

    $scope.userDocuments = userDocuments;
    $scope.user = user;


});

