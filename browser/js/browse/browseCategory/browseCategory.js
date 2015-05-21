'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('browse.category', {
        url: '/:categoryName',
        templateUrl: 'js/browse/browseCategory/browseCategory.html',
        controller: 'BrowseCategoryController',
        resolve: {
            documents: function(DocumentFactory, $stateParams) {
                return DocumentFactory.getAllDocuments($stateParams.categoryName);
            },
            user: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        }
    });
});

app.controller('BrowseCategoryController', function($scope, documents, user) {

    $scope.documents = documents;
    $scope.user = user;

});
