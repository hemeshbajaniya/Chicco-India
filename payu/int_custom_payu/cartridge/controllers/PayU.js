var server = require('server');

var Logger = require('dw/system/Logger');
var OrderMgr = require('dw/order/OrderMgr');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

var payUAPIModel = require('*/cartridge/scripts/models/payUAPIModel');
var payUHelper = require('*/cartridge/scripts/helpers/payUHelper');

server.get('Redirect',server.middleware.https, function (req, res, next) {
    var queryString = req.querystring;
    var orderID = queryString.orderNo;
    var orderToken = queryString.orderToken;
    var order = '';
    var orderPayLoad = '';
    if (!empty(orderID) && !empty(orderToken)) {
        try {
            order = OrderMgr.getOrder(orderID, orderToken);
            orderPayLoad = payUAPIModel.getOrderPayLoad(order);
            session.privacy.orderToken = orderToken;
            session.privacy.orderID = orderID;
            res.render('checkout/payURedirect', orderPayLoad);
            return next();
        } catch (ex) {
            Logger.getLogger('PayU').error('(PayU~Redirect) Error occured while try to get order payload and exception is: {0}', ex);
            res.redirect(URLUtils.url('Error-ErrorCode', 'err', Resource.msg('error.technical', 'checkout', null)).toString());
            return next();
        }
    } else {
        res.redirect(URLUtils.url('Error-ErrorCode', 'err', Resource.msg('error.technical', 'checkout', null)).toString());
        return next();
    }
});

