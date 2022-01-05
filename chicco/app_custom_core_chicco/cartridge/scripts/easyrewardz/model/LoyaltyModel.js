'use strict';

var Calendar = require('dw/util/Calendar');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');
var Site = require('dw/system/Site');

var AuthenticationModel = require('*/cartridge/scripts/easyrewardz/model/AuthenticationModel.js');
var easyRewardzServiceRegistry = require('*/cartridge/scripts/easyrewardz/services/easyRewardzServiceRegistry.js');

function getOrderPaymentMethods(Order) {
    var paymentObject = {
        TenderID: '',
        TenderCode: '',
        TenderValue: ''
    }
    var paymentArray = [];
    var pointUsed = 0;
    var pointValue = 0;

    if (Order.paymentInstruments[0].paymentMethod === 'PayU') {
        var paymentObject = {
            TenderID: 'PayU',
            TenderCode: 'PayU',
            TenderValue: Order.paymentInstruments[0].paymentTransaction.amount.valueOrNull
        }
        paymentArray.push(paymentObject);
    }

    var priceAdjustmentIterator = Order.getPriceAdjustments().iterator();
    while (priceAdjustmentIterator.hasNext()) {
        var priceAdjustment = priceAdjustmentIterator.next();
        if (priceAdjustment.promotionID === 'PROMOTIONAL-LOYALTY-DISCOUNT') {
            var paymentObject = {
                TenderID: 'Points',
                TenderCode: 'Points',
                TenderValue: Math.abs(priceAdjustment.getGrossPrice().valueOrNull)
            }
            pointUsed = priceAdjustment.custom.easyRewardzPointUsed;
            pointValue = Math.abs(priceAdjustment.getGrossPrice().valueOrNull);
            paymentArray.push(paymentObject);
        } else if (priceAdjustment.promotionID.includes('PROMOTIONAL-GV-DISCOUNT-')) {
            var paymentObject = {
                TenderID: 'Gift Voucher',
                TenderCode: 'Gift Voucher',
                TenderValue: Math.abs(priceAdjustment.getGrossPrice().valueOrNull)
            }
            paymentArray.push(paymentObject);
        }
    }

    return {paymentArray: paymentArray, pointUsed: pointUsed, pointValue: pointValue};
}

function getDateString(date) {
    var StringUtils = require('dw/util/StringUtils');
    var formattedDate = StringUtils.formatCalendar(date, 'dd MMM yyyy');
    return formattedDate;
}

function getLineItemsDiscount(priceAdjustments) {
    var priceAdjustmentsItr = priceAdjustments.iterator();
    var discount = 0;
    while(priceAdjustmentsItr.hasNext()) {
        var priceAdjustment = priceAdjustmentsItr.next();
        discount += priceAdjustment.getPriceValue();
    }
    return discount;
}

function getOrderLineItems(order) {
    var allLineItemsItr = order.getAllLineItems().iterator();
    var lineItemArray = [];
    while(allLineItemsItr.hasNext()) {
        var lineItem = allLineItemsItr.next();
        var itemQunaity;
        var lineItemName;
        var lineItemDiscount = 0;
        var categoryID = 'N/A';
        var categoryDisplayName = 'N/A';
        var department = 'N/A';
        if (lineItem instanceof dw.order.ShippingLineItem) {
            itemQunaity = 1;
            lineItemName = 'Standard Shipping';
            lineItemDiscount = getLineItemsDiscount(lineItem.shippingPriceAdjustments);
        } else if (lineItem instanceof dw.order.ProductLineItem) {
            itemQunaity = lineItem.quantityValue;
            lineItemName = lineItem.getProductName();
            lineItemDiscount = getLineItemsDiscount(lineItem.getPriceAdjustments());
            categoryID = lineItem.product.classificationCategory ? lineItem.product.classificationCategory.ID: 'N/A';
            categoryDisplayName = lineItem.product.classificationCategory ? lineItem.product.classificationCategory.displayName: 'N/A';
            department = lineItem.product.primaryCategory ? lineItem.product.primaryCategory.displayName: 'N/A';
        } else if (lineItem instanceof dw.order.PriceAdjustment) {
            itemQunaity = lineItem.quantity;
            if (itemQunaity == 0) {
                itemQunaity = 1;
            }
            lineItemName = 'Order Level Discount';
        }

        var unit = lineItem.getPriceValue() / itemQunaity;
        var productItem = {
            ItemType: 's',
            ItemQty: itemQunaity,
            ItemName: lineItemName,
            Size: '',
            Unit: unit,
            ItemDiscount: lineItemDiscount,
            ItemTax: lineItem.getTax().valueOrNull,
            TotalPrice: lineItem.getPriceValue(),
            BilledPrice: lineItem.getGrossPrice().valueOrNull,
            Department: categoryID,
            Category: categoryDisplayName,
            Group: categoryID,
            ItemId: lineItem.getUUID(),
            RefBillNo: ''
        };
    lineItemArray.push(productItem);
    }
    return lineItemArray;
}

