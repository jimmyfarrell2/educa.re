app.config(function($stateProvider) {

    $stateProvider.state('userProfile', {
        url: '/userProfile/:userId',
        controller: 'UserProfileController',
        templateUrl: 'js/userProfile/userProfile.html',
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


app.controller('UserProfileController', function($scope, user, Socket, UserFactory){

    $scope.documents = [];

    $scope.likes;

    function userLikes(docs){
        var sum = 0;
        docs.forEach(function(doc){
            sum += doc.likes;
        })
        $scope.likes = sum;
    }


    UserFactory.getUserDocuments(user._id).then(function(docs){
        userLikes(docs);
        $scope.documents = docs.splice(docs.length - 3, 3);
    });

    $scope.user = user;
});


