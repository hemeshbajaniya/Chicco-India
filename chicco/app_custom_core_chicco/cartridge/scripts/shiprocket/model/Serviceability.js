'use strict';

var Logger = require('dw/system/Logger').getLogger('shiprocket');
var Site = require('dw/system/Site');

var shipRocketServiceRegistry = require('*/cartridge/scripts/shiprocket/shiprocketServiceRegistry.js')

function getRecommendedCourior(response) {
    var recommendedID = response.data.shiprocket_recommended_courier_id;
    var avalibleCourierArray = response.data.available_courier_companies;
    var recommendedCourier;
    avalibleCourierArray.forEach(function (item) {
        if (item.courier_company_id == recommendedID) {
            recommendedCourier = item;
            return;
        }
    });
    return recommendedCourier;
}

function getServiceETD(customerPinCode) {
    var wareHouseLocationPinCode = Site.current.preferences.custom.shiprocketWareHouseLocationPinCode;

    var result = {
        error: false
    };

    var requestParams = '?pickup_postcode=' + wareHouseLocationPinCode + '&delivery_postcode=' + customerPinCode + '&cod=0&weight=2'; 
    try {
        var authTokens = shipRocketServiceRegistry.getAuthTokens();
        var abilityResponse = shipRocketServiceRegistry.getServiceAbility(requestParams,authTokens);
        if (!empty(abilityResponse) && abilityResponse.status == 200) {
            result.response = getRecommendedCourior(abilityResponse);
        } else {
            result.error = true;
            result.errorMsg = 'Oops! Looks like we are not shipping to your location';
        }
    } catch (e) {
        Logger.error('(Serviceability~getServiceETD) -> Error occured while try to get service details: {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.error = true;
        result.errorMsg = 'Oops! Looks like something went wrong, Please try again after sometime';
    }
    return result;
}

module.exports = {
    getServiceETD: getServiceETD
}