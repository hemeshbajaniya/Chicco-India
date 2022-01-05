var server = require('server');

var Site = require('dw/system/Site');

var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var increffAuthentication = require('*/cartridge/scripts/increff/middleware/authenticate');


server.put('UpdateInventory', 
            increffAuthentication.validateRequest,
            function (req, res, next) {
    
    var result = {
        statusCode: 200,
        response: {
            failureList: [],
            successList: []
        }
    };
    var inventoriesJSON = JSON.parse(req.body);
    if (inventoriesJSON.locationCode === Site.current.preferences.custom.increffLocationCode) {

        // its a valid location update the invenotry
        var inventoryHelper = require('*/cartridge/scripts/increff/helpers/inventoryHelper');
        result = inventoryHelper.saveIncreffRequestJSON(req.body, request.requestID);
        if (!result.success) {
            result.statusCode = 400;
        } else {
            result.statusCode = 200;
        }
    }
    res.json(result.response);
    res.setStatusCode(result.statusCode);
    return next();
});

server.put('SellerCancellation', 
            increffAuthentication.validateRequest,
            function (req, res, next) {
    
    var result;
    var orderJOSN = JSON.parse(req.body);

    var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
    result = increffOrderModel.CancellationBySeller(orderJOSN, request.requestID);
    res.setStatusCode(result.status);
    res.json('');
    return next();
});

server.post('CustomerCancellation', 
           consentTracking.consent, 
           userLoggedIn.validateLoggedIn,
            function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');

    var result;
    var orderID = req.form.orderID;
    var order = OrderMgr.getOrder(orderID);

    if (!empty(order)) {
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        result = increffOrderModel.CancellationByCustomer(order);
    } else {
        result = {
            error: true,
            message: 'Invalid order id'
        };
    }
    res.json(result);
    return next();
});

server.post('PackSalesOrder', 
            increffAuthentication.validateRequest,
            function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');

    var result;
    var orderJOSN = JSON.parse(req.body);
    var order = OrderMgr.getOrder(orderJOSN.orderCode);

    if (!empty(order)) {
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        result = increffOrderModel.packSalesOrder(order, orderJOSN);
    } else {
        result = {
            response: 'Invalid order id',
            status: 400
        };
    }
    res.json(result.response);
    res.setStatusCode(result.status);
    return next();
});

server.post('GetOrderInvoice', 
            consentTracking.consent, 
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');

    var result;
    var orderID = req.form.orderID;
    var order = OrderMgr.getOrder(orderID);

    if (!empty(order)) {
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        result = increffOrderModel.getOrderInvoice(orderID);
    } else {
        result = {
            error: true,
            message: 'Invalid order id'
        };
    }
    res.json(result);
    return next();
});

server.post('CreateReturns', 
           consentTracking.consent, 
           userLoggedIn.validateLoggedIn,
            function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');

    var result;
    var orderID = req.form.orderID;
    var productId = req.form.productId;
    var reason = req.form.reason;
    var order = OrderMgr.getOrder(orderID);

    if (!empty(order) && !empty(productId) && !empty(reason)) {
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        result = increffOrderModel.createCustomerReturns(orderID, productId, reason);
    } else {
        result = {
            error: true,
            message: 'Invalid order id or product ids'
        };
    }
    res.json(result);
    return next();
});

server.put('ReturnNotify', 
            increffAuthentication.validateRequest,
            function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');

    var result;
    var orderJOSN = JSON.parse(req.body);
    var returnOrder = orderJOSN.returnOrderCode.split('_');
    var order = OrderMgr.getOrder(returnOrder[0]);

    if (!empty(order)) {
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        result = increffOrderModel.handleReturnNotification(order, orderJOSN);
    } else {
        result = {
            response: 'Invalid order id',
            status: 400,
            hasError: true
        };
    }
    res.json(result.response);
    res.setStatusCode(result.status);
    return next();
});

server.post('HandoverNotification', 
            increffAuthentication.validateRequest,
            function (req, res, next) {

    var result;
    var orderJOSN = JSON.parse(req.body);
    var locationCode = orderJOSN.locationCode

    if (locationCode === Site.current.preferences.custom.increffLocationCode) {
        // Do the operation
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        result = increffOrderModel.hanldeHandoverNotification(orderJOSN);
    } else {
        result = {
            message: 'Invalid localtion code',
            status: 400,
            hasError: true
        };
    }
    res.json(result);
    res.setStatusCode(result.status);
    return next();
});

server.post('RTONotification',
            increffAuthentication.validateRequest,
            function (req, res, next) {

    var result;
    var orderJOSN = JSON.parse(req.body);

    if (orderJOSN.locationCode === Site.current.preferences.custom.increffLocationCode) {
       var OrderMgr = require('dw/order/OrderMgr');
       var order = OrderMgr.getOrder(orderJOSN.forwardOrderCode);

        if (!empty(order)) {
            var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
            result = increffOrderModel.handleRTONotification(order, orderJOSN);
        } else {
            result = {
                message: 'Invalid order id',
                status: 400,
                hasError: true
            };
        }
    } else {
        result = {
            message: 'Invalid Location code',
            status: 400,
            hasError: true
        };
    }
    res.json(result);
    res.setStatusCode(result.status);
    return next();
});

server.get('UnAuthorized', 
            function (req, res, next) {

    res.json({message: 'invalidate credentails'});
    res.setStatusCode(401);
    return next();
});

module.exports = server.exports();