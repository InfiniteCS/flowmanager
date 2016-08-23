(function() {
  'use strict';

    angular
        .module('flowmanager')
        .run(runBlock);

  /** @ngInject */
    function runBlock($log) {

        $log.debug('runBlock end');
  }

})();
