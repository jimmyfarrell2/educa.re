//need to implement more advanced search

app.config(function ($stateProvider) {

    $stateProvider.state('search', {
        url: '/search/:query',
        controller: 'SearchController',
        controllerAs: 'SearchCtrl',
        templateUrl: 'js/search/search.html',
        resolve: {
            allDocuments: function(DocumentFactory){
               return DocumentFactory.getAllDocuments();
            }
        }
    });

});


app.controller('SearchController', function($scope, SearchFactory, $stateParams, allDocuments){

    $scope.allDocuments = allDocuments;
    //whatever we return from our drowdown in navbar
    $scope.criteria = '';

});

app.filter('byQuery', function(){
//criteria: author, category (will probably be an array), title
    return function(documents, criteria, query){
        if (criteria === 'category'){
            return documents.filter(function(element){
                return _.includes(element.categories, query);
            });
        }
        else return _.where(documents, {criteria: query});
    };
});