function prepareSendOrderDetailsPayLoad(authToken, order) {
    var paymentDetails = getOrderPaymentMethods(order);
    var payLoad = {
        SecurityToken: authToken,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        TransactionDate: getDateString(new Calendar(order.getCreationDate())),
        BillNo: order.getOrderNo(),
        EasyId: order.getBillingAddress().getPhone(),
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        Channel: 'Online',
        CustomerType: 'Loyalty',
        BillValue: order.getTotalGrossPrice().valueOrNull,
        PointsRedeemed: paymentDetails.pointUsed,
        PointsValueRedeemed: paymentDetails.pointValue,
        PrimaryOrderNumber: '',
        SKUOfferCode: '',
        CountryCode: '91',
        TransactionItems: {
            TransactionItem: getOrderLineItems(order)
        },
        PaymentMode: {
            TenderItem: paymentDetails.paymentArray
        }
    };
    return payLoad;
}

function prepareCustomerLoyalityPointsPayLoad(authToken, memeberID) {
    var payLoad = {
        SecurityToken: authToken,
        EasyId: memeberID,
        ActivityCode: Site.current.preferences.custom.easyRewardzActivityCode,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        CountryCode: '91'
    };
    return payLoad;
}

function prepareBlockLoyaltyRedemptionPayLoad(authToken, memeberID, points, basket) {
    var payLoad = {
        SecurityToken: authToken,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        EasyId: memeberID,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        TransactionCode: basket.UUID,
        RedemptionDate: getDateString(Site.current.calendar),
        Amount: basket.getTotalGrossPrice().valueOrNull,
        RedemptionType: 'PD',
        EasyPoints: points,
        ActivityCode: Site.current.preferences.custom.easyRewardzActivityCode,
        TransactionDescription: '',
        Activities: '',
        CountryCode: '91'
    }
    return payLoad;
}

function prepareRedeemPointsPayLoad(authToken, memberId, order) {
    var payLoad = {
        SecurityToken: authToken,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        EasyId: memberId,
        TransactionCode: order.custom.loyaltyBillNo,
        RedemptionCode: '',
        EOSS: '0',
        NONEOSSAmount: '0',
        NetAmount: '0',
        CountryCode: '91',
        NewTransactionCode: order.orderNo
    }
    return payLoad;
}

function prepareReleasePointsPayLoad(authToken, memberId, billId) {
    var payLoad = {
        SecurityToken: authToken,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        EasyId: memberId,
        TransactionCode: billId,
        TransactionDate: getDateString(Site.current.calendar),
        CountryCode: '91'
    };
    return payLoad;
}

function sendOrderDetails(order) {
    var result = {
        error: false,
        message: ''
    };
    try {
        var authToken = AuthenticationModel.getAuthToken();
        var requestPayLoad = prepareSendOrderDetailsPayLoad(authToken, order);
        var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'SaveSKUBillDetails');
        if (!empty(response) && response.ReturnCode == '0') {
            result.message = 'Billing details saved';
        } else {
            Logger.error('(LoyalityModel~sendOrderDetails) -> Error occured while try to send order details: Reason code : {0}' , response.ReturnMessage);
            result.message = response.ReturnMessage;
            result.error = true;
        }
    } catch (ex) {
        Logger.error('(LoyalityModel~sendOrderDetails) -> Error occured while try to send order details: Error : {0} line number: {1}' , ex, ex.lineNumber);
        result.error = true;
    }
    return result;
}

