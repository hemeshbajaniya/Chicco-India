var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var Logger = require('dw/system/Logger').getLogger('textlocal');

function getServiceConfig(apiKey) {

    var serviceConfig = {
        createRequest: function (svc, args) {
            var requestJSONString = JSON.stringify(args);
            svc.setRequestMethod('GET');
		    svc.addHeader("charset", "UTF-8");
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

function executeAPI(payLoadParam) {
    var textLocalService = LocalServiceRegistry.createService('int.textlocal.api', getServiceConfig());
    var textLocalEndpoint = textLocalService.getConfiguration().getCredential().URL.toString();
    textLocalEndpoint = textLocalEndpoint + payLoadParam;
    textLocalService.setURL(textLocalEndpoint);

    try {
        var responePayLoad = textLocalService.call(payLoadParam);
        if (responePayLoad.status == 'OK') {
            return responePayLoad;
        } else {
            Logger.error('(textlocalServiceRegistry~executeAPI) -> Exception occured while try to execute API. Error code : {0} Error => ResponseStatus: {1}' , responePayLoad.errorMessage, responePayLoad.getStatus());
            return responePayLoad;
        }
    } catch (e) {
        Logger.error('(textlocalServiceRegistry~executeAPI) -> Error occured while try to execute API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

module.exports = {
    executeAPI: executeAPI
}