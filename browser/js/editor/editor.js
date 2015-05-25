app.config(function($stateProvider) {

    $stateProvider.state('editor', {
        url: '/editor/:docId/:pullReq',
        controller: 'EditorController',
        templateUrl: 'js/editor/editor.html',
        onEnter: function($anchorScroll) {
            $anchorScroll();
        },
        resolve: {
            document: function(DocumentFactory, $stateParams) {
                return DocumentFactory.getDocument($stateParams.docId);
            },
            user: function(AuthService) {
                return AuthService.getLoggedInUser();
            },
            commits: function(DocumentFactory, $stateParams) {
                return DocumentFactory.commitHistory($stateParams.docId);
            }
        }
    });

});


app.controller('EditorController', function($scope, DocumentFactory, $state, document, user, commits, $window, $stateParams, Socket) {

    $scope.branch = $stateParams.pullReq;

   $scope.categories = [
        'health',
        'education',
        'science',
        'food',
        'travel',
        'politics',
        'art',
        'other'
    ];

    var originalCurrentVersion = document.currentVersion;
    var originalTitle = document.title;
    var originalCategory = document.category;

    var editAccess = document.editAccess.map(user => user._id.toString());
    if (user._id.toString() === document.author._id.toString() ||
        editAccess.indexOf(user._id.toString()) > -1) {
            $scope.canEdit = true;
    }
    else {
        $scope.canEdit = false;
    }

    var collaborators = new Bloodhound({
        datumTokenizer: function(datum) {
            var firstNameTokens = Bloodhound.tokenizers.whitespace(datum.name.first);
            var lastNameTokens = Bloodhound.tokenizers.whitespace(datum.name.last);
            return firstNameTokens.concat(lastNameTokens, datum.email, datum.username);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/api/search?type=user&q=%QUERY',
            wildcard: '%QUERY'
        }
    });

    $('#search-collaborators').typeahead({
        hint: false
    }, {
        name: 'users',
        limit: 10,
        display: 'username',
        source: collaborators,
        templates: {
            suggestion: function(datum) {
                return '<div id="searchResults">' + datum.username + '</em></div>';
            },
            notFound: '<div>No matching users</div>'
        }
    }).on('typeahead:selected', function (obj, datum) {
        $scope.docInfo.collaborator = datum._id;
        DocumentFactory.addCollaborator($scope.docInfo).then(function(doc) {
            $scope.document.editAccess.length++;
            $('#search-collaborators').val('');
        });
    });

    $scope.changeMade = function(docInfo) {
        if (originalCurrentVersion !== sanitize(docInfo.document.currentVersion) ||
            originalTitle !== $scope.docInfo.document.title ||
            originalCategory !== $scope.docInfo.category) return true;
        else return false;
    };

    var converter = $window.markdownit({
        html: true
    });

    if (document.currentVersion === "") {
        $scope.contentToHtml = "<p>Begin writing here...</p>";
    }
    else if ($stateParams.pullReq && $stateParams.pullReq !== 'branch') {
        DocumentFactory.mergeDocument(document, document.pullRequests[$stateParams.pullReq]).then(function(diff){
            diff = diff.replace(/>#/g, ">\n#");
            $scope.contentToHtml = converter.render(diff);
        });
    }
    else {
        $scope.contentToHtml = converter.render(document.currentVersion);
    }


    function sanitize(content) {
        return content.replace(/<\/?(ins|del)[^<]*>/g, '').replace(/<\/?span[^<]*>/g, '');
    }


    $scope.markdownOptions = {
        extensions: {
            "markdown": new MeMarkdown(function(md) {
                document.currentVersion = md;
            })
        }
    };

    $scope.docInfo = {
        message: $scope.message,
        document: document,
        merge: false
    };

    $scope.seeDashboard = function() {
        $state.go("documentDashboard", {
            docId: document._id
        });
    };

    $scope.checked = false;
    $scope.toggle = function() {
        $scope.checked = !$scope.checked;
    };

    $scope.isNotUser = user._id !== document.author._id;
    $scope.isUser = !$scope.isNotUser;
    $scope.isBranched = document.branchedFrom;

   
    $scope.pullRequestMessage = {
        mes: $scope.mes
    }
    $scope.pullRequests = document.pullRequests;
    $scope.commits = commits;
    $scope.document = document;
    $scope.numPullRequests = document.pullRequests.length;

    $scope.commits = commits.filter(function(commit) {
      return commit.authored_date >= document.dateCreated;
    });



    $scope.branchDocument = function() {
        $scope.docInfo.document.tags = $scope.docInfo.document.tags.map(function(tag){
            return tag.text;
        });
        DocumentFactory.branchOtherDocument($scope.docInfo.document).then(function(doc) {
            $state.go('editor', {
                docId: doc._id,
                pullReq: 'branch'
            });
        });
    };


    $scope.createUserFolder = function() {
        DocumentFactory.createDocument().then(function(doc) {
            $state.go('editor', {
                docId: doc._id
            });
        });
    };

    $scope.makePullRequest = function() {
        DocumentFactory.makePullRequest(document, $scope.pullRequestMessage.mes).then(function(doc) {
            console.log(doc);
        });
    };

 
    $scope.saveUserDocument = function(docInfo) {
        $window.$(".popover.top.fade.in").removeClass('in');
        $window.$(".saveMessage").val("");
        if($stateParams.pullReq) {
            docInfo.merge = true;
            $scope.numPullRequests--;
        }
        docInfo.document.currentVersion = sanitize(docInfo.document.currentVersion);
        docInfo.document.tags = docInfo.document.tags.map(function(tag){
            return tag.text;
        });
        DocumentFactory.saveDocument(docInfo).then(function(document) {
        });
    };

    $scope.getridOfPopup = function(){
        $window.$(".popover.top.fade.in").removeClass('in').addClass('out');
        $window.$(".savePullReqMessage").val("");
    };

    $scope.goToUserProfile = function(){
        $state.go('userProfile', {userId: user._id});
    };

    $scope.exportDocument = function(docId){
        DocumentFactory.exportDocument(docId);
    };

    $scope.hasLikedCheck = function(document){
        return user.likedDocuments.indexOf(document._id) > -1;
    };

    $scope.hasLiked = $scope.hasLikedCheck(document);

    $scope.likeDoc = function(){
        DocumentFactory.likeDocument($scope.docInfo.document._id).then(function (doc) {
            $scope.hasLiked = !$scope.hasLiked;
            if($scope.hasLiked) $scope.docInfo.document.likes++;
            else $scope.docInfo.document.likes--;
        });

    };

    $scope.hasAddedCheck = function(document){
        return user.bookmarks.indexOf(document._id) > -1;
    };

    $scope.hasAdded = $scope.hasAddedCheck(document);
    $scope.addToBookmarks = function(){
        DocumentFactory.addToBookmark($scope.docInfo.document._id).then(function(doc){
            $scope.hasAdded = !$scope.hasAdded;
        });
    };
});

app.directive('contenteditable', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            element.on('blur', function() {
                scope.$apply(function() {
                    ctrl.$setViewValue(element.html());
                });
            });
            ctrl.$render = function() {
                element.html(ctrl.$viewValue);
            };
        }
    };
});

app.controller('PopoverDemoCtrl', function ($scope) {
  $scope.dynamicPopover = {
    content: 'Write your message!',
    templateUrl: 'myPopoverTemplate.html',
    title: 'Title'
  };
});

app.controller('PullReqMessageCtrl', function ($scope) {
  $scope.dynamicPopover = {
    content: 'Suggest your changes!',
    templateUrl: 'pullReq.html',
    title: 'Title'
  };
});


app.controller('BranchAlertCtrl', function ($scope) {
  $scope.alerts = [
    { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'success', msg: 'Well done! This is now your version of the author\'s document.' }
  ];

  $scope.addAlert = function() {
    $scope.alerts.push({msg: 'Great! You just successfully saggested changes to the author!'});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
