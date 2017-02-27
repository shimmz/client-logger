/**

* author: shimmy rothstein

* directive for adding logging ability to html elements

*

* add logger-overlay element somewhere in base html for rerun option (preferably only for developer)

* add client-logger attribute to element.

* add name-to-log attribute with desired name

* add action-to-log attribute with desired events to log, if multiple seperate with ',' (defualt is "change")

* add value-to-log attribute with name of desired value to add to log (defualt is "value")

*

* Inject 'ClientLogger' into your angular module and controller

*

* API:

*  LogStackService.setAddress("your address here");

*

*  LogStackService.setBuffer(num)

*

 *  LogStackService.addLog(obj) where obj type of {elementName: "chosen element", elementType: "chosen element type", action: "event", value: "value"}

*

*  LogStackService.getLog()

*

*  LogStackService.deleteLog()

*

*  LogStackService.emptyLog()

*

 *  LogStackService.sendLogTo(address)

 *

*  LogStackService.rerunLog()

 *

 * log is array of {time: "time of log", log: {elementName: "chosen element", elementType: "chosen element type", action: "event", value: "value"}}

*

* enjoy

* live long and prosper \V/

*/

 

var ConfigObject = function () {

    return {

        App: "ClientLogger",

        Controller: "Loggercntrl",

        Service: 'LogStackService',

        UniqueIdService: 'UniqueIdService',

        Directive: 'clientLogger',

        OverlayDirective: 'loggerOverLay',

        DirectiveUse: 'client-logger',

        IdAttribute: 'logger-id'

    }

}();

 

angular.isUndefinedOrNull = function (val) {

    return angular.isUndefined(val) || val === null;

}

 

var app = angular.module(ConfigObject.App, []);

app.run();

 

app.service(ConfigObject.UniqueIdService, function () {

    return new function () {

        var self = this;

        var nextId = 0;

        self.getUniqueId = function () { return nextId++; };

    }

});

 

app.service(ConfigObject.Service, function ($http, $timeout, $window) {

    return new LogStackServiceObj($http, $timeout, $window);

})

 

 

function LogStackServiceObj($http, $timeout, $window) {

    var self = this;

    var alowLogging = true;

    //buffer size of log stack

    var buffer = 500;

    self.setBuffer = function (num) { if (isFinite(num)) { buffer = num }; };

    //http address to send log to

    var address = undefined;

    self.setAddress = function (addrss) { address = addrss };

 

    var LogStack = [];

    var rerunStack = [];

    self.logMessages = {};

    //add log to stack

    self.addLog = function (obj) {

        if (!angular.isUndefinedOrNull(obj)) {

            if (alowLogging) {

                LogStack.push({ time: new Date().toLocaleString('en-GB'), log: obj });

            }

            if (LogStack.length >= buffer && !angular.isUndefinedOrNull(address)) { //buffer reached

                self.diluteLog();

            }

        }

    }

    //remove first third of log and send to sever if address is available

    var diluteLog = function () {

        var spliced = LogStack.splice(0, Math.floor(buffer / 3));

        if (!angular.isUndefinedOrNull(address)) {

            $http.put(address, spliced);

        }

    };

 

    self.getLog = function () { return LogStack; };

 

    self.deleteLog = function () { LogStack = []; };

 

    self.emptyLog = function () { self.sendLog(); self.deleteLog(); };

    //send whole log to server if address is available

    self.sendLog = function (adrs) {

        if (!angular.isUndefinedOrNull(adrs)) {

            $http.put(adrs, LogStack);

        } else {

            if (!angular.isUndefinedOrNull(address)) {

                $http.put(address, LogStack);

            }

        }

    };

 

    //on window close\tab close\refresh send log to server if exsits

    $window.onbeforeunload = self.sendLog;

 

   

    var borderStyle = document.createElement('style');

    borderStyle.innerHTML = '.logCurrentAction{border-style:inset; border-color:#f09942; border-width:5px;}';

    document.head.appendChild(borderStyle);

 

    self.speed;

 

    var loggerOverlay = null;

    //

   

 

    var rerunLoop = function (i) {

        if (i >= rerunStack.length) {

            alowLogging = true;

            loggerOverlay.css('display', 'none');

            self.logMessages = {};

            return;

        }

        var string = "[" + ConfigObject.IdAttribute + "=\"" + rerunStack[i].log.loggerId + "\"]";

        var JQElem = document.querySelector(string);

        var elem = angular.element(JQElem);

        if (angular.isUndefinedOrNull(JQElem)) {

            rerunStack[i].log.message = "Element no longer exists in html"

        } else {

            elem.addClass('logCurrentAction');

            elem.val(rerunStack[i].log.value);

            elem.triggerHandler(rerunStack[i].log.action);

        }

        self.logMessages = rerunStack[i].log;//put in if(elem exsits)

        $timeout(function (elem, i) {

            elem.removeClass('logCurrentAction');

            $timeout(function (i) { rerunLoop(i + 1); }, 400, true, i);

        }, self.speed, true, elem, i);

    }

    //play log

    self.rerunLog = function (stack) {

        if (angular.isUndefinedOrNull(stack)) {

            rerunStack = LogStack;

        } else {

            rerunStack = stack;

        }

        if (angular.isUndefinedOrNull(loggerOverlay)) {

            loggerOverlay = angular.element(document.querySelector('#loggerOverlay'))

        }

        loggerOverlay.css('display','initial');

        alowLogging = false;

        rerunLoop(0);

    }

 

}

 

