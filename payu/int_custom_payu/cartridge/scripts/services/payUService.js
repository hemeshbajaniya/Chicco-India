var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger').getLogger('payU');

function getServiceConfig(requestMethod) {

    var serviceConfig = {
        createRequest: function (svc, args) {
            svc.setRequestMethod('POST');
            svc.addHeader("Content-type", "application/x-www-form-URLencoded"); 
		    svc.addHeader("charset", "UTF-8");
            
            return args;
        },
	filterLogMessage: function (msg) {
            return msg;
        },
        parseResponse: function (svc, client) {
            return JSON.parse(client.text);
        }
    };
    return serviceConfig;
}

function executeAPI(payLoadQueryString) {
    var payUService = LocalServiceRegistry.createService('int.payu.service.api', getServiceConfig());

    try {
        var responePayLoad = payUService.call(payLoadQueryString);
        if (responePayLoad.status == 'OK') {
            return responePayLoad.object;
        } else {
            Logger.error('(payUService~executeAPI) -> Exception occured while try to execute API. Error code : {0} Error => ResponseStatus: {1}' , responePayLoad.getError().toString(), responePayLoad.getStatus());
            return responePayLoad.object;
        }
    } catch (e) {
        Logger.error('(payUService~executeAPI) -> Error occured while try to execute API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

module.exports = {
    executeAPI: executeAPI
}
