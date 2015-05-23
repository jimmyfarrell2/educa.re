'use strict';
app.config(function($stateProvider) {

    $stateProvider.state('browse', {
        url: '/browse',
        templateUrl: 'js/browse/browse.html',
        controller: 'BrowseController',
        onEnter: function($anchorScroll) {
            $anchorScroll();
        }
    });

});

app.controller('BrowseController', function($scope, $state) {

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

    $state.go('.category', { category: '' });

});
