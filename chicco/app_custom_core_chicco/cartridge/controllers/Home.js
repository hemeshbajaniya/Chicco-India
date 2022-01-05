'use strict';

/**
 * @namespace Home
 */
var page = module.superModule;

var server = require('server');
server.extend(page);

var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var homePageHelper = require('*/cartridge/scripts/helpers/homePageHelper');

/**
 * Any customization on this endpoint, also requires update for Default-Start endpoint
 */
/**
 * Home-ShowPromotions : This endpoint is called when a shopper navigates to the home page for promotions
 * @name Base/Home-ShowPromotions
 * @function
 * @memberof Home
 * @param {middleware} - consentTracking.consent
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('ShowPromotions', consentTracking.consent, function (req, res, next) {
    var activePromotions = homePageHelper.getAllActivePromotions();
    res.render('home/homePagePromotions', {
        promotions: activePromotions
    })
    next();
});

server.get('ShowMenuPromotions', consentTracking.consent, function (req, res, next) {
    res.render('components/header/menupromotions', {
    })
    next();
});


// server.get('ShowCustomForm', consentTracking.consent, function (req, res, next) {
//     var customForm = server.forms.getForm('customForm');
//     customForm.clear();
//     res.render('customForm', {
//         form: customForm
//     })
//     next();
// });

// server.get('ShowCustomFormSubmit', consentTracking.consent, function (req, res, next) {
//     var customForm = server.forms.getForm('customForm');
//     res.render('customFormSubmit', {
//         form: customForm
//     })
//     next();
// });

module.exports = server.exports();