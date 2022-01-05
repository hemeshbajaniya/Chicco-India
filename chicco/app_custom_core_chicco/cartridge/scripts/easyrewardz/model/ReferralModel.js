var Calendar = require('dw/util/Calendar');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');
var Site = require('dw/system/Site');

var AuthenticationModel = require('*/cartridge/scripts/easyrewardz/model/AuthenticationModel.js');
var easyRewardzServiceRegistry = require('*/cartridge/scripts/easyrewardz/services/easyRewardzServiceRegistry.js');

function prepareReferralPayLoad(authToken, memeberID) {
    var payLoad = {
        SecurityToken: authToken,
        EasyId: memeberID,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        CountryCode: '91'
    }
    return payLoad;
}

function getReferralCode(profile, isRealTime) {
    var result = {
        error: false
    };
    try {
        // if value exists then don't make a real time call just use session
        if (!empty(session.privacy.referralCode) && !isRealTime) {
            result.referralCode = session.privacy.referralCode;
        } else {
            // if session empty then make real time API call
            var authToken = AuthenticationModel.getAuthToken();
            var requestPayLoad = prepareReferralPayLoad(authToken, profile.phoneHome);
            var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'GetReferralCode');
            if (!empty(response) && response.ReturnCode == '0') {
                result.ReferralCode = response.ReferralCode;
                session.privacy.referralCode = response.ReferralCode;
            } else {
                Logger.error('(ReferralModel~getReferralCode) -> Error occured while try to get customer referral code: Reason code : {0}' , response.ReturnMessage);
                result.message = response.ReturnMessage;
                result.error = true;
            }
        }
    } catch (ex) {
        Logger.error('(ReferralModel~getReferralCode) -> Error occured while try to get customer referral code: Error : {0} line number: {1}' , ex, ex.lineNumber);
        result.error = true;
    }
    return result;
}

module.exports = {
    getReferralCode: getReferralCode
}