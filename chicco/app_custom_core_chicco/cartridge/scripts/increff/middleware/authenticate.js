'use strict';

var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');


function validateRequest(req, res, next) {
    var header = req.httpHeaders;
    var userName = header.get('username');
    var password = header.get('password');

    if (!empty(userName) && !empty(password)) {
        var sitePreference = Site.current.preferences.custom

        if (userName === sitePreference.increffNotifcationUsername && password === sitePreference.increffNotificationPassword) {
            // DO something may be adding this in view data
        } else {
            res.redirect(URLUtils.url('Increff-UnAuthorized'));
        }
    } else {
        res.redirect(URLUtils.url('Increff-UnAuthorized'));
    }
    next();
}

module.exports = {
    validateRequest: validateRequest
}
