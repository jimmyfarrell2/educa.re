app.config(function ($stateProvider) {

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

  $scope.tabs = [
    { title:'Dynamic Title 1', content:'Dynamic content 1' },
    { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
  ];

  $scope.alertMe = function() {
    
  };
});
