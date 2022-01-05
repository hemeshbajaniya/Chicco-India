'use strict';

var server = require('server');


var BasketMgr = require('dw/order/BasketMgr');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');

var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');


var giftCardHelper = require('*/cartridge/scripts/easyrewardz/helper/giftCardHelper.js');

server.post('AppleGiftCard', 
            consentTracking.consent, 
            function (req, res, next) {

    var Locale = require('dw/util/Locale');
    
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');

    var giftCode = req.form.giftCardNo;
    var amount = req.form.giftCardAmount;
    var currentCustomer = req.currentCustomer.raw;

    var currentBasket = BasketMgr.getCurrentBasket();

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    var allValid = COHelpers.ensureValidShipments(currentBasket);
    var currentLocale = Locale.getLocale(req.locale.id);

    if (!empty(giftCode) && !empty(amount)) {
        var result = giftCardHelper.applyGiftGV(giftCode, amount);
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

server.post('SaveGV', 
            consentTracking.consent,
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {
    
    var Transaction = require('dw/system/Transaction');

    var gvNumber = req.form.gvNumber;
    var result = {
        error: false
    };

    if (!empty(gvNumber)) {
        try {
            if (customer && customer.authenticated && customer.profile) {
                if (!('gvCardsNo' in customer.profile.custom)) {
                    Transaction.wrap(function () {
                        customer.profile.custom.gvCardsNo = JSON.stringify(new Array(gvNumber));
                    });
                } else {
                    var gvNumbers = JSON.parse(customer.profile.custom.gvCardsNo);
                    gvNumbers.push(gvNumber);
                    Transaction.wrap(function () {
                        customer.profile.custom.gvCardsNo = JSON.stringify(gvNumbers);
                    });
                }
            }
            result.message='Gift Voucher Added!';
        } catch (ex) {
            result.message='Not able to add Gift Voucher Number';
            result.error = true;
            Logger.error('Error occured while try to add gv number:' + ex);
        }
    } else {
        result.message='Gift Voucher Number Required';
        result.error = true;
    }
    
    res.json(result);
    return next();
});

server.post('Remove', 
            consentTracking.consent,
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {
    
    var Transaction = require('dw/system/Transaction');

    var gvNumber = req.form.gvNumber;
    var result = {
        error: false
    };

    if (!empty(gvNumber)) {
        try {
            if (customer && customer.authenticated && customer.profile) {
               
                var gvNumbers = JSON.parse(customer.profile.custom.gvCardsNo);
                var gvIndex = gvNumbers.indexOf(gvNumber);
                if (gvIndex > -1) {
                    gvNumbers.splice(gvIndex, 1);
                  }
                Transaction.wrap(function () {
                    customer.profile.custom.gvCardsNo = JSON.stringify(gvNumbers);
                });
            }
            result.message='Gift Voucher Removed!';
        } catch (ex) {
            result.message='Not able to remove Gift Voucher Number';
            result.error = true;
            Logger.error('Error occured while try to remove gv number:' + ex);
        }
    } else {
        result.message='Gift Voucher Number Required';
        result.error = true;
    }
    
    res.json(result);
    return next();
});

server.post('SendToFriend', 
            consentTracking.consent,
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {
    
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');

    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var recipientEmail = req.form.recipientEmail;
    var recipientEmailConfirm = req.form.recipientConfirm;
    var pid = req.form.pid;
    var to = req.form.to;
    var from = req.form.from;
    var msg = req.form.msg;

    var result = {
        error: false
    };

    if (recipientEmail !== recipientEmailConfirm) {
        result.error = true;
        result.message = 'Recipient Email Mismatch!';
        res.json(result);
        return next();
    }

    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var defaultShipment = currentBasket.defaultShipment;

    Transaction.wrap(function () {
        var productLineItem = currentBasket.createProductLineItem(pid, defaultShipment);
        productLineItem.custom.gvIssueToEmail = recipientEmail
        productLineItem.custom.gvIssueTo = to;
        productLineItem.custom.gvIssueFrom = from;
        productLineItem.custom.gvIssueAmount = productLineItem.getAdjustedGrossPrice().value;
        productLineItem.custom.gvMsg = msg ? msg : '';
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    result.redirectURL = URLUtils.url('Cart-Show').toString();
    res.json(result);
    return next();
    
    
});

module.exports = server.exports();