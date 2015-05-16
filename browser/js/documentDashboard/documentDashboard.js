app.config(function ($stateProvider) {

    $stateProvider.state('documentDashboard', {
        url: '/document-dashboard/:docId',
        controller: 'DocumentDashboardController',
        templateUrl: 'js/documentDashboard/documentDashboard.html',
        resolve: {
            document: function(DocumentFactory, $stateParams){
                return DocumentFactory.getDocument($stateParams.docId);
            },
            user: function(AuthService){
                return AuthService.getLoggedInUser()
            },
            commits: function(DocumentFactory, $stateParams){
                return DocumentFactory.commitHistory($stateParams.docId);
            }
        }
    });

});


app.controller('DocumentDashboardController', function($scope, $log, $modal, DocumentFactory, user, document, commits, $state){


    $scope.commits = commits;
    console.log($scope.commits);
    $scope.document = document;
    $scope.user = user;

  $scope.tabs = [
    { title:'Dynamic Title 1', content:'Dynamic content 1' },
    { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
  ];

  $scope.alertMe = function() {
    
  };

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size, document, index, pullRequest) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        content: function(){
            return pullRequest.proposedVersion;
        },
        document: function(){
            return document;
        },
        index: function(){
            return index;
        },
        pullRequest: function(){
            return pullRequest;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };
});


app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, content, $state, document, index, pullRequest) {
    $scope.content = content;
    $scope.index = index;
    $scope.pullRequest = pullRequest;

  $scope.mergeChanges = function(){
    $state.go('editor', {docId:document._id, pullReq: index});
    $scope.ok();
    }

  $scope.ok = function () {
    $modalInstance.close($scope.selected);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});