server.post('Success',server.middleware.https, function (req, res, next) {
    var queryString = request.httpParameterMap;
    var orderID = queryString.txnid.value;
    var orderToken = session.privacy.orderToken;
    var paymentStatus = queryString.status.value;
    var order = '';
    if (!empty(session.privacy.orderID) && session.privacy.orderID !== orderID) {
        Logger.info('(PayU~Success) -> Error occured while try to process order {0}' , orderId);
        res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null)).toString());
        return next();
    }

    var orderPayLoad = {
        firstName: queryString.firstname.value,
        amount: queryString.amount.value,
        txnid: queryString.txnid.value,
        hash: queryString.hash.value,
        productinfo: queryString.productinfo.value,
        phone: queryString.phone.value,
        email: queryString.email.value,
        payuMoneyId: queryString.mihpayid.value,
        mode: queryString.PG_TYPE.value,
        status: paymentStatus,
        udf1: '',
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: ''
    };

    
    if (!empty(orderID) && !empty(orderToken)) {
        Logger.info('(PayU~Success) -> Starting processing the order after payu redirect:{0}' , orderID);
        try {
            order = OrderMgr.getOrder(orderID, orderToken);
            if (!empty(order)) {
                Logger.info('(PayU~Success) -> Inside order not empty check for order:{0}' , orderID);
                var payUReponseHash = payUHelper.getPayUResponseHash(orderPayLoad);
                if (payUReponseHash !== orderPayLoad.hash) {
                    Logger.info('(PayU~Success) -> PayU Hash and order hash missedmatch therefore sending customer to checkout for order:{0}' , orderID);
                    payUHelper.failOrder(order);
                    res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null) + " status:" + paymentStatus).toString());
                    return next();
                } else {
                    Logger.info('(PayU~Success) -> payu hash and order has matched therefore going to handle the payment for order:{0}' , orderID);
                    // verify the order status and place the order
                    var result = payUHelper.hanldePayUPaymentState(order, paymentStatus, orderPayLoad);
                    if (!result.error) {
                        Logger.info('(PayU~Success) -> payu payment hanlded sucessfully moving to next parts for order:{0}' , orderID);
                        // Redirect to payment confirmation stage
                        session.privacy.orderID = '';
                        session.privacy.orderToken = '';
                        // gift redeem logic Start
                        try {
                            if (!empty(order.custom.gvRequestID)) {
                                var giftCardHelper = require('*/cartridge/scripts/easyrewardz/helper/giftCardHelper.js');
                                giftCardHelper.redeemGiftGV(order);
                                // gift redeem logic end
                            }    
                        } catch (ex) {
                            Logger.getLogger('EasyRewardz').error('(PayU~Success) Error occured while try to redeem GV for easyrewards against order no:{0} and exception is: {1}',orderID, ex.toString());
                        }

                        try {
                            // Added send gift cards logic
                            var giftCardHelper = require('*/cartridge/scripts/easyrewardz/helper/giftCardHelper.js');
                            giftCardHelper.issueGVToCustomer(order);
                        } catch (ex) {
                            Logger.getLogger('EasyRewardz').error('(PayU~Success) Error occured while try to send GV to easyrewards for order no:{0} and exception is: {1}',orderID, ex.toString());
                        }
                        // Loyality point logic Start
                        try {
                            var LoyaltyModel = require('*/cartridge/scripts/easyrewardz/model/LoyaltyModel.js');
                            LoyaltyModel.sendOrderDetails(order);
                            // Loyality point logic End
                        } catch (ex) {
                            Logger.getLogger('PayU').error('(PayU~Success) Error occured while try to send order information to easyrewards for order:{0} and exception is: {1}', orderID, ex.toString());
                        }
                        // Loyalty Point Redemption Logic Start
                        try {
                            if (!empty(order.custom.loyaltyBillNo)) {
                                var loyaltyHelper = require('*/cartridge/scripts/easyrewardz/helper/loyaltyHelper');
                                loyaltyHelper.redeemPoints(order);
                            }
                        } catch (ex) {
                            Logger.getLogger('PayU').error('(PayU~Success) Error occured while try to send order information  to easyrewards for loyalty points for order no:{0} and exception is: {1}', orderID, ex.toString());
                        }
                        // Loyalty Point Redemption Logic End
                        Logger.info('(PayU~Success) -> Going to send order to increff for order placement against order:{0}' , orderID);
                        try {
                            var IncreffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
                            IncreffOrderModel.createOrder(order);
                        } catch (ex) {
                            Logger.info('(PayU~Success) -> Error occured while try to process order {0}' , orderID);
                            Logger.getLogger('PayU').error('(PayU~Success) Error occured while try to send order information  to increff and exception is: {0}', ex);
                        }
                        Logger.info('(PayU~Success) -> order is successfully placed now redirecting customer to confirmation page for order no {0}' , orderID);
                        res.redirect(URLUtils.url('Order-Confirm', 'ID', order.orderNo, 'token', order.orderToken).toString());
                        return next();
                    }
                }
            } else {
                Logger.info('(PayU~Success) -> Error occured while try to process order {0}' , orderID);
                payUHelper.failOrder(order);
                res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null) + " status:" + paymentStatus).toString());
                return next();
            }
            payUHelper.failOrder(order);
            res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null) + " status:" + paymentStatus).toString());
            return next();
        } catch (ex) {
            Logger.info('(PayU~Success) -> Error occured while try to process order {0}' , orderID);
            Logger.getLogger('PayU').error('(PayU~Success) Error occured while try to save order information and exception is: {0}', ex);
            // Redirect to payment step
            res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null) + " status:" + paymentStatus).toString());
            return next();
        }
    } else {
        Logger.info('(PayU~Success) -> Error occured while try to process order {0}' , orderID);
        // Redirect to payment step
        res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null) + " status:" + paymentStatus).toString());
        return next();
    }
});

server.post('Error',server.middleware.https, function (req, res, next) {
    var orderID = session.privacy.orderID;
    var orderToken = session.privacy.orderToken;
    if (!empty(orderID) && !empty(orderToken)) {
        try {
            order = OrderMgr.getOrder(orderID, orderToken);
            payUHelper.failOrder(order);
            res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null)).toString());
            return next();
        } catch (ex) {
            Logger.info('(PayU~Success) -> Error occured while try to process order {0}' , orderID);
            Logger.getLogger('PayU').error('(PayU~Error) Error occured while try to render the payU error and exception is: {0}', ex);
            res.redirect(URLUtils.url('Error-ErrorCode', 'err', Resource.msg('error.technical', 'checkout', null)).toString());
            return next();
        }
    } else {
        Logger.info('(PayU~Success) -> Error occured while try to process order {0}' , orderID);
        res.redirect(URLUtils.url('Error-ErrorCode', 'err', Resource.msg('error.technical', 'checkout', null)).toString());
        return next();
    }
});

module.exports = server.exports();
