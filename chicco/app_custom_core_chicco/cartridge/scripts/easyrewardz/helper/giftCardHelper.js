'use strict';

var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');

var GiftCardModel = require('*/cartridge/scripts/easyrewardz/model/GiftCardModel.js');
/**
* private function to apply price adjustments
*/
function applyPriceAdjustment(basket, amount, GVCode) {
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var priceAdjustmentIterator = basket.getPriceAdjustments().iterator();
    while (priceAdjustmentIterator.hasNext()) {
        var priceAdjustment = priceAdjustmentIterator.next();
        if (priceAdjustment.promotionID === 'PROMOTIONAL-GV-DISCOUNT-' + GVCode) {
            basket.removePriceAdjustment(priceAdjustment);
        }
    }

    var amountDiscount = new dw.campaign.AmountDiscount(amount);
    basket.createPriceAdjustment('PROMOTIONAL-GV-DISCOUNT-' + GVCode, amountDiscount);
    basketCalculationHelpers.calculateTotals(basket);
}

/**
 * Global function to apply giftCard
 */
function applyGiftGV(GVCode, amount) {
    var result = {
        error: false
    };
    var basket = BasketMgr.getCurrentBasket();
    var basketTotal = basket.getTotalGrossPrice();

    if (amount > basketTotal) {
        result.error = true;
        result.message = 'Gift Amount can not be greate then order total';
        return result;
    }

    var billingAddress = basket.getBillingAddress();
    var memeberId = billingAddress.getPhone();

    var serviceResponse = GiftCardModel.verifyGV(memeberId, GVCode);
    if (!serviceResponse.error) {
         var blance = serviceResponse.GVBalance;
         var status = serviceResponse.GVStatus;

        // if gift card expired
        if (status !== 'Approved' && status === 'Blocked') {
            result.error = true;
            result.message = 'Your Gift Card Already Applied';
            return result;
        }

        if (status === 'Used') {
            result.error = true;
            result.message = 'Your Gift Card Already Used';
            return result;
        }

        // if gift card had low blance
        if (amount > blance) {
            result.error = true;
            result.message = 'You do not have enough blance in your gift card';
            return result;
        }

        // apply gift card
        // step: 1 block gift card
        var redeemServiceResponse = GiftCardModel.blockedGVRedemption(memeberId, GVCode, amount);
        if (!redeemServiceResponse.error) {
            var requestID = redeemServiceResponse.requestID;
            try {
                Transaction.wrap(function () {
                    basket.custom.gvRequestID = requestID;
                    basket.custom.gvCode = GVCode;
                    basket.custom.gvAmount = amount;
                    applyPriceAdjustment(basket, amount, GVCode);
                });
            } catch (ex) {
                Logger.error('giftCardHelper~applyGiftGV -> Error occured while try to redeem gift card, Exception {0}', ex);
                result.error = true;
                result.message = 'Internal error occured';
                return result;
            }
            
            result.error = false;
            result.message = 'Gift Card Applied Sucessfully';
            return result;

        } else {
            result.error = true;
            result.message = redeemServiceResponse.message;
            return result;
        }

    } else {
        result.error = true;
        result.message = serviceResponse.message;
        return result;
    }

}

/**
* Global function to redeem giftCard
*/
function redeemGiftGv(order) {
    var result = {
        error: true
    };
    var redeemServiceResponse = GiftCardModel.redeemGV(order);
    if (!redeemServiceResponse.error) {
        result.error = false;
    }

    return result;
}

/** 
 *  Global function to remove giftCard
 */
function removeGiftGV() {
    var result = {
        error: false
    };
    var basket = BasketMgr.getCurrentBasket();
    var billingAddress = basket.getBillingAddress();
    var memeberId = billingAddress.getPhone();

    var GVCode = basket.custom.gvCode;
    var amount = basket.custom.gvAmount;
    var unBlockService = GiftCardModel.unblockGV(memeberId, GVCode, amount);
    if (!unBlockService.error) {
        result.message = unBlockService.message;
        // Remove Pirce Adjustments
        Transaction.wrap(function () {
            basket.custom.gvRequestID = '';
            basket.custom.gvCode = '';
            basket.custom.gvAmount = '';
            removePriceAdjustment(basket, GVCode);
        });
    } else {
        result.error = true;
        result.message = unBlockService.message;
    }
    return result;
}

function getCustomerRedemptionHistory(profile) {
    var phoneNo = profile.phoneHome;
    var startDate = profile.getCreationDate();
    var historyService = GiftCardModel.getCustomerRedemptionHistory(phoneNo, startDate);
    return historyService;
}

function issueGVToCustomer(order) {

    var result = {
        error: false
    }

    var gvLineItems;
    var productLineItems = order.getProductLineItems();
    var productLineItemsItator = productLineItems.iterator();
    while(productLineItemsItator.hasNext()) {
        var productLineItem = productLineItemsItator.next();
        if (!empty(productLineItem.custom.gvIssueAmount)) {
            gvLineItems = productLineItem;
            break;
        }
    }

    if (!empty(gvLineItems)) {
        // TODO : Still need to pass gvIssueTo, gvIssueFrom, gvMsg to EasyRewards
        var issueService = GiftCardModel.issueGVToCustomer(order.getBillingAddress().getPhone(), gvLineItems.custom.gvIssueToEmail, gvLineItems.custom.gvIssueAmount);
        if (!issueService.error) {
            Transaction.wrap(function () {
                gvLineItems.custom.gvGiftCode = issueService.response.GVCode;
                gvLineItems.custom.gvIssueAmount = issueService.response.GVValue;
                order.custom.gvIssued = true;
            });
            return result;
        }
    }
    result.error = true;
    return result;
    // Custom attributes
    //lineItem.custom.gvIssueToEmail
    //lineItem.custom.gvIssueTo
    //lineItem.custom.gvIssueFrom
    //lineItem.custom.gvIssueAmount
    //lineItem.custom.gvGiftCode
    //lineItem.custom.gvMsg
    //Order.custom.gvIssued : boolean
}

module.exports = {
    applyGiftGV: applyGiftGV,
    redeemGiftGV: redeemGiftGv,
    removeGiftGV: removeGiftGV,
    getCustomerRedemptionHistory: getCustomerRedemptionHistory,
    issueGVToCustomer: issueGVToCustomer
}