app.directive(ConfigObject.Directive, function ($compile, LogStackService, UniqueIdService) {

   

    var linkFunction = function ($scope, element, attrs) {

       

        $scope.loggerId = UniqueIdService.getUniqueId();

        element.attr(ConfigObject.IdAttribute, $scope.loggerId);

 

        if (angular.isUndefinedOrNull($scope.actionsToLog)) {

            $scope.actionsToLog = "change";

        }

        if (angular.isUndefinedOrNull($scope.valueToLog)) {

            $scope.valueToLog = "value";

        }

        var temp = $scope.actionsToLog.split(',');

        for (var i = 0; i < temp.length; i++) {

            element.on(temp[i], function (event) {

                if (!angular.isUndefinedOrNull($scope.valueToLog)) {

                    LogStackService.addLog({ elementName: $scope.nameToLog, loggerId: $scope.loggerId, elementType: element[0].localName, action: event.type, value: element[0][$scope.valueToLog] });

                }

            });

        }

    };

    return {

        restrict:'A',

        scope: {

            actionsToLog: "@",

            nameToLog: "@",

            valueToLog: "@",

            loggerId: "@"

        },

        link:  linkFunction

    }

});

 

 

app.directive('loggerOverlay', ["LogStackService",

    function (LogStackService) {

    return {

        scope:{

           

        },

        replace: true,

        template: '<div id="loggerOverlay" style="z-index=999; background-color:rgba(0,0,0,0.1); position:absolute; left:0; top:0; width:100%; height:100%; display:none;">'+

                        '<div style="height: 20%; width: 20%; position: absolute; right: 0; bottom: 0; background-color: rgba(0,0,0,0.2); ">'+

                            '<div>speed</div>'+

                            '<input type="range" min="100" max="5000" ng-model="speed" style="column-rule-color:black; bottom:0; background:orange;" />' +

                            '<div>Log Messages:</div>' +

                            '<div>{{logMessages.message}}</div>' +

                            '<div>{{logMessages.elementName}}  -  {{logMessages.elementType}}  -  {{logMessages.action}}  -  {{logMessages.value}}</div>' +

                        '</div>' +

                    '</div>',

        link: function ($scope, element, attrs) {

            $scope.logService = LogStackService;

            $scope.speed = 4000;

            $scope.logService.speed = 5000 - $scope.speed;

            $scope.$watch('logService.logMessages', function (newVal, oldVal, scope) {

                if (newVal === oldVal) return;

                $scope.logMessages = newVal;

            })

            $scope.$watch('speed', function (newVal, oldVal, scope) {

                if (newVal === oldVal) return;

                $scope.logService.speed = 5000 - newVal;

            })

        }

    }

}]);
