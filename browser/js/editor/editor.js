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


app.controller('EditorController', function($scope, DocumentFactory, $state, document, user, commits, $window, $stateParams) {

    var collaborators = new Bloodhound({
        datumTokenizer: function(datum) {
            var firstNameTokens = Bloodhound.tokenizers.whitespace(datum.name.first);
            var lastNameTokens = Bloodhound.tokenizers.whitespace(datum.name.last);
            return firstNameTokens.concat(lastNameTokens, datum.email);
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
        display: 'email',
        source: collaborators,
        templates: {
            suggestion: function(datum) {
                return '<div>' + datum.name.first + ' ' + datum.name.last + ' <em>' + datum.email + '</em></div>';
            },
            notFound: '<div>No matching users</div>'
        }
    }).on('typeahead:selected', function (obj, datum) {
       $state.go('userProfile', {userId: datum._id})
        console.log("datum", datum);
    });

    var converter = $window.markdownit({
        html: true
    });

    if(document.currentVersion === "") {
        $scope.contentToHtml = "<h1>Title</h1><br/><p>Start your story...</p>";
    }
    else if($stateParams.pullReq) {
        DocumentFactory.mergeDocument(document, document.pullRequests[$stateParams.pullReq]).then(function(diff){
            diff = diff.replace(/>#/g, ">\n#");
            $scope.contentToHtml = converter.render(diff);
        });
    }
    else {
        $scope.contentToHtml = converter.render(document.currentVersion);
    }


    function sanitize(content) {
        return content.replace(/<\/?(ins( \w*="\w*")?|del)>/g, '');
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
        DocumentFactory.saveDocument(docInfo).then(function(document) {

        });
    };

    $scope.goToUserProfile = function(){
        $state.go('userProfile', {userId: user._id});
    };

});

app.factory('DocumentFactory', function($http) {

    return {
        createDocument: function() {
            return $http.post('api/documents/').then(function(response) {
                return response.data;
            });
        },
        saveDocument: function(docInfo) {
            return $http.put('api/documents/' + docInfo.document._id, docInfo).then(function(response) {
                return response.data;
            });
        },
        getDocument: function(docId) {
            return $http.get('api/documents/' + docId).then(function(response) {
                return response.data;
            });
        },
        getUserDocuments: function(userId) {
            return $http.get('api/user/' + userId + '/documents').then(function(response) {
                return response.data;
            });
        },
        branchOtherDocument: function(doc) {
            return $http.post('api/collaborate/branch', doc).then(function(response) {
                return response.data;
            });
        },
        makePullRequest: function(doc, message) {
            var data = {
                document: doc,
                message: message
            };
            return $http.post('api/collaborate/pullRequest', data).then(function(response) {
                return response.data;
            });
        },
        mergeDocument: function(doc, pullRequest) {
           var data = {
               document: doc,
               pullRequest: pullRequest
           };
           return $http.put('api/collaborate/merge', data).then(function(response) {
               return response.data;
           });
        },
        getAllDocuments: function() {
            return $http.get('/api/documents/').then(function(response) {
                return response.data;
            });
        },
        commitHistory: function(docId) {
            return $http.get('/api/documents/' + docId + '/commits').then(function(response) {
                return response.data;
            });
        }
    };

});
