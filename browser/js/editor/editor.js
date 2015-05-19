app.config(function($stateProvider) {

    $stateProvider.state('editor', {
        url: '/editor/:docId/:pullReq',
        controller: 'EditorController',
        templateUrl: 'js/editor/editor.html',
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


   $scope.categories = [
        'Health',
        'Education',
        'Science',
        'Food',
        'Travel',
        'Politics',
        'Art',
        'Other'
    ];


    setInterval(function() {
        $('#click').trigger('click');
    }, 1000);

    var originalCurrentVersion = document.currentVersion;

    var editAccess = document.editAccess.map(user => user._id.toString());
    if (user._id.toString() === document.author._id.toString() ||
        editAccess.indexOf(user._id.toString()) > -1) {
            $scope.canEdit = true;
    }
    else {
        $scope.canEdit = false;
    }

    console.log('big socket', Socket);

    $scope.$on('$destroy', function(){
        console.log('destroying...!');
        Socket.disconnect();
    })

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

    $('#search-collaborators').typeahead(null, {
        name: 'users',
        limit: 10,
        display: 'username',
        source: collaborators,
        templates: {
            suggestion: function(datum) {
                return '<div>' + datum.username + '</em></div>';
            },
            notFound: '<div>No matching users</div>'
        }
    }).on('typeahead:selected', function (obj, datum) {
       $state.go('userProfile', {userId: datum._id})
    });

    $scope.changeMade = function(docInfo) {
        var returnVal;
        if (originalCurrentVersion === sanitize(docInfo.document.currentVersion)) returnVal = false;
        else returnVal = true;
        console.log(returnVal)
        return returnVal;
    };

    var converter = $window.markdownit({
        html: true
    });

    if (document.currentVersion === "") {
        $scope.contentToHtml = "<h1>Title</h1><br/><p>Start your story...</p>";
    }
    else if ($stateParams.pullReq) {
        DocumentFactory.mergeDocument(document, document.pullRequests[$stateParams.pullReq]).then(function(diff){
            diff = diff.replace(/>#/g, ">\n#");
            $scope.contentToHtml = converter.render(diff);
        });
    }
    else {
        $scope.contentToHtml = converter.render(document.currentVersion);
    }


    function sanitize(content) {
        return content.replace(/<\/?(ins|del).*>/g, '').replace(/<\/?span.*>/g, '');
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

    //refactor so that user's can actually input a message
    $scope.message = 'a message';
    $scope.pullRequests = document.pullRequests;
    $scope.commits = commits;
    $scope.document = document;


    $scope.branchDocument = function() {
        DocumentFactory.branchOtherDocument($scope.docInfo.document).then(function(doc) {
            $state.go('editor', {
                docId: doc._id
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
        DocumentFactory.makePullRequest(document, 'this is a message!').then(function(doc) {
            console.log(doc);
        });
    };

    $scope.saveUserDocument = function(docInfo) {
        if($stateParams.pullReq) docInfo.merge = true;
        docInfo.document.currentVersion = sanitize(docInfo.document.currentVersion);
        docInfo.document.tags = docInfo.document.tags.map(function(tag){
            return tag.text;
        });
        console.log(docInfo.document)
        DocumentFactory.saveDocument(docInfo).then(function(document) {

        });
    };

    $scope.goToUserProfile = function(){
        $state.go('userProfile', {userId: user._id});
    };

    $scope.exportDocument = function(docId){
        DocumentFactory.exportDocument(docId);
    };

});
