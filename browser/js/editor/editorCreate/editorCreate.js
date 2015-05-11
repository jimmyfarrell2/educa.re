app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('editor.create', {
        url: '/editor/create',
        controller: 'EditorCreateController',
        controllerAs: 'EditCreateCtrl',
        templateUrl: 'js/editor/editorCreate/editorCreate.html'
    });

});