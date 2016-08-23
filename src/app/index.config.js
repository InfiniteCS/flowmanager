(function() {
  'use strict';

    angular
        .module('flowmanager')
        .config(config);

    /** @ngInject */
    function config($mdThemingProvider) {
        $mdThemingProvider.definePalette('firstPalette', {
            '50': '19BAAB',
            '100': '19BAAB',
            '200': '19BAAB',
            '300': '19BAAB',
            '400': '19BAAB',
            '500': '008CD0',
            '600': '19BAAB',
            '700': '19BAAB',
            '800': '19BAAB',
            '900': '19BAAB',
            'A100': '19BAAB',
            'A200': '19BAAB',
            'A400': '19BAAB',
            'A700': '19BAAB',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': ['500'],
            'contrastLightColors': undefined
        });
        $mdThemingProvider.theme('default')
            .primaryPalette('firstPalette')
            .accentPalette('firstPalette')
    }
})();
