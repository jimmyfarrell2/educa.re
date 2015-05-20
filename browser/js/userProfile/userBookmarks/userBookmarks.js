app.config(function($stateProvider) {

    $stateProvider.state('userProfile.myBookmarks', {
        url: '/userBookmarks',
        controller: 'UserBookmarksController',
        templateUrl: 'js/userProfile/userBookmarks/userBookmarks.html',
        resolve: {
            user: function(AuthService, $stateParams, UserFactory){
                if($stateParams.userId){
                    return UserFactory.getUser($stateParams.userId);
                }
                return AuthService.getLoggedInUser();
            }
        }
    });

});

app.controller('UserBookmarksController', function($scope, user, UserFactory){

    $scope.user = user;

    $scope.removeBookmark = function(userId, bookmarkId){
            UserFactory.removeBookmark(userId, bookmarkId).then(function(){
                var bookmarkIndex;
                $scope.user.bookmarks.forEach(function(element, index){
                    if(element._id === bookmarkId){
                        bookmarkIndex = index;
                    }
                });
                $scope.user.bookmarks.splice(bookmarkIndex, 1);
            });
        };
});



