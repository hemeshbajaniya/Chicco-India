'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger').getLogger('shiprocket');

function getAuthorizationServiceConfigs() {
    var serviceConfig = {
        createRequest: function (svc, args) {
            var requestJSONString = JSON.stringify(args);
            svc.addHeader('Content-Type', 'application/json');
            svc.setRequestMethod('POST');
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

function getAuthTokenServiceConfigs(authToken, method) {
    var serviceConfig = {
        createRequest: function (svc, args) {
            var requestJSONString = JSON.stringify(args);
            svc.addHeader("Content-Type", "application/json");
            svc.addHeader("Authorization", "Bearer " + authToken);
            svc.setRequestMethod(method);
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

function getAuthTokens() {
    var authService = LocalServiceRegistry.createService('int.shiprocket.service.auth', getAuthorizationServiceConfigs());
    var payLoad = {
        email: authService.getConfiguration().getCredential().user,
        password: authService.getConfiguration().getCredential().password
    }
    try {
        var authReponse = authService.call(payLoad);
        if (authReponse.status == 'OK') {
            return authReponse.object.token;
        } else {
            Logger.error('shiprocketServiceRegistry -> Exception occured while try to get access tokens. Error code : {0} Error => ResponseStatus: {1}' , authReponse.getError().toString(), authReponse.getStatus());
        }
    } catch (e) {
        Logger.error('shiprocketServiceRegistry -> Error occured while try to get access tokens.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    }

}

function getOrderByOrderID(orderId, authToken) {
    var orderService = LocalServiceRegistry.createService('int.shiprocket.service.get.availability', getAuthTokenServiceConfigs(authToken, 'GET'));
    var orderEndpoint = orderService.getConfiguration().getCredential().URL.toString();
    orderEndpoint = orderEndpoint + '/' + orderId;
    orderService.setURL(orderEndpoint);

    try {
        var orderResponse = orderService.call('');
        if (orderResponse.status == 'OK') {
            return authReponse.object;
        } else {
            Logger.error('(shiprocketServiceRegistry~getOrderByOrderID) -> Exception occured while try to get order tokens. Error code : {0} Error => ResponseStatus: {1}' , orderResponse.getError().toString(), orderResponse.getStatus());
            return authReponse.object;
        }
    } catch (e) {
        Logger.error('(shiprocketServiceRegistry~getOrderByOrderID) -> Error occured while try to get access tokens.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

function getServiceAbility(requestParam, authToken) {
    var abilityService = LocalServiceRegistry.createService('int.shiprocket.service.get.availability', getAuthTokenServiceConfigs(authToken, 'GET'));
    var abilityEndpoint = abilityService.getConfiguration().getCredential().URL.toString();
    abilityEndpoint = abilityEndpoint + requestParam;
    abilityService.setURL(abilityEndpoint);

    try {
        var abilityResponse = abilityService.call();
        if (abilityResponse.status == 'OK') {
            return abilityResponse.object;
        } else {
            Logger.error('(shiprocketServiceRegistry~getServiceAbility) -> Exception occured while try to get service ability. Error code : {0} Error => ResponseStatus: {1}' , abilityResponse.getError().toString(), abilityResponse.getStatus());
            return abilityResponse.object;
        }
    } catch (e) {
        Logger.error('(shiprocketServiceRegistry~getServiceAbility) -> Error occured while try to get get service ability.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

function getOrderTrackingInfoByAwbNumber(awbNumber, authToken) {
    var trackingService = LocalServiceRegistry.createService('int.shiprocket.service.get.tracking', getAuthTokenServiceConfigs(authToken, 'GET'));
    var trackingServiceEndpoint = trackingService.getConfiguration().getCredential().URL.toString();
    trackingServiceEndpoint = trackingServiceEndpoint + awbNumber;
    trackingService.setURL(trackingServiceEndpoint);

    try {
        var trackingResponse = trackingService.call();
        if (trackingResponse.status == 'OK') {
            return trackingResponse.object;
        } else {
            Logger.error('(shiprocketServiceRegistry~getOrderTrackingInfoByAwbNumber) -> Exception occured while try to get service tracking. Error code : {0} Error => ResponseStatus: {1}' , trackingResponse.getError().toString(), trackingResponse.getStatus());
            return trackingResponse.object;
        }
    } catch (e) {
        Logger.error('(shiprocketServiceRegistry~getOrderTrackingInfoByAwbNumber) -> Error occured while try to get get service tracking.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    } 

}

module.exports = {
    getAuthTokens: getAuthTokens,
    getOrderByOrderID: getOrderByOrderID,
    getServiceAbility: getServiceAbility,
    getOrderTrackingInfoByAwbNumber: getOrderTrackingInfoByAwbNumber
}