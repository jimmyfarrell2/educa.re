
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


app.controller('UserDashboardController', function($scope, $stateParams, userDocuments, user, $state){

    $scope.userDocuments = userDocuments;
    $scope.user = user;
    $scope.goToEdit = function(documentId){
        $state.go('editor', {docId: documentId});
    }


});

