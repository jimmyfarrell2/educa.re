'use strict';
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state, DocumentFactory, $modal, Upload) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

            scope.createDocument = function(){
                DocumentFactory.createDocument().then(function(doc){
                    $state.go('editor', {docId: doc._id});
                });
            };

            scope.items = [
                { label: 'Browse', state: 'browse', auth: false }
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
        $scope.validState = toState.name === "home" ||  toState.name === 'userProfile' || toState.name === 'userProfile.userDocuments';
    });
});

app.controller('InstanceCtrl', function ($scope, $modalInstance, Upload, $state) {


    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: '/api/upload',
                    fields: {'username': $scope.username},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    $modalInstance.close();
                    $state.go('editor', {docId: data._id});
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                });
            }
        }
    };

    $scope.$watch('files', function (newVal, oldVal) {
        $scope.upload(newVal);
    });


    $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

