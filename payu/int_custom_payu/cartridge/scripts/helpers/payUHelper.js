'use strict';

var Bytes = require('dw/util/Bytes');
var Encoding = require('dw/crypto/Encoding');
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var Transaction = require('dw/system/Transaction');
var MessageDigest = require('dw/crypto/MessageDigest');
var Site = require('dw/system/Site');
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

var constants = require('*/cartridge/scripts/utils/payUConstants');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

/**
 * function used to get payU request hash
 * 
 * @param {Object} orderPayLoad - The current customer orderPayLoad
 * @return {String} returns hashed string
 * 
 * */
function getPayURequestHash(orderPayLoad) {
    var payUHashString = orderPayLoad.key + constants.PAYU_HASH_SEPRATOR + orderPayLoad.txnid + constants.PAYU_HASH_SEPRATOR + orderPayLoad.amount
    + constants.PAYU_HASH_SEPRATOR + orderPayLoad.productinfo + constants.PAYU_HASH_SEPRATOR + orderPayLoad.customerInfo.firstname + constants.PAYU_HASH_SEPRATOR
    + orderPayLoad.customerInfo.email + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf1 + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf2 + constants.PAYU_HASH_SEPRATOR
    + orderPayLoad.udf2 + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf2 + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf3 + constants.PAYU_HASH_SEPRATOR
    + orderPayLoad.udf4 + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf5 + constants.PAYU_HASH_SEPRATOR + constants.PAYU_HASH_SEPRATOR 
    + constants.PAYU_HASH_SEPRATOR + constants.PAYU_HASH_SEPRATOR
    + orderPayLoad.salt;

    var encryptedPayUToken = new MessageDigest(MessageDigest.DIGEST_SHA_512).digest(payUHashString);
    return encryptedPayUToken;
}

/**
 * function used to get payU request hash
 * 
 * @param {Object} orderPayLoad - The current customer orderPayLoad
 * @return {String} returns hashed string
 * 
 * */
function getPayUResponseHash(orderPayLoad) {
    var payUHashString = Site.current.preferences.custom.payUSaltKey + constants.PAYU_HASH_SEPRATOR + orderPayLoad.status + constants.PAYU_HASH_SEPRATOR + constants.PAYU_HASH_SEPRATOR
    + constants.PAYU_HASH_SEPRATOR + constants.PAYU_HASH_SEPRATOR + constants.PAYU_HASH_SEPRATOR + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf5 + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf4
    + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf3 + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf2 + constants.PAYU_HASH_SEPRATOR + orderPayLoad.udf1
    + constants.PAYU_HASH_SEPRATOR + orderPayLoad.email + constants.PAYU_HASH_SEPRATOR + orderPayLoad.firstName + constants.PAYU_HASH_SEPRATOR + orderPayLoad.productinfo + constants.PAYU_HASH_SEPRATOR 
    + orderPayLoad.amount + constants.PAYU_HASH_SEPRATOR
    + orderPayLoad.txnid + constants.PAYU_HASH_SEPRATOR + Site.current.preferences.custom.payUMerchantKey;
    var encryptedPayUToken = new MessageDigest(MessageDigest.DIGEST_SHA_512).digest(payUHashString);
    return encryptedPayUToken;
}

/**
 * function used to get payU request hash for webservice
 * 
 * */
function getPayUWebServiceHash(payUKey, command, transationID, payUSalt) {
    var payUHashString = payUKey + constants.PAYU_HASH_SEPRATOR + command + constants.PAYU_HASH_SEPRATOR
    + transationID + constants.PAYU_HASH_SEPRATOR + payUSalt;
    var encryptedPayUToken = new MessageDigest(MessageDigest.DIGEST_SHA_512).digest(payUHashString);
    return encryptedPayUToken;
}

/**
 * function used to get payU request hash
 * 
 * @param {dw.order.Order} Order - The current customer order
 * @param {Object} orderPayLoad - The current customer orderPayLoad
 * @param {String} status - The current customer payment status
 * @return {String} returns is payment is success or error
 * 
 * */
function hanldePayUPaymentState(order, status, orderPayLoad) {
    var result = {error: true};
    switch (status) {
        case 'pending':
            failOrder(order);
            break;
        case 'failure':
            failOrder(order);
            break;
        case 'success':
         // Place the order and send the confirmation email
         try {
            var orderResult = placeOrder(order, orderPayLoad);
            if (!orderResult.error) {
                COHelpers.sendConfirmationEmail(order, 'en_US');
                result.error = false;
            }
         } catch (error) {
            var exception = error;
		    var message = "An error occured with status code " + error;
            Logger.error('(payuHelper~hanldePayUPaymentState) -> error occured while try to check the payment status for order no:{1} and error:{2} at line:{3} in file:{4}', order.orderNo, error.toString(), error.lineNumber, error.fileName);
         }
         break;
       default:
           failOrder(order);
           break;
    }
    return result;
}

/**
 * function used to fail an order
 * 
 * @param {dw.order.Order} Order - The current customer order
 * 
 * */
function failOrder(order) {
    Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
}

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} orderPayLoad - an Object returned by orderPayLoad
 * @returns {Object} an error object
 */
function placeOrder(order, orderPayLoad) {
    var result = { error: false };

    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }
       
        order.paymentInstruments[0].paymentTransaction.setTransactionID(orderPayLoad.payuMoneyId);
        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        order.setExportStatus(Order.EXPORT_STATUS_READY);
        order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
        Transaction.commit();
    } catch (e) {
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        result.error = true;
    }

    return result;
}
exports.getPayURequestHash = getPayURequestHash;
exports.getPayUResponseHash = getPayUResponseHash;
exports.hanldePayUPaymentState = hanldePayUPaymentState
exports.failOrder = failOrder;
exports.getPayUWebServiceHash = getPayUWebServiceHash;
