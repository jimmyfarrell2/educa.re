app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('editor.update', {
        url: '/editor/update',
        controller: 'EditorUpdateController',
        controllerAs: 'EditUpdateCtrl',
        templateUrl: 'js/editor/editorUpdate/editorUpdate.html'
    });

});