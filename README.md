# client-logger
angular module for a client side logger

author: shimmy rothstein

directive for adding logging ability to html elements.

add logger-overlay element somewhere in base html for rerun option (preferably only for developer).

add client-logger attribute to element.

add name-to-log attribute with desired name.

add action-to-log attribute with desired events to log, if multiple seperate with ',' (defualt is "change").

add value-to-log attribute with name of desired value to add to log (defualt is "value").

Inject 'ClientLogger' into client your angular module.

Inject 'DeveloperLogService' into client your angular module and controller.

# API:
LogStackService.setAddress("your address here");

LogStackService.setBuffer(num)

LogStackService.addLog(obj) where obj type of:
      {elementName: "chosen element", elementType: "chosen element type", action: "event", value: "value"}

LogStackService.getLog()

LogStackService.deleteLog()

LogStackService.emptyLog()

LogStackService.sendLogTo(address)

LogStackService.rerunLog()

log is array of:
      {time: "time of log", log: {elementName: "chosen element", elementType: "chosen element type", action: "event", value: "value"}}

enjoy
live long and prosper \V/
