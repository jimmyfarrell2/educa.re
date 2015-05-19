app.config(function($stateProvider) {

    $stateProvider.state('userProfile.myBookmarks', {
        url: '/userBookmarks',
        controller: 'UserBookmarksController',
        templateUrl: 'js/userProfile/userBookmarks/userBookmarks.html'
    });

});

app.controller('UserBookmarksController', function($scope, user){
    console.log("user", user.bookmarks)
    });



