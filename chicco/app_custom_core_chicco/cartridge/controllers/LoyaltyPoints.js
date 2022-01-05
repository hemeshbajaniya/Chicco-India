'use strict';

var server = require('server');


var BasketMgr = require('dw/order/BasketMgr');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');

var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

server.post('RedeemPoints', 
            consentTracking.consent,
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {

    var Locale = require('dw/util/Locale');
    
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');

    var loyaltyHelper = require('*/cartridge/scripts/easyrewardz/helper/loyaltyHelper');

    var points = req.form.points;
    var currentCustomer = req.currentCustomer.raw;

    var currentBasket = BasketMgr.getCurrentBasket();

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    var allValid = COHelpers.ensureValidShipments(currentBasket);
    var currentLocale = Locale.getLocale(req.locale.id);

    if (!empty(points)) {
        var result = loyaltyHelper.applyPoints(points);
        if (!result.error) {
            var orderModel = new OrderModel(
                currentBasket,
                {
                    customer: currentCustomer,
                    usingMultiShipping: usingMultiShipping,
                    shippable: allValid,
                    countryCode: currentLocale.country,
                    containerView: 'basket'
                }
            );
    
            var accountModel = new AccountModel(req.currentCustomer);
            result.order = orderModel;
            result.customer = accountModel
        }
        res.json(result);
    }
    return next();
});

module.exports = server.exports();