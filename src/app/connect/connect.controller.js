(function() {
    'use strict';

    angular
        .module('flowmanager')
        .controller('ConnectController', ConnectController)
        .filter('range', function() {
            return function(input, total) {
                total = parseInt(total);
                    for (var i=0; i < total; i++) {
                        input.push(i);
                    }
                return input;
            };
        });

    function ConnectController($window, $http, $mdDialog, $location, Base64) {

        var vm = this;

        vm.controller = [];
        vm.controller.push( {
            name: [
                {"id": "ODL", "title": "OpenDayLight"}
            ],
            controllerConfig : {
                type: ""
            }
        });

        vm.IP = $window.localStorage.getItem("flowmanager.IP");
        vm.port = $window.localStorage.getItem("flowmanager.port");
        vm.username = $window.localStorage.getItem("flowmanager.username");
        vm.password = $window.localStorage.getItem("flowmanager.password");
        vm.controller[0].controllerConfig.type = $window.localStorage.getItem("flowmanager.controllerType");

        vm.arrayLength = $window.localStorage.getItem("flowmanager.dataLength");
        vm.switchID = [];
        vm.onChange = onChange;
        vm.init = init;
        vm.clearForm = clearForm;
        vm.connectToController = connectToController;

        function init () {
            for (var i = 0; i < vm.arrayLength; i++) {
                vm.switchID.push($window.localStorage.getItem("flowmanager.idArray" + i));
            }
        }

        //function to store Controller Information in localstorage
        function onChange(inputVariable) {
            if (inputVariable == 'IP') {
                if (vm.IP == undefined) {
                    $window.localStorage.setItem("flowmanager.IP", "");
                }
                else {
                    $window.localStorage.setItem("flowmanager.IP", vm.IP);
                }
            }
            if (inputVariable == 'port') {
                if (vm.port == undefined) {
                    $window.localStorage.setItem("flowmanager.port", "");
                }
                else {
                    $window.localStorage.setItem("flowmanager.port", vm.port);
                }
            }
            if (inputVariable == 'username') {
                if (vm.username == undefined) {
                    $window.localStorage.setItem("flowmanager.username", "");
                }
                else {
                    $window.localStorage.setItem("flowmanager.username", vm.username);
                }
            }
            if (inputVariable == 'password') {
                if (vm.password == undefined) {
                    $window.localStorage.setItem("flowmanager.password", "");
                }
                else {
                    $window.localStorage.setItem("flowmanager.password", vm.password);
                }
            }
            if (inputVariable == 'type') {
                $window.localStorage.setItem("flowmanager.controllerType", vm.controller[0].controllerConfig.type);
            }
        }

        //function to clear the controller page
        function clearForm($event) {
            vm.IP = '';
            vm.port = '';
            vm.username = '';
            vm.password = '';
            vm.controller[0].controllerConfig.type = '';
            $window.localStorage.removeItem("flowmanager.IP");
            $window.localStorage.removeItem("flowmanager.port");
            $window.localStorage.removeItem("flowmanager.username");
            $window.localStorage.removeItem("flowmanager.password");
            $window.localStorage.removeItem("flowmanager.controllerType");
            $window.localStorage.removeItem("flowmanager.dataLength");
            for (var i = 0; i < vm.arrayLength; i++) {
                $window.localStorage.removeItem("flowmanager.idArray" + i);
            }
            vm.arrayLength = null;
            $mdDialog.show( {
                targetEvent: $event,
                template: '<md-dialog>' +
                          '    <md-dialog-content class="md-padding">' + 
                          '        <h4>Clear Form</h4>' +
                          '        <p>Connect to Controller form cleared</p>' +
                          '    </md-dialog-content>' +
                          '</md-dialog>',
                clickOutsideToClose: true
            });
        }

        //function to connect to the controller
        function connectToController($event) {
            var connectUrl = 'http://' + vm.IP + ':' + vm.port + '/restconf/operational/opendaylight-inventory:nodes';
            var auth = 'Basic ' + Base64.encode(vm.username + ':' + vm.password);

            $http({
                method: 'GET',
                url: connectUrl,
                headers: {'Authorization': auth}
                })
                .success(function(data) {
                    if (!data.nodes.node) {
                        $mdDialog.show({
                        targetEvent: $event,
                        template: '<md-dialog>' +
                                  '  <md-dialog-content class="md-padding">' + 
                                  '    <h4>ERROR</h4>' +
                                  '    <p>Controller does not contain nodes.</p>' +
                                  '  </md-dialog-content>' +
                                  '</md-dialog>',
                        clickOutsideToClose: true
                        });
                        $window.localStorage.removeItem("flowmanager.dataLength");
                        vm.arrayLength = $window.localStorage.getItem("flowmanager.dataLength");
                    }
                    else {
                        $window.localStorage.setItem("flowmanager.dataLength", data.nodes.node.length);
                        vm.arrayLength = $window.localStorage.getItem("flowmanager.dataLength");
                        for (var i = 0; i < vm.arrayLength; i++) {
                            $window.localStorage.setItem("flowmanager.idArray" + i, data.nodes.node[i].id);
                            vm.switchID[i] = angular.copy($window.localStorage.getItem("flowmanager.idArray" + i));
                        }
                        $mdDialog.show( {
                            targetEvent: $event,
                            template: '<md-dialog>' +
                                      '  <md-dialog-content class="md-padding">' + 
                                      '    <h4>SUCCESS</h4>' +
                                      '    <p>Controller successfully connected.</p>' +
                                      '  </md-dialog-content>' +
                                      '</md-dialog>',
                            clickOutsideToClose: true
                        });
                    }
                })
                .error(function(data, status) {
                    $mdDialog.show( {
                        targetEvent: $event,
                        template: '<md-dialog>' +
                                  '  <md-dialog-content class="md-padding">' + 
                                  '    <h4>ERROR!</h4>' +
                                  '    <p>Controller connection unsuccessful</p>' +
                                  '    <p>HTTP error code : ' + status + '</p>' +
                                  '  </md-dialog-content>' +
                                  '</md-dialog>',
                        clickOutsideToClose: true
                    });
                });
        }

        //function to select switch ID for create page
        vm.switchStorage = function(switchIDChosen) {
            $window.localStorage.setItem("flowmanager.switchID", switchIDChosen);
            $location.path("/create");
        }

    }
})();
