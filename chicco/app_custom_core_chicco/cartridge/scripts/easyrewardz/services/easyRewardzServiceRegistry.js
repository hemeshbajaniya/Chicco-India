var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');

function getServiceConfig() {

    var serviceConfig = {
        createRequest: function (svc, args) {
            var requestJSONString = JSON.stringify(args);
            svc.addHeader('Content-Type', 'application/json');
            svc.setRequestMethod('POST');
            return requestJSONString;
        },
        parseResponse: function (svc, client) {
            return JSON.parse(client.text);
        }
    };
    return serviceConfig;
}

function executeAPI(payLoad, endpoint) {
    var easyRewardzService = LocalServiceRegistry.createService('int.easyrewardz.service.api', getServiceConfig());
    var easyRewardzEndpoint = easyRewardzService.getConfiguration().getCredential().URL.toString();
    easyRewardzEndpoint = easyRewardzEndpoint + '/' + endpoint;
    easyRewardzService.setURL(easyRewardzEndpoint);

    try {
        var responePayLoad = easyRewardzService.call(payLoad);
        if (responePayLoad.status == 'OK') {
            return responePayLoad.object;
        } else {
            Logger.error('(easyRewardzServiceRegistry~executeAPI) -> Exception occured while try to execute API. Error code : {0} Error => ResponseStatus: {1}' , responePayLoad.getError().toString(), responePayLoad.getStatus());
            return responePayLoad.object;
        }
    } catch (e) {
        Logger.error('(easyRewardzServiceRegistry~executeAPI) -> Error occured while try to execute API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

module.exports = {
    executeAPI: executeAPI
}