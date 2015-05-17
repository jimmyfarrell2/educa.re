app.config(function($stateProvider) {

    $stateProvider.state('userList', {
        url: '/userList',
        controller: 'UserListController',
        templateUrl: 'js/userList/userList.html',
        resolve: {
            users: function(UserFactory){
                return UserFactory.getUsers();
            }
        }
    });

});


app.controller('UserListController', function($scope, users){
    $scope.users = users;
});


