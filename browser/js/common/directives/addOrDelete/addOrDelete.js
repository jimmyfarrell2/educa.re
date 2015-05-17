'use strict';
app.directive('addOrDelete', function ($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs){

            angular.element(document).ready(function(){

            })


            setTimeout(function(){

                var elementToDelete;
                element.find('del').mouseover(function(){
                    elementToDelete = $window.$(this);
                    if(elementToDelete.children('button').length === 0){
                        elementToDelete.append('<button>x</button>');
                        elementToDelete.children('button').click(function(){
                            elementToDelete.remove();
                        })
                    }
                })

                element.find('del').mouseleave(function(){
                        $window.$(this).find('button').remove();
                });
            }, 1000);

        }
    }
});