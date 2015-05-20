'use strict';
app.config(function($stateProvider) {

    $stateProvider.state('browse', {
        url: '/browse',
        templateUrl: 'js/browse/browse.html',
        controller: 'BrowseController',
        resolve: {
            documents: function(DocumentFactory) {
                return DocumentFactory.getAllDocuments();
            },
            user: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        }
    });

});

app.controller('BrowseController', function($scope, DocumentFactory, documents, user) {

   $scope.categories = [
        'Health',
        'Education',
        'Science',
        'Food',
        'Travel',
        'Politics',
        'Art',
        'Other'
    ];

    $scope.documents = documents;
    $scope.user = user;

});
