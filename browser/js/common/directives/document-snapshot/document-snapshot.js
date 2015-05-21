'use strict';
app.directive('documentSnapshot', function(DocumentFactory, $window, $sce) {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/document-snapshot/document-snapshot.html',
        scope: {
            document: '=',
            user: '='
        },
        transclude: true,
        link: function(scope, element, attrs) {

            var converter = $window.markdownit({
                html: true
            });

            scope.document.currentVersion = $sce.trustAsHtml(converter.render(scope.document.currentVersion.substr(0, 350) + '...'));


            scope.hasAddedCheck = function(document){
                return scope.user.bookmarks.indexOf(scope.document._id) > -1;
            };

            scope.hasAdded = scope.hasAddedCheck(scope.document);

            scope.toggleBookmark = function(){
                DocumentFactory.addToBookmark(scope.document._id).then(function(doc){
                    scope.hasAdded = !scope.hasAdded;
                });
            };

        }
    };
});
