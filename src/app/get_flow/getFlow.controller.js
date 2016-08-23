(function() {
    'use strict';

    angular
        .module('flowmanager')
        .controller('GetFlowController', GetFlowController)
        .filter('range', function() {
            return function(input, total) {
                total = parseInt(total);
                for (var i=0; i < total; i++) {
                    input.push(i);
                }
                return input;
            };
        });

    /** @ngInject */
    function GetFlowController($mdDialog, $window, $http, Base64) {

        var vm = this;
        vm.switchIDList = [];

        vm.populateSwitchId = populateSwitchId;
        vm.getFlow = getFlow;
        vm.clear = clear;
        vm.deleteFlow = deleteFlow;

        //function to populate switchID
        function populateSwitchId() {
            var arrayLength = $window.localStorage.getItem("flowmanager.dataLength");
            for (var i = 0; i < arrayLength; i++) {
                 vm.switchIDList.push($window.localStorage.getItem("flowmanager.idArray" + i));
            }
        }

        //function to retrieve flows from the controller
	function getFlow($event) {
            var IP = $window.localStorage.getItem("flowmanager.IP");
            var port = $window.localStorage.getItem("flowmanager.port");
            var username = $window.localStorage.getItem("flowmanager.username");
            var password = $window.localStorage.getItem("flowmanager.password");

            var flowURL = 'http://' + IP + ':' + port + '/restconf/config/opendaylight-inventory:nodes/node/' + vm.switchID;
            var auth = "Basic " + Base64.encode(username + ':' + password);
            var config = {
                headers : {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                }
            }

            vm.flowID = [];
            vm.flowName = [];
            vm.priority = [];
            vm.tableID = [];
            vm.match = [];
            vm.action = [];
            vm.count = 0;
            var matchTemp, actionTemp;
            $http.get(flowURL, config)
                .success(function(data) {
                    vm.data = data;
                    var tableCount = vm.data.node[0]['flow-node-inventory:table'].length;
          
                    for (var i = 0; i < tableCount; i++) {
                        if (vm.data.node[0]['flow-node-inventory:table'][i].flow == undefined) {
                            continue;
                        }
                        var flowCount = vm.data.node[0]['flow-node-inventory:table'][i].flow.length;
                        for (var j = 0; j < flowCount; j++) {
                            vm.count++;
                            vm.flowID.push(vm.data.node[0]['flow-node-inventory:table'][i].flow[j].id);
                            vm.flowName.push(vm.data.node[0]['flow-node-inventory:table'][i].flow[j]["flow-name"]);
                            vm.priority.push(vm.data.node[0]['flow-node-inventory:table'][i].flow[j].priority);
                            vm.tableID.push(vm.data.node[0]['flow-node-inventory:table'][i].flow[j].table_id);
                            if (vm.data.node[0]['flow-node-inventory:table'][i].flow[j].match == undefined) {
                                vm.match.push("None");
                            }
                            else {
                                matchTemp = angular.toJson(vm.data.node[0]['flow-node-inventory:table'][i].flow[j].match, 1);
                                vm.match.push(matchTemp);
                            }
                            if (vm.data.node[0]['flow-node-inventory:table'][i].flow[j].instructions == undefined) {
                                vm.action.push("None");
                            }
                            else {
                                actionTemp = angular.toJson(vm.data.node[0]['flow-node-inventory:table'][i].flow[j].instructions.instruction[0]["apply-actions"].action, 1);
				vm.action.push(actionTemp);
                            }
                        }
                    }
                    if (vm.count == 0) {
                        if ($event != "DeleteFlowFlag") {
                            $mdDialog.show( {
                                targetEvent: $event,
                                template: '<md-dialog>' +
                                          '  <md-dialog-content class="md-padding">' + 
                                          '    <h4>Empty</h4>' +
                                          '    <p>No flows found</p>' +
                                          '  </md-dialog-content>' +
                                          '</md-dialog>',
                                clickOutsideToClose: true
                            });
                        }
                    }
                    else {
                        if ($event != "DeleteFlowFlag") {
                            $mdDialog.show( {
                                targetEvent: $event,
                                template: '<md-dialog>' +
                                          '  <md-dialog-content class="md-padding">' + 
                                          '    <h4>SUCCESS</h4>' +
                                          '    <p>Flow successfully added.</p>' +
                                          '  </md-dialog-content>' +
                                          '</md-dialog>',
                                clickOutsideToClose: true
                            });
                        }
                    }
                })
                .error(function(data, status) {
                    $mdDialog.show( {
                        targetEvent: $event,
                        template: '<md-dialog>' +
                                  '  <md-dialog-content class="md-padding">' + 
                                  '    <h4>ERROR</h4>' +
                                  '    <p>Retrieving Flows unsuccessful.</p>' +
                                  '    <p>Error code : ' + status + '</p>' +
                                  '  </md-dialog-content>' +
                                  '</md-dialog>',
                        clickOutsideToClose: true
                    });
                });
        }

            //function to clear the manage page
        function clear($event) {
            vm.switchIDList = [];
            delete vm.switchID;
            delete vm.flow_id;
            delete vm.flow_name;
            delete vm.priority;
            delete vm.table_id;
            delete vm.match;
            delete vm.action;
            delete vm.count;
            populateSwitchId();
            $mdDialog.show( {
                targetEvent: $event,
                template: '<md-dialog>' +
                          '  <md-dialog-content class="md-padding">' + 
                          '    <h4>Clear</h4>' +
                          '    <p>Page cleared</p>' +
                          '  </md-dialog-content>' +
                          '</md-dialog>',
                clickOutsideToClose: true
            });
        }

            //function to delete a selected flow
        function deleteFlow($event) {
            var IP = $window.localStorage.getItem("flowmanager.IP");
            var port = $window.localStorage.getItem("flowmanager.port");
            var username = $window.localStorage.getItem("flowmanager.username");
            var password = $window.localStorage.getItem("flowmanager.password");

            var flowURL = 'http://' + IP + ':' + port + '/restconf/config/opendaylight-inventory:nodes/node/' + vm.switchID + '/table/' + vm.tableIdDelete + '/flow/' + vm.flowIdDelete;
            var auth = "Basic " + Base64.encode(username + ':' + password);
            var config = {
                headers : {
                    'Authorization': auth
                }
            }

            $http.delete(flowURL, config)
                .success(function() {
                    getFlow("DeleteFlowFlag");
                    $mdDialog.show( {
                        targetEvent: $event,
                        template: '<md-dialog>' +
                                  '  <md-dialog-content class="md-padding">' + 
                                  '    <h4>SUCCESS</h4>' +
                                  '    <p>Flow successfully deleted.</p>' +
                                  '  </md-dialog-content>' +
                                  '</md-dialog>',
                        clickOutsideToClose: true
                    });
                })
                .error(function(data, status) {
                    $mdDialog.show ({
                        targetEvent: $event,
                        template: '<md-dialog>' +
                                  '  <md-dialog-content class="md-padding">' + 
                                  '    <h4>ERROR</h4>' +
                                  '    <p>Deleting Flow unsuccessful.</p>' +
                                  '    <p>Error code : ' + status + '</p>' +
                                  '  </md-dialog-content>' +
                                  '</md-dialog>',
                        clickOutsideToClose: true
                    });
                });
        }

    }
})();
