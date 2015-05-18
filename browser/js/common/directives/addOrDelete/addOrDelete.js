'use strict';
app.directive('addOrDelete', function ($window, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl){
            console.log('attrs', attrs)
            console.log('scope', scope)

            //How can we refactor this to not use setTimeout?
            setTimeout(function(){

                var elementToDelete;
                element.find('del').mouseover(function(){
                    elementToDelete = $window.$(this);
                    if(elementToDelete.children('button').length === 0){
                        elementToDelete.append('<button>x</button>');
                        elementToDelete.children('button').click(function(){
                            var currentVersion = '';
                            elementToDelete.replaceWith("");
                            //console.log('viewValue', ctrl.$viewValue)
                            element.contents().each(function () {
                                //check if it is a text node
                                if (this.nodeType == 3) {
                                    //if so get the node value for the element
                                    currentVersion += this.nodeValue;
                                } else {
                                    //if not use outerHTML or innerHTML based on need
                                    currentVersion += this.outerHTML;
                                }
                            })
                            scope.document.currentVersion = $window.toMarkdown(currentVersion)
                            scope.$digest();
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
                            ctrl.$setViewValue('');
                            scope.$digest();
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
