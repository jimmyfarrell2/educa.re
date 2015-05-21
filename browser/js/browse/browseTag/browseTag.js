'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('browse.tag', {
        url: '/tag/:tagName',
        templateUrl: 'js/browse/browseTag/browseTag.html',
        controller: 'BrowseTagController',
        resolve: {
            documents: function(DocumentFactory, $stateParams) {
                return DocumentFactory.getByTag($stateParams.tagName);
            },
            user: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        }
    });
});

app.controller('BrowseTagController', function($scope, documents, user) {

    $scope.documents = documents;
    $scope.user = user;

});
