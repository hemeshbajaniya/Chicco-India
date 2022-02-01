'use strict';
var Site = require('dw/system/Site');
var Logger = require('dw/system/Logger').getLogger('emailHelper');


/**
 * Helper that sends an email to a customer. This will only get called if hook handler is not registered
 * @param {obj} emailObj - An object that contains information about email that will be sent
 * @param {string} emailObj.to - Email address to send the message to (required)
 * @param {string} emailObj.subject - Subject of the message to be sent (required)
 * @param {string} emailObj.from - Email address to be used as a "from" address in the email (required)
 * @param {int} emailObj.type - Integer that specifies the type of the email being sent out. See export from emailHelpers for values.
 * @param {string} template - Location of the ISML template to be rendered in the email.
 * @param {obj} context - Object with context to be passed as pdict into ISML template.
 */
function send(emailObj, template, context) {
    var Mail = require('dw/net/Mail');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var email = new Mail();
    email.addTo(emailObj.to);
    email.setSubject(emailObj.subject);
    email.setFrom(emailObj.from);
    email.setContent(renderTemplateHelper.getRenderedHtml(context, template), 'text/html', 'UTF-8');
    email.send();

    if (Site.current.preferences.custom.textLocalnabled) {
        try {
              // Custom Start: SMS Integeration
            var sendSMSModel = require('*/cartridge/scripts/textlocal/model/sendSMSModel');
            var CustomerMgr = require('dw/customer/CustomerMgr');
            var customer = CustomerMgr.getCustomerByLogin(emailObj.to);

            // get current logged in customer phone number
            var phoneNumber = customer.profile ? customer.profile.phoneHome : '';
            var messageType;
            var params = {
                customerName: '',
                orderNo: '',
                amount: '',
                trackingURL: ''
            }
            switch (emailObj.type) {
                case 1:
                    messageType = 'accountCreation';
                    params.customerName = context.firstName;
                    break;
                case 2:
                    messageType = 'passwordReset';
                    break;
                case 3:
                    messageType = 'accountEdit';
                    break;
                case 4:
                    messageType = 'orderConfirmation';
                    params.orderNo = context.order.orderNumber;
                    params.amount = context.order.totals.grandTotal;
                    params.trackingURL = dw.web.URLUtils.http('Account-Show');
                    break;
                case 5:
                    messageType = 'accountLocked';
                    break;
                case 6:
                    messageType = 'accountEdit';
                    break;
                case 7:
                    // Needs to be hanlde speically in terms of phone number
                    messageType = 'orderCancellation';
                    break;
            }

            sendSMSModel.sendSMS(messageType, phoneNumber, params);
        } catch (ex) {
            Logger.error('(emailHelper~sendEmail)-> Error occured while try to send sms to customer: {0} and error is:{1} in line {2} at file:{3}', phoneNumber, ex.toString(), ex.lineNumber, ex.fileName)
        }
    }
    
    // Custom End : SMS Integeration
}

/**
 * Checks if the email value entered is correct format
 * @param {string} email - email string to check if valid
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
    var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
    return regex.test(email);
}

module.exports = {
    send: send,
    sendEmail: function (emailObj, template, context) {
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
        return hooksHelper('app.customer.email', 'sendEmail', [emailObj, template, context], send);
    },
    emailTypes: {
        registration: 1,
        passwordReset: 2,
        passwordChanged: 3,
        orderConfirmation: 4,
        accountLocked: 5,
        accountEdited: 6,
        orderCancellation: 7,
        orderReturn: 8
    },
    validateEmail: validateEmail
};
