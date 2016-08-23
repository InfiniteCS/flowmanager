(function() {
  'use strict';

    angular
        .module('flowmanager')
        .config(routeConfig);

    function routeConfig($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/connect/connect.html',
                controller: 'ConnectController',
                controllerAs: 'connect'
            })
            .when('/create', {
                templateUrl: 'app/create_flow/createFlow.html',
                controller: 'CreateFlowController',
                controllerAs: 'createFlow'
            })
            .when('/manage', {
                templateUrl: 'app/get_flow/getFlow.html',
                controller: 'GetFlowController',
                controllerAs: 'getFlow'
            })
            .otherwise( {
                redirectTo: '/'
            });
    }

})();
