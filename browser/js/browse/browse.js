'use strict';
app.config(function($stateProvider) {

    $stateProvider.state('browse', {
        url: '/browse',
        templateUrl: 'js/browse/browse.html',
        controller: 'BrowseController',
    });

});

app.controller('BrowseController', function($scope) {

   $scope.categories = [
        'health',
        'education',
        'science',
        'food',
        'travel',
        'politics',
        'art',
        'other'
    ];

});
