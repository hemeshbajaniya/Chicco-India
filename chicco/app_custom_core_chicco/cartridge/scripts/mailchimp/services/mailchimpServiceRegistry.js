var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Site = require('dw/system/Site');

var Logger = require('dw/system/Logger').getLogger('mailChimp');

function getServiceConfig(apiKey) {

    var serviceConfig = {
        createRequest: function (svc, args) {
            var requestJSONString = JSON.stringify(args);
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Authorization', 'apikey ' + apiKey);
            svc.setRequestMethod('POST');
            return requestJSONString;
        },
        parseResponse: function (svc, client) {
            return JSON.parse(client.text);
        }
    };
    return serviceConfig;
}

function executeAPI(payLoad) {
    var apiKey = Site.current.preferences.custom.mailChimpApiKey;
    var mailChimpService = LocalServiceRegistry.createService('int.mailchimp.service.list.api', getServiceConfig(apiKey));

    try {
        var responePayLoad = mailChimpService.call(payLoad);
        if (responePayLoad.status == 'OK') {
            return responePayLoad.object;
        } else {
            Logger.error('(mailChimpServiceRegistry~executeAPI) -> Exception occured while try to execute API. Error code : {0} Error => ResponseStatus: {1}' , responePayLoad.errorMessage, responePayLoad.getStatus());
            return JSON.parse(responePayLoad.errorMessage);
        }
    } catch (e) {
        Logger.error('(mailChimpServiceRegistry~executeAPI) -> Error occured while try to execute API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

module.exports = {
    executeAPI: executeAPI
}