'use strict';

var Logger = require('dw/system/Logger').getLogger('easyRewardz');
var Site = require('dw/system/Site');

function prepareAuthenticationPayLoad() {
    var payLoad = {
        UserName: Site.current.preferences.custom.easyRewardzAuthUserName,
        UserPassword: Site.current.preferences.custom.easyRewardzAuthPassword,
        DevId: Site.current.preferences.custom.easyRewardzDevId,
        AppId: Site.current.preferences.custom.easyRewardzAppId,
        ProgramCode: Site.current.preferences.custom.easyRewardzProgramCode
    }
    return payLoad;
}

function getAuthToken() {
    if (empty(session.privacy.easyRewardzToken)) {
        var easyRewardzServiceRegistry = require('*/cartridge/scripts/easyrewardz/services/easyRewardzServiceRegistry.js');
        var payLoad = prepareAuthenticationPayLoad();
        var authResponse = easyRewardzServiceRegistry.executeAPI(payLoad, 'GenerateSecurityToken');
        if (!empty(authResponse) && !authResponse.ReturnMessage) {
            session.privacy.easyRewardzToken = authResponse.Token;
            return authResponse.Token;
        } else {
            Logger.error('(AuthenticationModel~getAuthToken) -> Exception occured while try to get auth token: Reason code : {0}' , authResponse.ReturnMessage);
            return new Error(authResponse.ReturnMessage);
        }
    } else {
        return session.privacy.easyRewardzToken;
    }
}

module.exports = {
    getAuthToken: getAuthToken
}