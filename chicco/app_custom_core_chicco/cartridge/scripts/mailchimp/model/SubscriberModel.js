'use strict';

var Logger = require('dw/system/Logger').getLogger('mailChimp');

function generateEmailSubscriberPayLoad(email) {
    var payLoad = {
        email_address: email,
        status: 'subscribed'
    }
    return payLoad;
}

function subscribe(email) {
    var mailChimpService = require('*/cartridge/scripts/mailchimp/services/mailchimpServiceRegistry.js');
    var payLoad = generateEmailSubscriberPayLoad(email);
    try {
        var response = mailChimpService.executeAPI(payLoad);
        if (!empty(response) && response.status == 'subscribed') {
            return response;
        } else {
            Logger.error('(SubscriberModel~subscribe) -> Error occured while try to add memeber into list Reason code : {0}' , response.detail);
            return false;
        }
    } catch (e) {
        Logger.error('SubscriberModel~subscribe) -> Error occured while try to add memeber into list.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);

    }
}

module.exports = {
    subscribe: subscribe
}