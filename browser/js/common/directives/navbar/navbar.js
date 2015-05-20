'use strict';
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state, DocumentFactory, $modal) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

            scope.items = [
                { label: 'My Profile', state: 'userProfile({userId: user._id})', auth: true }
            ];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                   $state.go('home');
                });
            };

            var setUser = function () {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function () {
                scope.user = null;
            };

            setUser();

            scope.createDocument = function(){
                DocumentFactory.createDocument().then(function(doc){
                $state.go('editor', {docId: doc._id});
                });
            };

            scope.open = function () {
                console.log("openFunc");
            var modalInstance = $modal.open({
              animation: scope.animationsEnabled,
              templateUrl: 'mynew.html',
              controller: 'InstanceCtrl'
            });
            };

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }



    };

});

app.controller('windowCtrl', function($scope, $window, $rootScope) {
    $scope.topLevel = true;
    $scope.validState = true;

    $(window).on('scroll', function() {
        if ($window.scrollY > 30) {
            $scope.topLevel = false;
        } else {
            $scope.topLevel = true;
        }
        $scope.$digest();
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        $scope.validState = toState.name === "home" || toState.name === "editor" || toState.name === 'userProfile' || toState.name === 'userProfile.userDocuments';
    });
});



// app.controller('UploadCtrl', function ($scope, $modal) {


//   $scope.animationsEnabled = true;



//   $scope.toggleAnimation = function () {
//     $scope.animationsEnabled = !$scope.animationsEnabled;
//   };

// });

app.controller('InstanceCtrl', function ($scope, $modalInstance) {


  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});



// app.controller('UploadCtrl', function($scope, $modal) {

//       $scope.animationsEnabled = true;

//      $scope.open = function (size) {

//     var modalInstance = $modal.open({
//       templateUrl: 'some.html',
//       controller: 'InstanceCtrl',
//       size: size
//     });
// };
// });

// app.controller('InstanceCtrl', function ($scope, $modalInstance) {

//   $scope.ok = function () {
//     $modalInstance.close($scope.selected.item);
//   };

//   $scope.cancel = function () {
//     $modalInstance.dismiss('cancel');
//   };
// });