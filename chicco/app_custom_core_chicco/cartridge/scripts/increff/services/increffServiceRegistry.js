var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger').getLogger('increff');

var Site = require('dw/system/Site');

function getServiceConfig(requestMethod) {

    var serviceConfig = {
        createRequest: function (svc, args) {
            var requestJSONString = JSON.stringify(args);
            svc.addHeader("Content-Type", "application/json");
            svc.addHeader("authUsername", svc.configuration.credential.user);
            svc.addHeader("authPassword", svc.configuration.credential.password);
            svc.setRequestMethod(requestMethod);

            return requestJSONString;
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

function getServiceConfigOMS(requestMethod) {

    var serviceConfig = {
        createRequest: function (svc, args) {
            var requestJSONString = JSON.stringify(args);
            svc.addHeader("Content-Type", "application/json");
            svc.addHeader("authDomainName", Site.current.preferences.custom.increffOMSDomainName);
            svc.addHeader("authUsername", svc.configuration.credential.user);
            svc.addHeader("authPassword", svc.configuration.credential.password)
            svc.setRequestMethod(requestMethod);

            return requestJSONString;
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

function executeAPI(payLoad, endpoint, requestMethod) {
    var increffService = LocalServiceRegistry.createService('int.increff.service.api', getServiceConfig(requestMethod));
    var increffEndPoint = increffService.getConfiguration().getCredential().URL.toString();
    increffEndPoint = increffEndPoint + '/' + endpoint;
    increffService.setURL(increffEndPoint);

    try {
        var responePayLoad = increffService.call(payLoad);
        if (responePayLoad.status == 'OK') {
            return responePayLoad;
        } else {
            Logger.error('(increffServiceRegistry~executeAPI) -> Exception occured while try to execute API. Error code : {0} Error => ResponseStatus: {1}' , responePayLoad.getError().toString(), responePayLoad.getStatus());
            return responePayLoad;
        }
    } catch (e) {
        Logger.error('(increffServiceRegistry~executeAPI) -> Error occured while try to execute API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

function executeMiniOMSAPI(payLoad, endpoint, requestMethod) {
    var omsService = LocalServiceRegistry.createService('int.increff.oms.service.api', getServiceConfigOMS(requestMethod));
    var omsEndpoint = omsService.getConfiguration().getCredential().URL.toString();
    omsEndpoint = omsEndpoint + '/' + endpoint;
    omsService.setURL(omsEndpoint);

    try {
        var responePayLoad = omsService.call(payLoad);
        if (responePayLoad.status == 'OK') {
            return responePayLoad;
        } else {
            Logger.error('(increffServiceRegistry~executeMiniOMSAPI) -> Exception occured while try to execute API. Error code : {0} Error => ResponseStatus: {1}' , responePayLoad.getError().toString(), responePayLoad.getStatus());
            return responePayLoad;
        }
    } catch (e) {
        Logger.error('(increffServiceRegistry~executeMiniOMSAPI) -> Error occured while try to execute API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    }
}

module.exports = {
    executeAPI: executeAPI,
    executeMiniOMSAPI: executeMiniOMSAPI
}