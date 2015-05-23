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
                return AuthService.getLoggedInUser();
            },
            commits: function(DocumentFactory, $stateParams){
                return DocumentFactory.commitHistory($stateParams.docId);
            }
        }
    });

});


app.controller('DocumentDashboardController', function($scope, $log, $modal, DocumentFactory, user, document, commits, $state, $window){

    $scope.document = document;
    $scope.user = user;

    $scope.commits = commits.filter(function(commit) {
      return commit.authored_date >= document.dateCreated;
    });

//This method returns a modal instance controlled by VersionModalInstanceCtrl with a specified version of a doc
    $scope.showVersion = function(commit, document) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'versionModal',
            controller: 'VersionModalInstanceCtrl',
            size: 'lg',
            resolve: {
                versionContent: function(){
                    return DocumentFactory.getVersion(document._id, commit.id)
                        .then(function(versionContent) {
                            return versionContent;
                        });
                },
                document: function() {
                    return document;
                },
                commit: function() {
                    return commit;
                }
            }
        });
    };

//This method returns a modal instance controlled by PullReqModalInstanceCtrl with a specified pull request 
    $scope.showPullReqs = function (size, document, index, pullRequest) {

        var modalInstance = $modal.open({
            templateUrl: 'pullReqModal',
            controller: 'PullReqModalInstanceCtrl',
            size: size,
            resolve: {
                content: function(){
                    var converter = $window.markdownit({
                        html: true
                    });
                    return converter.render(pullRequest.proposedVersion);
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
    };
});

//A modal instance with a specified version of a doc
app.controller('VersionModalInstanceCtrl', function($scope, $modalInstance, versionContent, $state, $sce, $window, DocumentFactory, document, commit) {
    
    $scope.differentContent = versionContent !== document.currentVersion;

    var converter = $window.markdownit({
        html: true
    });

    $scope.versionContent = $sce.trustAsHtml(converter.render(versionContent));

    $scope.restoreVersion = function() {
        document.currentVersion = versionContent;
        var docInfo = {
            message: 'Restored previous version',
            document: document,
            merge: false
        };
        DocumentFactory.restoreVersion(document._id, commit.id).then(function(restoredDoc) {
            $state.go('editor', { docId: restoredDoc._id });
            $scope.ok();
        });
    };

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
});

//A modal instance with a specified pull request
app.controller('PullReqModalInstanceCtrl', function ($scope, $modalInstance, content, $state, document, index, pullRequest, $sce) {
    $scope.content = $sce.trustAsHtml(content);
    $scope.index = index;
    $scope.pullRequest = pullRequest;

    $scope.mergeChanges = function(){
        $state.go('editor', {docId:document._id, pullReq: index});
        $scope.ok();
    };

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
});


