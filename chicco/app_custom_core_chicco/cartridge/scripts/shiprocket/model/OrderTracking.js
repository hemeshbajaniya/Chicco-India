'use strict';

var Logger = require('dw/system/Logger').getLogger('shiprocket');
var Site = require('dw/system/Site');

var shipRocketServiceRegistry = require('*/cartridge/scripts/shiprocket/shiprocketServiceRegistry.js')

function getOrderDelieveryInfo(orderawbNo) {
    var result = {
        error: false
    };

    try {
        var authTokens = shipRocketServiceRegistry.getAuthTokens();
        var trackingResponse = shipRocketServiceRegistry.getOrderTrackingInfoByAwbNumber(orderawbNo, authTokens);
        if (!empty(trackingResponse)) {
            result.response = trackingResponse.tracking_data;
        } else {
            result.error = true;
            result.errorMsg = 'Oops! Looks like your order is not processed yet';
        }
    } catch (e) {
        Logger.error('(OrderTracking~OrderDelieveryInfo) -> Error occured while try to get service details: {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.error = true;
        result.errorMsg = 'Oops! Looks like something went wrong, Please try again after sometime';
    }
    return result;
}

function getOrderDeliveredDate(trackingResponse) {
    var result = {
        error : false,
        errorMsg: '',
        deliveredDate: ''
    }
    var deliveredDate = '';
    if (!empty(trackingResponse)) {
        if (trackingResponse.track_status === 1) {
            // 10 means RTO Delivered && 7 means Delivered
            if (trackingResponse.shipment_status === 10 || trackingResponse.shipment_status === 7) {
                result.deliveredDate = trackingResponse.shipment_track[0].delivered_date;
                // if (trackingResponse.shipment_track_activities.length > 0) {
                //     result.deliveredDate = trackingResponse.shipment_track_activities[0].date;
                // } else {
                //     result.error = true;
                //     result.errorMsg = 'order not delivered yet';
                // }
            } else {
                result.error = true;
                result.errorMsg = 'order not delivered yet';
            }
        } else {
            result.error = true;
            result.errorMsg = trackingResponse.error;
        }
    }
    return result;
}

module.exports = {
    getOrderDelieveryInfo: getOrderDelieveryInfo,
    getOrderDeliveredDate: getOrderDeliveredDate
}