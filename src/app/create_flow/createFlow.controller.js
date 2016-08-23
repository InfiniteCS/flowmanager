(function() {
    'use strict';

    angular
        .module('flowmanager')
        .controller('CreateFlowController', CreateFlowController)
        .animation('.slide', function() {
            var NG_HIDE_CLASS = 'ng-hide';
            return {
                beforeAddClass: function(element, className, done) {
                    if(className === NG_HIDE_CLASS) {
                        element.slideUp(done);
                    }
                },
                removeClass: function(element, className, done) {
                    if(className === NG_HIDE_CLASS) {
                        element.hide().slideDown(done);
                    }
                }
            }
        });

    /** @ngInject */
    function CreateFlowController(FormService, $mdDialog, $window, clipboard, $http, Base64) {

        var vm = this;
        var flowData = {};
        vm.isFlowNotReady = true;
        vm.switchIDList = [];
        vm.switchIDChosen = $window.localStorage.getItem("flowmanager.switchID");

        //select options
        vm.IPtypes = [];
        vm.IPtypes.push( {
            IPtype: [
                {"id": "ipv4", "title": "IPv4"},
                {"id": "ipv6", "title": "IPv6"}
            ],
            IPconfig : {
                type: ""
            }
        });

        vm.protocols = [];
        vm.protocols.push ( {
            protocolType: [
                {"id": "tcp", "title": "TCP"},
                {"id": "udp", "title": "UDP"}
            ],
            protocolConfig : {
                type: ""
            }
        });

        //action fields initialization
        vm.form = {};
        vm.form.form_fields = [];
        vm.drop = false;
        // add new field drop-down:
        vm.addField = {};
        vm.addField.types = FormService.fields;
        vm.addField.new = vm.addField.types[0].name;
        vm.addField.lastAddedID = 0;
      
        //accordion one at a time
        vm.accordion = {};
        vm.accordion.oneAtATime = false;
        //accordion drag fields
        vm.elementDragged = false;
  
        vm.sortableOptions = {
            axis: 'y',
            'ui-floating': true,
            distance: '20',
            start: function() {
                vm.elementDragged = true;
            },
            stop: function() {
            // stop is not late enough or not recognized by angular (workaround with timeout?)
            }
        };


        //global functions initialization
        vm.ifMatchCollapsed = ifMatchCollapsed;
        vm.ifActionCollapsed = ifActionCollapsed;
        vm.addNewField = addNewField;
        vm.showAddOptions = showAddOptions;
        vm.showGoToTable = showGoToTable;
        vm.showPushVlan = showPushVlan;
        vm.showPushMpls = showPushMpls;
        vm.showSwapMpls = showSwapMpls;
        vm.showPopMpls = showPopMpls;
        vm.showDrop = showDrop;
        vm.action_output = action_output;
        vm.deleteField = deleteField;
        vm.displayJSON = displayJSON;
        vm.clearForm = clearForm;
        vm.copyFlow = copyFlow;
        vm.init = init;
        vm.pushFlow = pushFlow;


        //Check if match or action is collapsed
        function ifMatchCollapsed() {
          vm.matchCollapsed=!vm.matchCollapsed;
        }

        function ifActionCollapsed() {
            vm.actionCollapsed=!vm.actionCollapsed;
        }

        function populateSwitchId() {
            //Populate Switch ID select box
            var arrayLength = $window.localStorage.getItem("flowmanager.dataLength");
            for (var i = 0; i < arrayLength; i++) {
                vm.switchIDList.push($window.localStorage.getItem("flowmanager.idArray" + i));
            }
        }

        function init() {
            //Initializing base fields
            vm.flowName = $window.localStorage.getItem("flowmanager.flowName");
            if (vm.flowName == undefined) {
                vm.flowName = '';
            }
            vm.priority = $window.localStorage.getItem("flowmanager.priority");
            if (vm.priority == undefined) {
                vm.priority = '';
            }
            vm.tableID = $window.localStorage.getItem("flowmanager.tableID");
            if (vm.tableID == undefined) {
                vm.tableID = '';
            }
            vm.flowID = $window.localStorage.getItem("flowmanager.flowID");
            if (vm.flowID == undefined) {
                vm.flowID = '';
            }
            vm.hardTimeout = $window.localStorage.getItem("flowmanager.hardTimeout");
            if (vm.hardTimeout == undefined) {
                vm.hardTimeout = '';
            }
            vm.idleTimeout = $window.localStorage.getItem("flowmanager.idleTimeout");
            if (vm.idleTimeout == undefined) {
                vm.idleTimeout = '';
            }
            vm.cookie = $window.localStorage.getItem("flowmanager.cookie");
            if (vm.cookie == undefined) {
                vm.cookie = '';
            }
            vm.cookieMask = $window.localStorage.getItem("flowmanager.cookieMask");
            if (vm.cookieMask == undefined) {
                vm.cookieMask = '';
            }
            vm.installHwSwitch = $window.localStorage.getItem("flowmanager.installHwSwitch");
            if (vm.installHwSwitch == "false" || vm.installHwSwitch == undefined) {
                vm.installHwSwitch = false;
            }
            else if (vm.installHwSwitch == "true") {
                vm.installHwSwitch = true;
            }
            vm.barrierSwitch = $window.localStorage.getItem("flowmanager.barrierSwitch");
            if (vm.barrierSwitch == "false" || vm.barrierSwitch == undefined) {
                vm.barrierSwitch = false;
            }
            else if (vm.barrierSwitch == "true") {
                vm.barrierSwitch = true;
            }
            vm.strictSwitch = $window.localStorage.getItem("flowmanager.strictSwitch");
            if (vm.strictSwitch == "false" || vm.strictSwitch == undefined) {
                vm.strictSwitch = false;
            }
            else if (vm.strictSwitch == "true") {
                vm.strictSwitch = true;
            }

            //Initializing Match Fields
            //Pipeline
            vm.inPort = $window.localStorage.getItem("flowmanager.inPort");
            if (vm.inPort == undefined) {
                vm.inPort = '';
            }
            vm.metadata = $window.localStorage.getItem("flowmanager.metadata");
            if (vm.metadata == undefined) {
                vm.metadata = '';
            }
            vm.metadataMask = $window.localStorage.getItem("flowmanager.metadataMask");
            if (vm.metadataMask == undefined) {
                vm.metadataMask = '';
            }
            vm.tunnelId = $window.localStorage.getItem("flowmanager.tunnelId");
            if (vm.tunnelId == undefined) {
                vm.tunnelId = '';
            }

            //Ethernet
            vm.sourceMAC = $window.localStorage.getItem("flowmanager.sourceMAC");
            if (vm.sourceMAC == undefined) {
                vm.sourceMAC = '';
            }
            vm.destMAC = $window.localStorage.getItem("flowmanager.destMAC");
            if (vm.destMAC == undefined) {
                vm.destMAC = '';
            }
            vm.ethType = $window.localStorage.getItem("flowmanager.ethType");
            if (vm.ethType == undefined) {
                vm.ethType = '';
            }
            vm.vlanId = $window.localStorage.getItem("flowmanager.vlanId");
            if (vm.vlanId == undefined) {
                vm.vlanId = '';
            }
            vm.vlanPriority = $window.localStorage.getItem("flowmanager.vlanPriority");
            if (vm.vlanPriority == undefined) {
                vm.vlanPriority = '';
            }
            vm.vlanSwitch = $window.localStorage.getItem("flowmanager.vlanSwitch");
            if (vm.vlanSwitch == "false" || vm.vlanSwitch == undefined) {
                vm.vlanSwitch = false;
            }
            else if (vm.vlanSwitch == "true") {
                vm.vlanSwitch = true;
            }

            //IP
            vm.ipv4Source = $window.localStorage.getItem("flowmanager.ipv4Source");
            if (vm.ipv4Source == undefined) {
                vm.ipv4Source = '';
            }
            vm.ipv4Destination = $window.localStorage.getItem("flowmanager.ipv4Destination");
            if (vm.ipv4Destination == undefined) {
                vm.ipv4Destination = '';
            }
            vm.ipv6Source = $window.localStorage.getItem("flowmanager.ipv6Source");
            if (vm.ipv6Source == undefined) {
                vm.ipv6Source = '';
            }
            vm.ipv6Destination = $window.localStorage.getItem("flowmanager.ipv6Destination");
            if (vm.ipv6Destination == undefined) {
                vm.ipv6Destination = '';
            }
            vm.ipProtocol = $window.localStorage.getItem("flowmanager.ipProtocol");
            if (vm.ipProtocol == undefined) {
                vm.ipProtocol = '';
            }
            vm.ipECN = $window.localStorage.getItem("flowmanager.ipECN");
            if (vm.ipECN == undefined) {
                vm.ipECN = '';
            }
            vm.ipDSCP = $window.localStorage.getItem("flowmanager.ipDSCP");
            if (vm.ipDSCP == undefined) {
                vm.ipDSCP = '';
            }
            vm.ipv6Label = $window.localStorage.getItem("flowmanager.ipv6Label");
            if (vm.ipv6Label == undefined) {
                vm.ipv6Label = '';
            }
            vm.ipv6ExtHeader = $window.localStorage.getItem("flowmanager.ipv6ExtHeader");
            if (vm.ipv6ExtHeader == undefined) {
                vm.ipv6ExtHeader = '';
            }

            //Transport
            vm.tcpSourcePort = $window.localStorage.getItem("flowmanager.tcpSourcePort");
            if (vm.tcpSourcePort == undefined) {
                vm.tcpSourcePort = '';
            }
            vm.tcpDestPort = $window.localStorage.getItem("flowmanager.tcpDestPort");
            if (vm.tcpDestPort == undefined) {
                vm.tcpDestPort = '';
            }
            vm.udpSourcePort = $window.localStorage.getItem("flowmanager.udpSourcePort");
            if (vm.udpSourcePort == undefined) {
                vm.udpSourcePort = '';
            }
            vm.udpDestPort = $window.localStorage.getItem("flowmanager.udpDestPort");
            if (vm.udpDestPort == undefined) {
                vm.udpDestPort = '';
            }

            //ICMP
            vm.icmpv4Type = $window.localStorage.getItem("flowmanager.icmpv4Type");
            if (vm.icmpv4Type == undefined) {
                vm.icmpv4Type = '';
            }
            vm.icmpv4Code = $window.localStorage.getItem("flowmanager.icmpv4Code");
            if (vm.icmpv4Code == undefined) {
                vm.icmpv4Code = '';
            }
            vm.icmpv6Type = $window.localStorage.getItem("flowmanager.icmpv6Type");
            if (vm.icmpv6Type == undefined) {
                vm.icmpv6Type = '';
            }
            vm.icmpv6Code = $window.localStorage.getItem("flowmanager.icmpv6Code");
            if (vm.icmpv6Code == undefined) {
                vm.icmpv6Code = '';
            }

            //MPLS
            vm.mplsLabel = $window.localStorage.getItem("flowmanager.mplsLabel");
            if (vm.mplsLabel == undefined) {
                vm.mplsLabel = '';
            }
            vm.mplsTC = $window.localStorage.getItem("flowmanager.mplsTC");
            if (vm.mplsTC == undefined) {
                vm.mplsTC = '';
            }
            vm.mplsBOS = $window.localStorage.getItem("flowmanager.mplsBOS");
            if (vm.mplsBOS == undefined) {
                vm.mplsBOS = '';
            }

            //ARP
            vm.arpOP = $window.localStorage.getItem("flowmanager.arpOP");
            if (vm.arpOP == undefined) {
                vm.arpOP = '';
            }
            vm.arpSourceTransportAddress = $window.localStorage.getItem("flowmanager.arpSourceTransportAddress");
            if (vm.arpSourceTransportAddress == undefined) {
                vm.arpSourceTransportAddress = '';
            }
            vm.arpTargetTransportAddress = $window.localStorage.getItem("flowmanager.arpTargetTransportAddress");
            if (vm.arpTargetTransportAddress == undefined) {
                vm.arpTargetTransportAddress = '';
            }
            vm.arpSourceHardwareAddress = $window.localStorage.getItem("flowmanager.arpSourceHardwareAddress");
            if (vm.arpSourceHardwareAddress == undefined) {
                vm.arpSourceHardwareAddress = '';
            }
            vm.arpTargetHardwareAddress = $window.localStorage.getItem("flowmanager.arpTargetHardwareAddress");
            if (vm.arpTargetHardwareAddress == undefined) {
                vm.arpTargetHardwareAddress = '';
            }
            populateSwitchId();
        }

        //Converts base fields to JSON
        function convertBaseFieldsToJSON(flowData) {
            if (vm.flowName != '') {
                flowData.flow.flow__name = angular.copy(vm.flowName);
            }
            if (vm.priority != '') {
                flowData.flow.priority = angular.copy(vm.priority);
            }
            if (vm.tableID != '') {
                flowData.flow.table_id = angular.copy(vm.tableID);
            }
            if (vm.flowID != '') {
                flowData.flow.id = angular.copy(vm.flowID);
            }
            if (vm.hardTimeout != '') {
                flowData.flow.hard__timeout = angular.copy(vm.hardTimeout);
            }
            if (vm.idleTimeout != '') {
                flowData.flow.idle__timeout = angular.copy(vm.idleTimeout);
            }
            if (vm.cookie != '') {
                flowData.flow.cookie = angular.copy(vm.cookie);
            }
            if (vm.cookieMask != '') {
                flowData.flow.cookie_mask = angular.copy(vm.cookieMask);
            } 

            flowData.flow.strict = angular.copy(vm.strictSwitch);
            flowData.flow.barrier = angular.copy(vm.barrierSwitch);
            flowData.flow.installHw = angular.copy(vm.installHwSwitch);
        }

        //Converts match fields to JSON
        function convertMatchFieldsToJSON(flowData) {
            if (vm.inPort != '' || vm.sourceMAC != '' || vm.destMAC != '' || vm.ethType != '' || vm.vlanId != ''  || vm.vlanPriority != '' || vm.vlanSwitch == true || vm.ipv4Source != '' || vm.ipv4Destination != '' || vm.ipv6Source != '' || vm.ipv6Destination != '' || vm.ipProtocol != '' || vm.ipDSCP != '' || vm.ipECN != '' || vm.tcpSourcePort != '' || vm.udpSourcePort != '' || vm.udpDestPort != '' || vm.metadata != '' || vm.metadataMask != '' || vm.ipv6Label != '' || vm.ipv6ExtHeader != '' || vm.icmpv4Type != '' || vm.icmpv4Code != '' || vm.icmpv6Type != '' || vm.icmpv6Code != '' || vm.mplsLabel != '' || vm.mplsTC != '' || vm.mplsBOS != '' || vm.arpOP != '' || vm.arpSourceTransportAddress != '' || vm.arpTargetTransportAddress != '' || vm.arpSourceHardwareAddress != '' || vm.arpTargetHardwareAddress != '' || vm.tunnelId != '') {
                flowData.flow.match = {};
                if (vm.inPort != '') {
                    flowData.flow.match.in__port = angular.copy(vm.inPort);
                }
                if (vm.sourceMAC != '' || vm.destMAC != '' || vm.ethType != '') {
                    flowData.flow.match.ethernet__match = {};
                    if (vm.sourceMAC != '') {
                        flowData.flow.match.ethernet__match.ethernet__source = {};
                        flowData.flow.match.ethernet__match.ethernet__source.address = angular.copy(vm.sourceMAC);
                    }
                    if (vm.destMAC != '') {
                        flowData.flow.match.ethernet__match.ethernet__destination = {};
                        flowData.flow.match.ethernet__match.ethernet__destination.address = angular.copy(vm.destMAC);
                    }
                    if (vm.ethType != '') {
                        flowData.flow.match.ethernet__match.ethernet__type = {};
                        flowData.flow.match.ethernet__match.ethernet__type.type = angular.copy(vm.ethType);
                    }
                }
                if (vm.vlanId != '' || vm.vlanPriority != '' || vm.vlanSwitch == true) {
                    flowData.flow.match.vlan__match = {};
                    if (vm.vlanId != '' || vm.vlanSwitch == true) {
                        flowData.flow.match.vlan__match.vlan__id = {};
                        if (vm.vlanId != '') {
                            flowData.flow.match.vlan__match.vlan__id.vlan__id = angular.copy(vm.vlanId);
                        }
                        if (vm.vlanSwitch == true) {
                            flowData.flow.match.vlan__match.vlan__id.vlan__id__present = angular.copy(vm.vlanSwitch);
                        }
                    }
                    if (vm.vlanPriority != '') {
                        flowData.flow.match.vlan__match.vlan__pcp = angular.copy(vm.vlanPriority);
                    }
                }
                if (vm.ipv4Source != '') {
                    flowData.flow.match.ipv4__source = angular.copy(vm.ipv4Source);
                }
                if (vm.ipv4Destination != '') {
                    flowData.flow.match.ipv4__destination = angular.copy(vm.ipv4Destination);
                }
                if (vm.ipv6Source != '') {
                    flowData.flow.match.ipv6__source = angular.copy(vm.ipv6Source);
                }
                if (vm.ipv6Destination != '') {
                    flowData.flow.match.ipv6__destination = angular.copy(vm.ipv6Destination);
                }
                if (vm.ipProtocol != '' || vm.ipDSCP != '' || vm.ipECN != '') {
                    flowData.flow.match.ip__match = {};
                    if (vm.ipProtocol != '') {
                        flowData.flow.match.ip__match.ip__protocol = angular.copy(vm.ipProtocol);
                    }
                    if (vm.ipDSCP != '') {
                        flowData.flow.match.ip__match.ip__dscp = angular.copy(vm.ipDSCP);
                    }
                    if (vm.ipECN != '') {
                        flowData.flow.match.ip__match.ip__ecn = angular.copy(vm.ipECN);
                    }
                }
                if (vm.tcpSourcePort != '') {
                    flowData.flow.match.tcp__source__port = angular.copy(vm.tcpSourcePort);
                }
                if (vm.tcpDestPort != '') {
                    flowData.flow.match.tcp__destination__port = angular.copy(vm.tcpDestPort);
                }
                if (vm.udpSourcePort != '') {
                    flowData.flow.match.udp__source__port = angular.copy(vm.udpSourcePort);
                }
                if (vm.udpDestPort != '') {
                    flowData.flow.match.udp__destination__port = angular.copy(vm.udpDestPort);
                }
                if (vm.metadata != '' || vm.metadataMask != '') {
                    flowData.flow.match.metadata = {};
                    if (vm.metadata != '') {
                        flowData.flow.match.metadata.metadata = angular.copy(vm.metadata);
                    }
                    if (vm.metadataMask != '') {
                        flowData.flow.match.metadata.metadata__mask = angular.copy(vm.metadataMask);
                    }
                }
                if (vm.ipv6Label != '') {
                    flowData.flow.match.ipv6__label = {};
                    flowData.flow.match.ipv6__label.ipv6__flabel = angular.copy(vm.ipv6Label);
                }
                if (vm.ipv6ExtHeader != '') {
                    flowData.flow.match.ipv6__ext__header = {};
                    flowData.flow.match.ipv6__ext__header.ipv6__exthdr = angular.copy(vm.ipv6ExtHeader);
                }
                if (vm.icmpv4Type != '' || vm.icmpv4Code != '') {
                    flowData.flow.match.icmpv4__match = {};
                    if (vm.icmpv4Type != '') {
                        flowData.flow.match.icmpv4__match.icmpv4__type = angular.copy(vm.icmpv4Type);
                    }
                    if (vm.icmpv4Code != '') {
                        flowData.flow.match.icmpv4__match.icmpv4__code = angular.copy(vm.icmpv4Code);
                    }
                }
                if (vm.icmpv6Type != '' || vm.icmpv6Code != '') {
                    flowData.flow.match.icmpv6__match = {};
                    if (vm.icmpv6Type != '') {
                        flowData.flow.match.icmpv6__match.icmpv6__type = angular.copy(vm.icmpv6Type);
                    }
                    if (vm.icmpv6Code != '') {
                        flowData.flow.match.icmpv6__match.icmpv6__code = angular.copy(vm.icmpv6Code);
                    }
                }
                if (vm.mplsLabel != '' || vm.mplsTC != '' || vm.mplsBOS != '') {
                    flowData.flow.match.protocol__match__fields = {};
                    if (vm.mplsLabel != '') {
                        flowData.flow.match.protocol__match__fields.mpls__label = angular.copy(vm.mplsLabel);
                    }
                    if (vm.mplsTC != '') {
                        flowData.flow.match.protocol__match__fields.mpls__tc = angular.copy(vm.mplsTC);
                    }
                    if (vm.mplsBOS != '') {
                        flowData.flow.match.protocol__match__fields.mpls__bos = angular.copy(vm.mplsBOS);
                    }
                }
                if (vm.arpOP != '') {
                    flowData.flow.match.arp__op = angular.copy(vm.arpOP);
                }
                if (vm.arpSourceTransportAddress != '') {
                    flowData.flow.match.arp__source__transport__address = angular.copy(vm.arpSourceTransportAddress);
                }
                if (vm.arpTargetTransportAddress != '') {
                    flowData.flow.match.arp__target__transport__address = angular.copy(vm.arpTargetTransportAddress);
                }
                if (vm.arpSourceHardwareAddress != '') {
                    flowData.flow.match.arp__source__hardware__address = {};
                    flowData.flow.match.arp__source__hardware__address.address = angular.copy(vm.arpSourceHardwareAddress);
                }
                if (vm.arpTargetHardwareAddress != '') {
                    flowData.flow.match.arp__target__hardware__address = {};
                    flowData.flow.match.arp__target__hardware__address.address = angular.copy(vm.arpTargetHardwareAddress);
                }
                if (vm.tunnelId != '') {
                    flowData.flow.match.tunnel = {};
                    flowData.flow.match.tunnel.tunnel__id = angular.copy(vm.tunnelId);
                }
            }
        }

        //resets base fields
        function clearBase() {
            vm.switchIDList = [];
            delete vm.switchID;
            $window.localStorage.removeItem("flowmanager.flowName");
            vm.flowName = '';
            $window.localStorage.removeItem("flowmanager.priority");
            vm.priority = '';
            $window.localStorage.removeItem("flowmanager.tableID");
            vm.tableID = '';
            $window.localStorage.removeItem("flowmanager.flowID");
            vm.flowID = '';
            $window.localStorage.removeItem("flowmanager.hardTimeout");
            vm.hardTimeout = '';
            $window.localStorage.removeItem("flowmanager.idleTimeout");
            vm.idleTimeout = '';
            $window.localStorage.removeItem("flowmanager.cookie");
            vm.cookie = '';
            $window.localStorage.removeItem("flowmanager.cookieMask");
            vm.cookieMask = '';
            $window.localStorage.removeItem("flowmanager.strictSwitch");
            vm.strictSwitch = false;
            $window.localStorage.removeItem("flowmanager.barrierSwitch");
            vm.barrierSwitch = false;
            $window.localStorage.removeItem("flowmanager.installHwSwitch");
            vm.installHwSwitch = false;
        }

        //resets match fields
        function clearMatch() {
            $window.localStorage.removeItem("flowmanager.inPort");
            vm.inPort = '';
            $window.localStorage.removeItem("flowmanager.sourceMAC");
            vm.sourceMAC = '';
            $window.localStorage.removeItem("flowmanager.destMAC");
            vm.destMAC = '';
            $window.localStorage.removeItem("flowmanager.ethType");
            vm.ethType = '';
            $window.localStorage.removeItem("flowmanager.vlanId");
            vm.vlanId = '';
            $window.localStorage.removeItem("flowmanager.vlanPriority");
            vm.vlanPriority = '';
            $window.localStorage.removeItem("flowmanager.vlanSwitch");
            vm.vlanSwitch = false;
            $window.localStorage.removeItem("flowmanager.ipv4Source");
            vm.ipv4Source = '';
            $window.localStorage.removeItem("flowmanager.ipv4Destination");
            vm.ipv4Destination = '';
            $window.localStorage.removeItem("flowmanager.ipv6Source");
            vm.ipv6Source = '';
            $window.localStorage.removeItem("flowmanager.ipv6Destination");
            vm.ipv6Destination = '';
            $window.localStorage.removeItem("flowmanager.ipProtocol");
            vm.ipProtocol = '';
            $window.localStorage.removeItem("flowmanager.ipDSCP");
            vm.ipDSCP = '';
            $window.localStorage.removeItem("flowmanager.ipECN");
            vm.ipECN = '';
            $window.localStorage.removeItem("flowmanager.tcpSourcePort");
            vm.tcpSourcePort = '';
            $window.localStorage.removeItem("flowmanager.tcpDestPort");
            vm.tcpDestPort = '';
            $window.localStorage.removeItem("flowmanager.udpSourcePort");
            vm.udpSourcePort = '';
            $window.localStorage.removeItem("flowmanager.udpDestPort");
            vm.udpDestPort = '';
            $window.localStorage.removeItem("flowmanager.metadata");
            vm.metadata = '';
            $window.localStorage.removeItem("flowmanager.metadataMask");
            vm.metadataMask = '';
            $window.localStorage.removeItem("flowmanager.ipv6Label");
            vm.ipv6Label = '';
            $window.localStorage.removeItem("flowmanager.ipv6ExtHeader");
            vm.ipv6ExtHeader = '';
            $window.localStorage.removeItem("flowmanager.icmpv4Type");
            vm.icmpv4Type = '';
            $window.localStorage.removeItem("flowmanager.icmpv4Code");
            vm.icmpv4Code = '';
            $window.localStorage.removeItem("flowmanager.icmpv6Type");
            vm.icmpv6Type = '';
            $window.localStorage.removeItem("flowmanager.icmpv6Code");
            vm.icmpv6Code = '';
            $window.localStorage.removeItem("flowmanager.mplsLabel");
            vm.mplsLabel = '';
            $window.localStorage.removeItem("flowmanager.mplsTC");
            vm.mplsTC = '';
            $window.localStorage.removeItem("flowmanager.mplsBOS");
            vm.mplsBOS = '';
            $window.localStorage.removeItem("flowmanager.arpOP");
            vm.arpOP = '';
            $window.localStorage.removeItem("flowmanager.arpSourceTransportAddress");
            vm.arpSourceTransportAddress = '';
            $window.localStorage.removeItem("flowmanager.arpTargetTransportAddress");
            vm.arpTargetTransportAddress = '';
            $window.localStorage.removeItem("flowmanager.arpSourceHardwareAddress");
            vm.arpSourceHardwareAddress = '';
            $window.localStorage.removeItem("flowmanager.arpTargetHardwareAddress");
            vm.arpTargetHardwareAddress = '';
            $window.localStorage.removeItem("flowmanager.tunnelId");
            vm.tunnelId = '';
        }

        /*action code*/

        // accordion drag start

        vm.isElementDragged = function() {
            if (vm.elementDragged) {
                // reset first
                vm.elementDragged = false;
                return true;
            }
            else {
                return false;
            }
        }

        // accordion drag end
   
        // create new field button click 
        function addNewField() {
            var newField = {
                "order" : vm.addField.lastAddedID,
                "field_title" : vm.addField.new,
                "field_type" : vm.addField.new,
                "field_id" : vm.addField.new    
            };
            // incr field_id counter
            newField.field_id = vm.addField.lastAddedID;
            vm.addField.lastAddedID++;

            // put newField into fields array
            vm.form.form_fields.push(newField);
            isDropPresent();
        }

        function isDropPresent() {
            vm.drop = false;
            for (var i = 0; i < vm.form.form_fields.length; i++) {
                if (vm.form.form_fields[i].field_type == "drop") {
                    vm.drop = true;
                }
            }
        }
        //for OUTPUT action
        function showAddOptions(field) {
            if (field.field_type == "output") {
                if (!field.field_options) {
                    field.field_options = new Array();
                    field.field_options.push( {
                        output_to: [
                            {"id":"ANY", "title": "ANY"},
                            {"id":"TABLE", "title": "TABLE"},
                            {"id":"IMPORT", "title": "IMPORT"},
                            {"id":"physical_port", "title": "PHYSICAL PORT"},
                            {"id":"LOCAL", "title": "LOCAL"},
                            {"id":"NORMAL", "title": "NORMAL"},
                            {"id":"FLOOD", "title": "FLOOD"},
                            {"id":"CONTROLLER", "title": "CONTROLLER"},
                            {"id":"ALL", "title": "ALL"}
                        ],
                        output: '',
                        Physical_port: {
                            port: ''
                        },
                        Max_len: ''
                    });			
                }	
                return true;
            }
            else {
                return false;
            }
        }

        function showGoToTable(field) {
            if (field.field_type == "go-to-table") {
                if (!field.field_goToTable) {
                    field.field_goToTable = new Array();
                    field.field_goToTable.push( {
                        tableID : ''
                    });
                }
                return true;
            }
            else {
                return false;
            }
        }

        function showPushVlan(field) {
            if (field.field_type == "pushvlan") {
                if (!field.field_pushVlan) {
                    field.field_pushVlan = new Array();
                    field.field_pushVlan.push( {
                        ethernetType : '',
                        vlanId	     : '',
                        vlanPresent  : false
                    });
                }
                return true;
            }
            else {
                return false;
            }
        }

        function showPushMpls(field) {
            if (field.field_type == "pushmpls") {
                if (!field.field_pushMpls) {
                    field.field_pushMpls = new Array();
                    field.field_pushMpls.push( {
                        ethernetType : '',
                        mplsLabel    : ''
                    });
                }
                return true;
            }
            else {
                return false;
            }
        }

        function showSwapMpls(field) {
            if (field.field_type == "swapmpls") {
                if (!field.field_swapMpls) {
                    field.field_swapMpls = new Array();
                    field.field_swapMpls.push ({
                        mplsLabel    : ''
                    });
                }
                return true;
            }
            else {
                return false;
            }
        }

        function showPopMpls(field) {
            if (field.field_type == "popmpls") {
                if (!field.field_popMpls) {
                    field.field_popMpls = new Array();
                    field.field_popMpls.push( {
                        ethernetType    : ''
                    });
                }
                return true;
            }
            else {
                return false;
            }
        }

        function showDrop(field) {
            if (field.field_type == "drop") {
                return true;
            }
            else {
                return false;
            }
        }

        function action_output(option) {
            if (option == "physical_port")
                return true;
            else
                return false;
        }

        // deletes all the fields
        function deleteField(field_id) {
            for (var i = 0; i < vm.form.form_fields.length; i++) {
                if (vm.form.form_fields[i].field_id == field_id) {
                    vm.form.form_fields.splice(i, 1);
                    break;
                }
            }
            isDropPresent();
        }

        //converts all action instructions to JSON
        function convertActionFieldsToJSON(flowData) {
            if (vm.form.form_fields.length > 0) {

                if (vm.form.form_fields[0].field_type != "drop") { 
                
                    var instructionOrder = 0;
                    vm.actionInstructions = {};

                    vm.actionInstructions.instruction = {};
                    vm.actionInstructions.instruction.order = instructionOrder;
                    vm.actionInstructions.instruction.apply__actions = {};
                    vm.actionInstructions.instruction.apply__actions.action = [];

                    flowData.flow.instructions = {};
                    var orderID = 0;

                    for (var j = 0; j < vm.form.form_fields.length; j++) {
                        var newActionField = {};
                        if (vm.form.form_fields[j].field_type == "output") {
                            newActionField.output__action={};
                            if (vm.form.form_fields[j].field_options[0].output != '') {
                                newActionField.output__action.output__node__connector = [];
                                if (vm.form.form_fields[j].field_options[0].output == "physical_port") {
                                    newActionField.output__action.output__node__connector = angular.copy(vm.form.form_fields[j].field_options[0].Physical_port.port);
                                }
                                else {
                                    newActionField.output__action.output__node__connector = angular.copy(vm.form.form_fields[j].field_options[0].output);
                                }
                            }
                            if (vm.form.form_fields[j].field_options[0].Max_len != '') {
                                newActionField.output__action.max__length = [];
                                newActionField.output__action.max__length = angular.copy(vm.form.form_fields[j].field_options[0].Max_len);
                            }
                            if (vm.form.form_fields[j].field_options[0].output != '') {
                                newActionField.order = [];
                                newActionField.order = orderID;
                                orderID++;
                            }
                            vm.actionInstructions.instruction.apply__actions.action.push(newActionField);
                        }

                        if (vm.form.form_fields[j].field_type == "pushvlan") {
                            newActionField.push__vlan__action={};
                            newActionField.order = [];
                            if (vm.form.form_fields[j].field_pushVlan[0].ethernetType != '') {
                                newActionField.push__vlan__action.ethernet__type = [];
                                newActionField.push__vlan__action.ethernet__type = angular.copy(vm.form.form_fields[j].field_pushVlan[0].ethernetType);
                            }
                            newActionField.order = orderID;
                            orderID++;
                            vm.actionInstructions.instruction.apply__actions.action.push(newActionField);
                            var pushVlanField = {};
                            pushVlanField.set__field = {};
                            pushVlanField.set__field.vlan__match = {};
                            pushVlanField.set__field.vlan__match.vlan__id = {};
                            if (vm.form.form_fields[j].field_pushVlan[0].vlanId != '') {
                                pushVlanField.set__field.vlan__match.vlan__id.vlan__id = [];
                                pushVlanField.set__field.vlan__match.vlan__id.vlan__id = angular.copy(vm.form.form_fields[j].field_pushVlan[0].vlanId);
                            }
                            if (vm.form.form_fields[j].field_pushVlan[0].vlanPresent == true) {
                                pushVlanField.set__field.vlan__match.vlan__id.vlan__id__present = [];
                                pushVlanField.set__field.vlan__match.vlan__id.vlan__id__present = angular.copy(vm.form.form_fields[j].field_pushVlan[0].vlanPresent);
                            } 	
                            pushVlanField.order = orderID;
                            orderID++;  
                            vm.actionInstructions.instruction.apply__actions.action.push(pushVlanField);
                        }
                        if (vm.form.form_fields[j].field_type == "pushmpls") {
                            newActionField.push__mpls__action={};
                            newActionField.order = [];
                            if (vm.form.form_fields[j].field_pushMpls[0].ethernetType != '') {
                                newActionField.push__mpls__action.ethernet__type = [];
                                newActionField.push__mpls__action.ethernet__type = angular.copy(vm.form.form_fields[j].field_pushMpls[0].ethernetType);
                            }
                            newActionField.order = orderID;
                            orderID++;
                            vm.actionInstructions.instruction.apply__actions.action.push(newActionField);
                            var pushMplsField = {};
                            pushMplsField.set__field = {};
                            pushMplsField.set__field.protocol__match__fields = {};
                            if (vm.form.form_fields[j].field_pushMpls[0].vlanId != '') {
                                pushMplsField.set__field.protocol__match__fields.mpls__label = [];
                                pushMplsField.set__field.protocol__match__fields.mpls__label = angular.copy(vm.form.form_fields[j].field_pushMpls[0].mplsLabel);
                            }
                            pushMplsField.order = orderID;
                            orderID++;  
                            vm.actionInstructions.instruction.apply__actions.action.push(pushMplsField);
                        }
                        if (vm.form.form_fields[j].field_type == "swapmpls") {
                            newActionField = {};
                            newActionField.set__field = {};
                            newActionField.set__field.protocol__match__fields = {};
                            if (vm.form.form_fields[j].field_swapMpls[0].mplsLabel != '') {
                                newActionField.set__field.protocol__match__fields.mpls__label = [];
                                newActionField.set__field.protocol__match__fields.mpls__label = angular.copy(vm.form.form_fields[j].field_swapMpls[0].mplsLabel);
                            }
                            newActionField.order = orderID;
                            orderID++;  
                            vm.actionInstructions.instruction.apply__actions.action.push(newActionField);
                        }
                        if (vm.form.form_fields[j].field_type == "popmpls") {
                            newActionField = {};
                            newActionField.pop__mpls__action = {};
                            if (vm.form.form_fields[j].field_popMpls[0].ethernetType != '') {
                                newActionField.pop__mpls__action.ethernet__type = [];
                                newActionField.pop__mpls__action.ethernet__type = angular.copy(vm.form.form_fields[j].field_popMpls[0].ethernetType);
                            }
                            newActionField.order = orderID;
                            orderID++;  
                            vm.actionInstructions.instruction.apply__actions.action.push(newActionField);
                        }
                    }
                    
                    flowData.flow.instructions = angular.copy(vm.actionInstructions);
                    delete vm.actionInstructions;

                }
            }
        }

        //resets action field
        function clearAction() {
            vm.form.form_fields.splice(0, vm.form.form_fields.length);
            vm.addField.lastAddedID = 0;
        }

        /*action code ends*/

        //creates JSON
        function createJSON() {
            flowData = {};
            flowData.flow = {};

            convertBaseFieldsToJSON(flowData);
            convertMatchFieldsToJSON(flowData);
            convertActionFieldsToJSON(flowData);
            $window.localStorage.setItem("flowmanager.switchID", vm.switchID);

            flowData = angular.toJson(flowData, 4);
            flowData = flowData.replace(/__/g, "-");
            $window.localStorage.setItem("flowmanager.flow", flowData); 
            vm.finalFlow = $window.localStorage.getItem("flowmanager.flow");
        }

        //resets form
        function clearForm($event) {
            clearBase();
            clearMatch();
            clearAction();
            $window.localStorage.removeItem("flowmanager.flow");
            $window.localStorage.removeItem("flowmanager.switchID");
            delete vm.finalFlow;
            vm.isFlowNotReady = true;
            populateSwitchId();
            $mdDialog.show( {
                targetEvent: $event,
                template: '<md-dialog>' +
                          '  <md-dialog-content class="md-padding">' + 
                          '    <h4>Clear Form</h4>' +
                          '    <p>Form and JSON file cleared</p>' +
                          '  </md-dialog-content>' +
                          '</md-dialog>',
                clickOutsideToClose: true
            });
        }

        //copy the flow to clipboard
        function copyFlow($event) {
            clipboard.copyText(vm.finalFlow);
            $mdDialog.show( {
                targetEvent: $event,
                template: '<md-dialog>' +
                          '  <md-dialog-content class="md-padding">' + 
                          '    <h4>Copy Flow</h4>' +
                          '    <p>Copy to clipboard successful</p>' +
                          '  </md-dialog-content>' +
                          '</md-dialog>',
                clickOutsideToClose: true
            });
        }

        //dialog display of the JSON file
        function displayJSON($event) {
            createJSON();
            vm.isFlowNotReady = false;
            $mdDialog.show( {
                targetEvent: $event,
                template: '<md-dialog>' +
                          '    <md-dialog-content class="md-padding">' +
                          '        <h4>JSON Display</h4>' +
                          '        <pre ng-style={"background-color":"white"}>' + vm.finalFlow + '</pre>' +
                          '    </md-dialog-content>' +
                          '</md-dialog>',
                clickOutsideToClose: true
            });
        }

        //Validate pre-requisites
        function preRequisites() {
            var returnVar = true;
            if (vm.ipv4Source != "" || vm.ipv4Destination != "" || vm.ipDSCP != "" || vm.ipECN != "") {
                if (vm.ethType != "2048") {
                    returnVar = false;
                }
            }
            if (vm.ipProtocol != "") {
                if (!(vm.ethType == "2048" || vm.ethType == "34525")) {
                    returnVar = false;
                }
            }
            return returnVar;
        }

        //push the flow to the controller
        function pushFlow($event) {
            var preRequisiteCheck = preRequisites();
            if (preRequisiteCheck == true) {
                createJSON();
                var IP = $window.localStorage.getItem("flowmanager.IP");
                var port = $window.localStorage.getItem("flowmanager.port");
                var username = $window.localStorage.getItem("flowmanager.username");
                var password = $window.localStorage.getItem("flowmanager.password");
                var tableID = vm.tableID;
                var flowID = vm.flowID;
                var switchID = $window.localStorage.getItem("flowmanager.switchID");

                var flowURL = 'http://' + IP + ':' + port + '/restconf/config/opendaylight-inventory:nodes/node/' + switchID + '/table/' + tableID + '/flow/' + flowID;
                var auth = "Basic " + Base64.encode(username + ':' + password);
                var config = {
                    headers : {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    }
                }

                $http.put(flowURL, vm.finalFlow, config)
                    .success(function() {
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
                    })
                    .error(function(data, status) {
                        $mdDialog.show( {
                            targetEvent: $event,
                            template: '<md-dialog>' +
                                      '  <md-dialog-content class="md-padding">' + 
                                      '    <h4>ERROR</h4>' +
                                      '    <p>Adding Flow unsuccessful</p>' +
                                      '    <p>Error code : ' + status + '</p>' +
                                      '  </md-dialog-content>' +
                                      '</md-dialog>',
                            clickOutsideToClose: true
                        });
                    });
            }
            else {
                $mdDialog.show( {
                    targetEvent: $event,
                    template: '<md-dialog>' +
                              '  <md-dialog-content class="md-padding">' + 
                              '    <h4>ERROR</h4>' +
                              '    <p>For IP Protocol, please assign Ethernet Type as either 2048 or 34525</p>' +
                              '    <p>For IPv4 headers, please assign Ethernet Type as 2048</p>' +
                              '  </md-dialog-content>' +
                              '</md-dialog>',
                    clickOutsideToClose: true
                });
            }
        }


    }
})();


