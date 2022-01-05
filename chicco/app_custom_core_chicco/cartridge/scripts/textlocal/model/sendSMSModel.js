'use strict';

var Site = require('dw/system/Site');
var Logger = require('dw/system/Logger').getLogger('textlocal');

var textLocalService = require('*/cartridge/scripts/textlocal/service/textLocalServiceRegistry');
/**
 * messageType {string}: The message type
 * phoneNumber {number}: The number where this message needs to be send
 * params {Object} : The object of params
 * params.customerName : The name of customer
 * params.orderNo: The customer order number
 * params.amount: The amount of an order
 * params.trackingURL: The tracking url of an order
 */
function sendSMS(messageType, phoneNumber, params) {
    try {
        var smsTemplates = JSON.parse(Site.current.preferences.custom.textLocalTemplateJSON);
        var apiKey = Site.current.preferences.custom.textLocalAPIKey;
        var smsSender = Site.current.preferences.custom.textLocalSender;
        var requestPayLoad = '?apiKey=' + apiKey + '&numbers=' + phoneNumber + '&sender=' + smsSender;
        var template = '';
        var type = 0;

        switch (messageType) {
            case 'accountCreation':
                template = smsTemplates.accountCreation.replace('{CustomerName}', params.customerName);
                type = 1;
                break;
            case 'passwordReset' :
                template = smsTemplates.passwordReset;
                type = 2;
                break;
            case 'orderConfirmation':
                template = smsTemplates.orderConfirmation.replace('{orderNo}', params.orderNo);
                template = template.replace('{amount}', 'RS.' + params.amount);
                template = template.replace('{trackingURL}', params.trackingURL);
                type = 3;
                break;
            case 'orderCancellation':
                template = smsTemplates.orderCancellation;
                type = 4;
                break;
            case 'accountLocked':
                template = smsTemplates.accountLocked;
                type = 5;
                break;
            case 'accountEdit':
                template = smsTemplates.accountEdit;
                type = 6;
                break;
            default: 
                break
        }

        requestPayLoad += '&message=' + dw.crypto.Encoding.toURI(template);

        var response = textLocalService.executeAPI(requestPayLoad);
        if (response.ok && response.object.status === 'success') {
            Logger.info('SMS send Succesfull to number:{0} and sms type is: {1}', phoneNumber, type);
        } else {
            Logger.error('(sendSMSModel~sendSMS) -> Error occured while try to send sms for number: {0} and type:{1} the response response is:{2}' , phoneNumber, type, JSON.stringify(response));
        }

    } catch (e) {
        Logger.error('(sendSMSModel~sendSMS) -> Error occured while try to send sms details: {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
    }

}

module.exports = {
    sendSMS: sendSMS
}