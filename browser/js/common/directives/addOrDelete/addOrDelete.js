'use strict';
app.directive('addOrDelete', function ($window, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl){

            //How can we refactor this to not use setTimeout?
            setTimeout(function(){

                var updateCurrentVersion = function() {
                    var currentVersion = '';
                    element.contents().each(function () {
                        if (this.nodeType == 3) {
                            currentVersion += this.nodeValue;
                        } else {
                            currentVersion += this.outerHTML;
                        }
                    });
                    scope.document.currentVersion = $window.toMarkdown(currentVersion)
                    scope.$digest();
                };

                var elementToDelete;
                element.find('del').mouseover(function(){
                    elementToDelete = $window.$(this);
                    if(elementToDelete.children('button').length === 0){
                        elementToDelete.append('<button>x</button>');
                        elementToDelete.children('button').click(function(){
                            elementToDelete.replaceWith("");
                            updateCurrentVersion();
                        });
                    }
                });

                var elementToKeep;
                element.find('ins').mouseover(function(){
                    elementToKeep = $window.$(this);
                    if(elementToKeep.children('button').length === 0 && !elementToKeep.hasClass('clearIns')){
                        elementToKeep.append('<button>+</button>');
                        elementToKeep.children('button').click(function(){
                            elementToKeep.addClass('clearIns');
                            updateCurrentVersion();
                        });
                    }
                });

                element.find('del').mouseleave(function(){
                        $window.$(this).find('button').remove();
                });

                element.find('ins').mouseleave(function(){
                    $window.$(this).find('button').remove();
                });

            }, 1000);

        }
    };

});
