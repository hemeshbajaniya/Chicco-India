'use strict';

var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');

var LoyaltyModel = require('*/cartridge/scripts/easyrewardz/model/LoyaltyModel.js');

/**
* private function to apply price adjustments
*/
function applyPriceAdjustment(basket, amount, points) {
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var priceAdjustmentIterator = basket.getPriceAdjustments().iterator();
    while (priceAdjustmentIterator.hasNext()) {
        var priceAdjustment = priceAdjustmentIterator.next();
        if (priceAdjustment.promotionID === 'PROMOTIONAL-LOYALTY-DISCOUNT') {
            basket.removePriceAdjustment(priceAdjustment);
        }
    }

    var amountDiscount = new dw.campaign.AmountDiscount(amount);
    var priceAdjustments = basket.createPriceAdjustment('PROMOTIONAL-LOYALTY-DISCOUNT', amountDiscount);
    priceAdjustments.custom.easyRewardzPointUsed = points;
    basketCalculationHelpers.calculateTotals(basket);
}

function applyPoints(points) {
    var result = {
        error: false
    };
    var basket = BasketMgr.getCurrentBasket();
    var customerProfile = basket.getCustomer().profile;

    // Release redemption if any so that customer can update their points
    // var releaseRedemptionResponse = LoyaltyModel.relaseBlockedRedemption(basket);

    var apiResponse = LoyaltyModel.blockPointRedemption(basket, points);
    if (apiResponse.error) {
        if (apiResponse.returnCode == '174' || apiResponse.returnCode == '173') {
            // Make API call to display the points as customer doesn't have any points
            var customerPointAPI = LoyaltyModel.getCustomerLoyalityPoints(customerProfile , true);

            result.error = true;
            result.message = 'You did not have enough points to redeem';
            result.availablePoints = customerPointAPI.availablePoints;
            result.pointValue = customerPointAPI.pointValue;

        } else if (apiResponse.returnCode == '260') {
            // points already redeem for this order
            result.error = true;
            result.message = 'Opps! Looks like your point already applied to this order';

        } else if (apiResponse.returnCode == '261') {
            // points already applied
            result.error = true;
            result.message = 'Points already applied to your order';

        
        } else if (apiResponse.returnCode == '258' || apiResponse.returnCode == '258' || apiResponse.returnCode == '169' || apiResponse.returnCode == '174') {
            // No points exists
            result.error = true;
            result.message = 'No points avalible for redemption';
        } else if (apiResponse.returnCode == '384') {
            // transation already in progress
            result.error = true;
            result.message = 'Points Already redeemed!';
        } else {
            // general case
            result.error = true;
            result.message = 'Not able to redeem your points! Contact support if you see this message several time';
        }

    } else {
        // sucess case
        var amount = apiResponse.cashWorthPoints;
        var easyRewardzbillNo = apiResponse.billNo;
        var balanceToPay = apiResponse.blanceToPay;
        var basketTotal = basket.getTotalGrossPrice();

        if (amount > basketTotal) {
            result.error = true;
            result.message = 'Loyalty Amount can not be greate then order total';
            LoyaltyModel.relaseBlockedRedemption(basket);
            return result;
        }

        var customerPointAPI = LoyaltyModel.getCustomerLoyalityPoints(customerProfile , true);
        result.availablePoints = customerPointAPI.availablePoints;
        result.pointValue = customerPointAPI.pointValue;
        try {
            Transaction.wrap(function () {
                basket.custom.loyaltyBillNo = easyRewardzbillNo;
                applyPriceAdjustment(basket, amount, points);
            });
            result.message = points + ' Points Redeemed Successfully!';
        } catch (ex) {
            Logger.error('loyaltyHelper~applyPoints -> Error occured while try to apply loyalty points, Exception {0}', ex, ex.lineNumber);
            result.error = true;
            result.message = 'Internal error occured';
        }
    }

    return result;
}

function redeemPoints(order) {
    var response = LoyaltyModel.redeemPoints(order);
    var redemptionId = '';
    if (!response.error) {
         redemptionId = response.redemptionId;
    } else {
         redemptionId = response.message;
    }
    Transaction.wrap(function () {
        order.custom.loyaltyredemptionId = redemptionId;
    });
}

module.exports = {
    applyPoints: applyPoints,
    redeemPoints: redeemPoints
}