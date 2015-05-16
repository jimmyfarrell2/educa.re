app.config(function($stateProvider) {

    $stateProvider.state('diffView', {
        url: '/editor/:docId/:pullReq',
        controller: 'DiffController',
        templateUrl: 'js/diffView/diffView.html',
        resolve: {
            document: function(DocumentFactory, $stateParams) {
                return DocumentFactory.getDocument($stateParams.docId);
            }
        }
    });

});

app.controller('DiffController', function($scope, document, DocumentFactory, $stateParams){

    DocumentFactory.mergeDocument(document, document.pullRequests[$stateParams.pullReq]).then(function(diff){
        console.log(diff)
    });

});