'use strict';

/**
 * @namespace Account
 */
var page = module.superModule;

var server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var Calendar = require('dw/util/Calendar');
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
var System = require('dw/system/System');
/**
 * Account-SubmitRegistration : The Account-SubmitRegistration endpoint is the endpoint that gets hit when a shopper submits their registration for a new account
 */
server.append(
    'SubmitRegistration',
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Site = require('dw/system/Site');
        var Transaction = require('dw/system/Transaction');

        var registrationForm = server.forms.getForm('profile');

        this.on('route:Complete', function (req, res) { // eslint-disable-line no-shadow
            // getting variables for the route complete function
            var resViewData = res.getViewData(); // eslint-disable-line
            if (Site.current.preferences.custom.freeMaternityEnabled && !empty(resViewData.success) && resViewData.success === true) {
                Transaction.wrap(function () {
                    if (customer && customer.authenticated && customer.profile) {
                        customer.profile.custom.freeMaternityEligible = true;
                    }
                });
            }
            if (!empty(resViewData.success) && resViewData.success === true) {
                require('*/cartridge/scripts/easyrewardz/model/AccountModel.js').createAccount(customer);
            }
            if (!empty(registrationForm.customer.babyregistry.value)) {
                Transaction.wrap(function () {
                    if (customer && customer.authenticated && customer.profile) {
                        customer.profile.custom.babyRegistry = registrationForm.customer.babyregistry.value;
                    }
                });
            }
            
        });      
        return next();
        }
);

server.post('UpdateBabyRegistry', 
            consentTracking.consent, 
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {
    
    var Transaction = require('dw/system/Transaction');
    var babyform = req.form.babyRegistry;

    if (!empty(babyform)) {
        Transaction.wrap(function () {
            customer.profile.custom.babyRegistry = babyform;
        });
    }
    next();
});

server.get('Retruns', 
            consentTracking.consent, 
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {
    
    var OrderMgr = require('dw/order/OrderMgr');

    var orderID = req.querystring.orderID;
    var order = OrderMgr.getOrder(orderID);
    var LineItemList = [];
    var result;
    var orderAwbNumber;
    var orderTrackingResponse;
    var orderDeliveredDate;
    var returnsAllowed;
    var returnsErrorMsg;


    if (order) {
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        var OrderTracking = require('*/cartridge/scripts/shiprocket/model/OrderTracking');
        var returnsHelper = require('*/cartridge/scripts/helpers/returnsHelper');
        result = increffOrderModel.getShippingLablesAndAWB(order);
        if (!result.error) {
            orderAwbNumber = result.response.awbNo;
            orderTrackingResponse = OrderTracking.getOrderDelieveryInfo(orderAwbNumber);
            if (!orderTrackingResponse.error) {
                orderDeliveredDate = OrderTracking.getOrderDeliveredDate(orderTrackingResponse.response);
            }
        }

        var productLineItemsItr = order.getProductLineItems().iterator();
        var retrunsDays = Site.current.preferences.custom.returnAllowedDays;
        while (productLineItemsItr.hasNext()) {
            var productLineItem = productLineItemsItr.next();
            var lineItemObje = {};
            lineItemObje.name = productLineItem.productName;
            lineItemObje.quantity = productLineItem.quantityValue;
            lineItemObje.price = dw.util.StringUtils.formatMoney(productLineItem.adjustedGrossPrice);
            lineItemObje.isRefuned = productLineItem.custom.increffRefund ? productLineItem.custom.increffRefund : false
            lineItemObje.productID =  productLineItem.product.ID;
            lineItemObje.isReturnAllowed = productLineItem.product.custom ? productLineItem.product.custom.isReturnAllowed : true;
            lineItemObje.returnsAllowedDays = productLineItem.product.custom.returnAllowedDays ? productLineItem.product.custom.returnAllowedDays : retrunsDays;
            lineItemObje.isReturnDateRestricted = true;
            lineItemObje.isdelivered = true;
            lineItemObje.deliveredMsg = 'Aahh! Order is not delieverd Yet!. Please have some patience it will be updated soon!'
            if (!empty(orderDeliveredDate)) {
                if (!orderDeliveredDate.error) {
                    returnsAllowed = returnsHelper.isReturnAllowed(orderDeliveredDate.deliveredDate,  lineItemObje.returnsAllowedDays);
                    lineItemObje.returnsDateString = returnsAllowed.formattedAllowedDate;
                    if (returnsAllowed.allowed) {
                        lineItemObje.isReturnDateRestricted = false;
                    }
                } else {
                    lineItemObje.deliveredMsg = orderDeliveredDate.errorMsg;
                 }
            } else {
                lineItemObje.isdelivered = false;
            }
           // lineItemObje.isRefuned = false;
           // lineItemObje.isReturnAllowed = true;
            lineItemObje.message = 'Return not allowed for this Item';
            lineItemObje.imageURL = productLineItem.product.getImages('small')[0].absURL;
            lineItemObje.returnStatus = productLineItem.custom.increffQCStatus ? productLineItem.custom.increffQCStatus: '';
            lineItemObje.returnReason = productLineItem.custom.increffReson ? productLineItem.custom.increffReson: ''
            LineItemList.push(lineItemObje);
        }
    }

    res.render('account/order/returns', {LineItems: LineItemList, orderID: orderID});
    next();
});

server.get('TrackMyOrder', 
            consentTracking.consent, 
            userLoggedIn.validateLoggedIn,
            function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');

    var orderID = req.querystring.orderID;
    var order = OrderMgr.getOrder(orderID);
    var result = {
        error: false,
        message: ''
    }

    if (!empty(order)) {
        var increffOrderModel = require('*/cartridge/scripts/increff/model/OrderModel');
        result = increffOrderModel.getShippingLablesAndAWB(order);
    } else {
        result.error = true;
        result.message = Resource.msg('message.tracking.error', 'checkout', null);
    }
    if (result.error) {
        res.render('account/order/orderTracking', result);
    } else {
        res.redirect('https://shiprocket.co/tracking/' + result.response.awbNo);
    }

    next();
});

/**
 * Account-SaveProfile : The Account-SaveProfile endpoint is the endpoint that gets hit when a shopper has edited their profile
 */
server.append(
    'SaveProfile',
    function (req, res, next) {

        this.on('route:Complete', function (req, res) { // eslint-disable-line no-shadow
            // getting variables for the route complete function
            var resViewData = res.getViewData(); // eslint-disable-line
    
            if (!empty(resViewData.success) && resViewData.success === true) {
                require('*/cartridge/scripts/easyrewardz/model/AccountModel.js').updateAccount(customer);
            }
        });  
        return next();
        }
);

/**
 * Account-SubmitRegistration : The Account-SubmitRegistration endpoint is the endpoint that gets hit when a shopper submits their registration for a new account
 */
server.prepend(
    'SubmitRegistration',
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');

        var formErrors = require('*/cartridge/scripts/formErrors');


        var registrationForm = server.forms.getForm('profile');
   
          // getting variables for the route complete function
          var customerProfile = CustomerMgr.searchProfile('phoneHome = {0}', registrationForm.customer.phone.value);
          if (!empty(customerProfile)) {
              registrationForm.customer.phone.valid = false;
              registrationForm.customer.phone.error =
                  Resource.msg('error.message.parse.phone.profile.form.already.used', 'forms', null);
              registrationForm.valid = false;
              res.json({
                  fields: formErrors.getFormErrors(registrationForm)
              });
              this.emit('route:Complete', req, res);  
              return;

          }
          
         next();
         return;
        }
);

module.exports = server.exports();
