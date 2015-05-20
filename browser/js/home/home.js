'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function($scope, $state, DocumentFactory, Upload, AuthService){

    $scope.isLoggedIn = function () {
        return AuthService.isAuthenticated();
    };

    var documents = new Bloodhound({
        datumTokenizer: function(datum) {
            var titleTokens = Bloodhound.tokenizers.whitespace(datum.title);
            var currentVersionTokens = Bloodhound.tokenizers.whitespace(datum.currentVersion);
            return titleTokens.concat(currentVersionTokens);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/api/search?type=all&q=%QUERY',
            wildcard: '%QUERY'
        }
    });

    $('#search-documents').typeahead(null, {
        name: 'documents',
        limit: 10,
        display: 'title',
        source: documents,
        templates: {
            suggestion: function(datum) {
                if (datum.title) {
                    return '<div><strong>Document:</strong> ' + datum.title + ' <em>' + datum.author.username + '</em></div>';
                }
                else {
                    return '<div><strong>User:</strong> ' + datum.username + '</em></div>';
                }
            },
            notFound: '<div>No matching documents</div>'
        }
    }).on('typeahead:selected', function (obj, datum) {
        if (datum.title) $state.go('editor', {docId: datum._id});
        else $state.go('userProfile', {userId: datum._id})
        console.log("datum", datum);
    });




});
