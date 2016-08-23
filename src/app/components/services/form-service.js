(function(){
  'use strict';

  angular.module('flowmanager')
         .service('FormService', FormService);

 function FormService() {

    return {
        fields:[
            {
                name : 'output',
                value : 'OUTPUT'
            },
            {
                name : 'pushvlan',
                value : 'PUSH VLAN'
            },
            {
                name : 'pushmpls',
                value : 'PUSH MPLS'
            },
            {
                name : 'popmpls',
                value : 'POP MPLS'
            },
            {
                name : 'swapmpls',
                value : 'SWAP MPLS'
            },
            {
                name : 'drop',
                value : 'DROP'
            }
        ]
        
    };

  }
})();
