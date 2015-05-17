app.factory('UserFactory', function($http, $q) {
    return {
        createNewUser : function(newUser) {
            return $http.post('/api/user', newUser)
                .then(function(response) {
                    return response.body;
                })
                .catch(function(response) {
                    console.log(response);
                    return $q.reject({message : 'Unable to Sign Up'});
                });
        },
        getUserDocuments: function(userId){
            return $http.get('/api/user/' + userId + '/documents').then(function(response){
                return response.data;
            });
        },

        removeNotifications: function(docId) {
            return $http.put('/api/documents/' + docId + '/removeNotification').then(function (response) {
                return response.data;
            })
        },
        getUser: function(userId){
            return $http.get('/api/user/'+ userId).then(function(response){
                return response.data;
            });
        },
        getUsers: function(){
            return $http.get('/api/user').then(function(response){
                return response.data;
            });
        }
    };
});