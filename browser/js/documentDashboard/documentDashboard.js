app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('documentDashboard', {
        url: '/document-dashboard/:docId',
        controller: 'DocumentDashboardController',
        templateUrl: 'js/documentDashboard/documentDashboard.html',
        resolve: {
            document: function(DocumentFactory, $stateParams){
                return DocumentFactory.getDocument($stateParams.docId);
            },
            user: function(AuthService){
                return AuthService.getLoggedInUser()
            },
            commits: function(DocumentFactory, $stateParams){
                return DocumentFactory.commitHistory($stateParams.docId);
            }
        }
    });

});


app.controller('DocumentDashboardController', function($scope, DocumentFactory, user, document, commits){
    $scope.commits = commits;
    $scope.document = document;
    $scope.user = user;

})