function getCustomerLoyalityPoints(profile, isRealTime) {
    var result = {
        error: false
    };
    try {
        // if value exists then don't make a real time call just use session
        if (!empty(session.privacy.availablePoints) && !empty(session.privacy.pointValue) && !isRealTime) {
            result.availablePoints = session.privacy.availablePoints;
            result.pointValue = session.privacy.pointValue;
        } else {
            // if session empty then make real time API call
            var authToken = AuthenticationModel.getAuthToken();
            var requestPayLoad = prepareCustomerLoyalityPointsPayLoad(authToken, profile.phoneHome);
            var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'CustomerAvailablePoints');
            if (!empty(response) && response.ReturnCode == '0') {
                result.availablePoints = response.AvailablePoints;
                result.pointValue = session.currency.symbol + response.PointValue;
                session.privacy.availablePoints = response.AvailablePoints;
                session.privacy.pointValue = session.currency.symbol + response.PointValue;
            } else {
                Logger.error('(LoyalityModel~getCustomerLoyalityPoints) -> Error occured while try to get customer points details: Reason code : {0}' , response.ReturnMessage);
                result.message = response.ReturnMessage;
                result.error = true;
            }
        }
    } catch (ex) {
        Logger.error('(LoyalityModel~getCustomerLoyalityPoints) -> Error occured while try to get customer points details: Error : {0} line number: {1}' , ex, ex.lineNumber);
        result.error = true;
    }
    return result;
}

function blockPointRedemption(basket, points) {
    var result = {
        error: false
    };

    var billingAddress = basket.getBillingAddress();
    var memeberId = billingAddress.getPhone();
    try {
        var authToken = AuthenticationModel.getAuthToken();
        var requestPayLoad = prepareBlockLoyaltyRedemptionPayLoad(authToken, memeberId, points, basket);
        var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'CheckForEasyPointsRedemption');
        if (!empty(response) && response.ReturnCode == '0') {
            result.cashWorthPoints = response.CashWorthPoints;
            result.blanceToPay = response.BalanceToPay;
            result.billNo = response.BillNo;
        } else {
            Logger.error('(LoyalityModel~blockPointRedemption) -> Error occured while try to block customer points redemption: Reason code : {0}' , response.ReturnMessage);
            result.message = response.ReturnMessage;
            result.returnCode = response.ReturnCode;
            result.error = true;
        }
    } catch (ex) {
        Logger.error('(LoyalityModel~blockPointRedemption) -> Error occured while try to block customer points redemption: Error : {0} line number: {1}' , ex, ex.lineNumber);
        result.error = true;
        result.message = 'Opps! Something went wrong, Please try again later';
    }

    return result;
}

function redeemPoints(order) {
    var result = {
        error: false
    };
    try {
        var authToken = AuthenticationModel.getAuthToken();
        var requestPayLoad = prepareRedeemPointsPayLoad(authToken, order.getBillingAddress().getPhone(), order);
        var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'ConfirmEasyPointsRedemption');
        if (!empty(response) && response.ReturnCode == '0') {
            result.redemptionId = response.RedemptionId;
        } else {
            Logger.error('(LoyalityModel~redeemPoints) -> Error occured while try to redeem customer points: Reason code : {0}' , response.ReturnMessage);
            result.message = response.ReturnMessage;
            result.error = true;
        }
    } catch (ex) {
        Logger.error('(LoyalityModel~blockPointRedemption) -> Error occured while try to redeem customer points: Error : {0} line number: {1}' , ex, ex.lineNumber);
        result.error = true;
        result.message = 'Opps! Something went wrong, Please try again later';
    }

    return result;
}

function relaseBlockedRedemption(basket) {

    var result = {
        error: false
    };

    var billingAddress = basket.getBillingAddress();
    var memeberId = billingAddress.getPhone();
    try {
        var authToken = AuthenticationModel.getAuthToken();
        var requestPayLoad = prepareReleasePointsPayLoad(authToken, memeberId, basket.UUID);
        var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'ReleaseRedemptionPoints');
        if (!empty(response) && response.ReturnCode == '0') {
            result.message = response.ReturnMessage;
        } else {
            Logger.error('(LoyalityModel~relaseBlockedRedemption) -> Error occured while try to unblock customer points redemption: Reason code : {0}' , response.ReturnMessage);
            result.message = response.ReturnMessage;
            result.returnCode = response.ReturnCode;
            result.error = true;
        }
    } catch (ex) {
        Logger.error('(LoyalityModel~blockPointRedemption) -> Error occured while try to unblock customer points redemption: Error : {0} line number: {1}' , ex, ex.lineNumber);
        result.error = true;
        result.message = 'Opps! Something went wrong, Please try again later';
    }

    return result;
}

module.exports = {
    sendOrderDetails: sendOrderDetails,
    getCustomerLoyalityPoints: getCustomerLoyalityPoints,
    blockPointRedemption: blockPointRedemption,
    redeemPoints: redeemPoints,
    relaseBlockedRedemption: relaseBlockedRedemption
}