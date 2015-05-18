'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function($scope, $state, DocumentFactory){

    var documents = new Bloodhound({
        datumTokenizer: function(datum) {
            var titleTokens = Bloodhound.tokenizers.whitespace(datum.title);
            var currentVersionTokens = Bloodhound.tokenizers.whitespace(datum.currentVersion);
            return titleTokens.concat(currentVersionTokens);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/api/search?type=document&q=%QUERY',
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
                return '<div>' + datum.title + ' <em>' + datum.author.name.first + ' ' + datum.author.name.last + '</em></div>';
            },
            notFound: '<div>No matching documents</div>'
        }
    });

    $scope.createDocument = function(){
        DocumentFactory.createDocument().then(function(doc){
            $state.go('editor', {docId: doc._id});
        });
    };
});
