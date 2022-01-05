'use strict';

/**
 * @namespace Order
 */

var server = require('server');
var page = module.superModule;

var server = require('server');

server.extend(page);

var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Order-Details : This endpoint is called to get Order Details
 * @name Base/Order-Details
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {querystringparameter} - orderID - Order ID
 * @param {querystringparameter} - orderFilter - Order Filter ID
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.replace(
    'Details',
    consentTracking.consent,
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        var OrderTracking = require('*/cartridge/scripts/shiprocket/model/OrderTracking');

        var order = OrderMgr.getOrder(req.querystring.orderID);
        var orderCustomerNo = req.currentCustomer.profile.customerNo;
        var currentCustomerNo = order.customer.profile.customerNo;
        var breadcrumbs = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            },
            {
                htmlValue: Resource.msg('label.orderhistory', 'account', null),
                url: URLUtils.url('Order-History').toString()
            }
        ];

        if (order && orderCustomerNo === currentCustomerNo) {
            var orderModel = orderHelpers.getOrderDetails(req);
            var result = increffOrderModel.getShippingLablesAndAWB(order);
            var orderTrackingResponse;
            var orderDeliveredDate;
            if (!result.error) {
               var orderAwbNumber = result.response.awbNo;
                orderTrackingResponse = OrderTracking.getOrderDelieveryInfo(orderAwbNumber);
                if (!orderTrackingResponse.error) {
                    orderDeliveredDate = OrderTracking.getOrderDeliveredDate(orderTrackingResponse.response);
                }
            }

            var exitLinkText = Resource.msg('link.orderdetails.orderhistory', 'account', null);
            var exitLinkUrl =
                URLUtils.https('Order-History', 'orderFilter', req.querystring.orderFilter);
            res.render('account/orderDetails', {
                order: orderModel,
                exitLinkText: exitLinkText,
                exitLinkUrl: exitLinkUrl,
                breadcrumbs: breadcrumbs,
                orderTracking: orderTrackingResponse,
                orderDeliveredDate: orderDeliveredDate
            });
        } else {
            res.redirect(URLUtils.url('Account-Show'));
        }
        next();
    }
);

module.exports = server.exports();
