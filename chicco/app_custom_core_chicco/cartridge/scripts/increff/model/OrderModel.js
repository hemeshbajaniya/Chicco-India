'use strict';

var Logger = require('dw/system/Logger').getLogger('increff');
var Site = require('dw/system/Site');

var increffServiceRegistry = require('*/cartridge/scripts/increff/services/increffServiceRegistry.js');

var Transaction = require('dw/system/Transaction');

function getShippingAddress(order) {
    var deliveryAdress = {};
   var shipments =  order.getShipments();
   var shippingAddr = shipments[0].getShippingAddress();
  
   deliveryAdress.city = shippingAddr.city;
   deliveryAdress.country = shippingAddr.countryCode.value.toString().toUpperCase();
   deliveryAdress.zip = shippingAddr.postalCode;
   deliveryAdress.state = (!empty(shippingAddr.stateCode) ? shippingAddr.stateCode : 'NA');
   deliveryAdress.line1 = shippingAddr.address1;
   deliveryAdress.line2 = (shippingAddr.address2 != null ? shippingAddr.address2 : '');
   deliveryAdress.line3 = "";
   deliveryAdress.email = order.customerEmail;
   deliveryAdress.phone = shippingAddr.phone;
   deliveryAdress.name = shippingAddr.fullName;

   return deliveryAdress;
}

function getbillingAddress(order) {
    var billingAddress = order.getBillingAddress();

    var customerInfo = {};

    customerInfo.name = order.getCustomerName();
    customerInfo.line1 = billingAddress.address1;
    customerInfo.line2 = billingAddress.address2;
    customerInfo.city =  billingAddress.city;
    customerInfo.state = (!empty(billingAddress.stateCode) ? billingAddress.stateCode : 'NA');
    customerInfo.zip = billingAddress.postalCode;
    customerInfo.country = billingAddress.countryCode.value.toString();
    customerInfo.email = order.customerEmail;
    customerInfo.phone = billingAddress.getPhone();
    return customerInfo;
}

function getOrderLevelGiftInfo(order) {
    var defaultShipment = order.getDefaultShipment();
    return {isGift: defaultShipment.gift, giftMessage: defaultShipment.giftMessage ? defaultShipment.giftMessage : ''}
}

function getProductPriceAdjustmentsValue(priceAdjustments) {
    var priceAdjustmentsIt = priceAdjustments.iterator();
    var totalDiscount = 0;
    while (priceAdjustmentsIt.hasNext()) {
        var priceAdjustment = priceAdjustmentsIt.next();
        totalDiscount += priceAdjustment.getGrossPrice.value;
    };
    return totalDiscount;
}

function getOrderLineItems(order) {
    var productLineItemsIt = order.getProductLineItems().iterator();
    var orderLineItems = [];
    while(productLineItemsIt.hasNext()) {
        var productLineItem = productLineItemsIt.next();
        var orderLineItem = {
            channelSkuCode: productLineItem.productID ? productLineItem.productID : productLineItem.productName,
            orderItemCode: productLineItem.getUUID(),
            quantity: productLineItem.quantityValue,
            sellerDiscountPerUnit: getProductPriceAdjustmentsValue(productLineItem.getPriceAdjustments()),
            channelDiscountPerUnit: '',
            sellingPricePerUnit: productLineItem.getPriceValue(),
           // shippingChargePerUnit: productLineItem.shippingLineItem.adjustedGrossPrice.value,
            giftOptions: {
                giftwrapRequired: productLineItem.gift ? productLineItem.gift : getOrderLevelGiftInfo(order).isGift,
                giftMessage: productLineItem.giftMessage ? productLineItem.giftMessage : getOrderLevelGiftInfo(order).giftMessage,
                giftChargePerUnit: 0
            }
        };
        orderLineItems.push(orderLineItem);
    }
    return orderLineItems;
}

function prepareCreateOrderPayLoad(order) {
    var utcSeconds = order.creationDate;
    var dispatchDate = new Date(utcSeconds.setDate(utcSeconds.getDate() + 1));
    var payload = {
        parentOrderCode: order.orderNo,
        locationCode: Site.current.preferences.custom.increffLocationCode,
        orderCode: order.orderNo,
        orderTime: order.creationDate,
        orderType: 'SO',
        isPriority: false,
        gift: getOrderLevelGiftInfo(order).isGift,
        onHold: false,
        qcStatus: 'PASS',
        dispatchByTime: dispatchDate,
        startProcessingTime: order.creationDate,
        paymentMethod: 'NCOD',
        shippingAddress : getShippingAddress(order),
        billingAddress: getbillingAddress(order),
        orderItems: getOrderLineItems(order)
    }
    return payload;
}

function getCancellatedLineItem(order) {
    var productLineItemsIt = order.getProductLineItems().iterator();
    var orderLineItems = [];
    while(productLineItemsIt.hasNext()) {
        var productLineItem = productLineItemsIt.next();
        var orderItem = {
            channelSkuCode: productLineItem.productID ? productLineItem.productID : productLineItem.productName,
            cancelledQuantity: productLineItem.quantityValue,
            orderItemCode: productLineItem.getUUID()
        };
        orderLineItems.push(orderItem);
    }
    return orderLineItems;
}

function prepareOrderCancellationPayLoad(order) {
    var payLoad = {
        locationCode: Site.current.preferences.custom.increffLocationCode,
        orderItems: getCancellatedLineItem(order)
    };
    return payLoad;
}

function prepareReturnOrderPayLoad(order, productId, reason, awbNumber, transporter) {
    var payload = {
        forwardOrderCode: order.orderNo,
        returnOrderCode: order.orderNo + '_' + new Date().getMilliseconds(),
        locationCode: Site.current.preferences.custom.increffLocationCode,
        orderItems: [{
            itemCode: order.orderNo + '_' + productId,
            reason: reason,
            channelSkuCode: productId
        }],
        orderType: 'CUSTOMER_RETURN',
        awbNumber: awbNumber,
        transporter: transporter
    }
    return payload;
}

function prepareReturnOrderPayLoadRTO(order, productArrays, awbNumber, transporter) {
    var payload = {
        forwardOrderCode: order.orderNo,
        returnOrderCode: order.orderNo,
        locationCode: Site.current.preferences.custom.increffLocationCode,
        orderItems: productArrays,
        orderType: 'RETURN_TO_ORIGIN',
        awbNumber: awbNumber,
        transporter: transporter
    }
    return payload;
}

function prepareReturnOMSPayLoad(order, productId, reason) {
    var orderLineItemsItr = order.getAllProductLineItems().iterator();
    var productPrice = 0;
    var product;
    var quantity = 1;
    var productImg = '';

    var billingAddress = order.getBillingAddress();
    var customerInfo = {};

    customerInfo.firstName = billingAddress.firstName;
    customerInfo.lastName = billingAddress.lastName;
    customerInfo.middleName = '';
    customerInfo.street1 = billingAddress.address1;
    customerInfo.street2 = billingAddress.address2;
    customerInfo.street3 = '';
    customerInfo.city =  billingAddress.city;
    customerInfo.state = (!empty(billingAddress.stateCode) ? billingAddress.stateCode : 'NA');
    customerInfo.zip = billingAddress.postalCode;
    customerInfo.country = billingAddress.countryCode.value.toString();
    customerInfo.email = order.customerEmail;
    customerInfo.phone = billingAddress.getPhone();

    while(orderLineItemsItr.hasNext()) {
        var productLineItem = orderLineItemsItr.next();
        if (productLineItem.productID === productId) {
            productPrice = productLineItem.getAdjustedGrossPrice().value;
            product = productLineItem.product;
            quantity = productLineItem.quantityValue;
            productImg = productLineItem.product.getImages('small')[0].absURL

        }
    }
    var payload = {
        currencyCode: 'IND',
        dropAddress: JSON.parse(Site.current.preferences.custom.increffWareHouseAddress),
        regionType: 'INDIAN',
        orderDetails: {
            codValue: 0,
            invoiceNumber: null,
            invoiceTime: null,
            invoiceValue: productPrice,
            isCod: false,
            orderDate: order.creationDate,
            orderLineItemList: [{
                clientSkuId: productId,
                finalAmountPaid: productPrice,
                imageUrl: null,
                name: product.name,
                price: productPrice,
                quantity: quantity,
                storeCreditsUsed: 0.0
            }],
            orderNumber: 'return_' + order.orderNo,
        },
        pickupAddress: customerInfo,
        returnReason: reason,
        sellerGstin: Site.current.preferences.custom.increffSellerGstin,
        shipmentDimension: {
            breadth: 1,
            height: 1,
            length: 1,
            weight: 0.5,
        },
        logisticAggregatorType: 'SHIPROCKET',
        warehouseCode: ''
    }
    return payload;
}

function getShippingLabelPayLoad(order) {
    var orderLineItemsItr = order.getAllProductLineItems().iterator();
    var productPrice = 0;
    var product;
    var quantity = 1;
    var productImg = '';

    var billingAddress = order.getBillingAddress();
    var customerInfo = {};

    customerInfo.firstName = billingAddress.firstName;
    customerInfo.lastName = billingAddress.lastName;
    customerInfo.middleName = '';
    customerInfo.street1 = billingAddress.address1;
    customerInfo.street2 = billingAddress.address2;
    customerInfo.street3 = '';
    customerInfo.city =  billingAddress.city;
    customerInfo.state = (!empty(billingAddress.stateCode) ? billingAddress.stateCode : 'NA');
    customerInfo.zip = billingAddress.postalCode;
    customerInfo.country = billingAddress.countryCode.value.toString();
    customerInfo.email = order.customerEmail;
    customerInfo.phone = billingAddress.getPhone();

    var productItems = [];
    while(orderLineItemsItr.hasNext()) {
        var productLineItem = orderLineItemsItr.next();
        var productItem = {};
        productItem.clientSkuId = productLineItem.productID;
        productItem.finalAmountPaid = productLineItem.getAdjustedGrossPrice().value;
        productItem.price = productLineItem.getAdjustedGrossPrice().value;
        productItem.product = productLineItem.product;
        productItem.quantity = productLineItem.quantityValue;
        productItem.imageUrl = null;
        productItem.storeCreditsUsed = 0.0;
        productItems.push(productItem);
    }
    var payload = {
        billingAddress: customerInfo,
        currencyCode: 'IND',
        dropAddress: JSON.parse(Site.current.preferences.custom.increffWareHouseAddress),
        regionType: 'INDIAN',
        orderDetails: {
            codValue: 0,
            invoiceNumber: null,
            invoiceTime: null,
            invoiceValue: productPrice,
            isCod: false,
            orderDate: order.creationDate,
            orderLineItemList: productItems,
            orderNumber: order.orderNo,
        },
        pickupAddress: customerInfo,
        sellerGstin: Site.current.preferences.custom.increffSellerGstin,
        shipmentDimension: {
            breadth: 1,
            height: 1,
            length: 1,
            weight: 0.5,
        },
        logisticAggregatorType: 'SHIPROCKET',
        warehouseCode: '',
        shippingAndBillingAddressSame: true

    }
    return payload;

}

/**
 * Send cancellation Email to customer's
 * @param order {dw.order.Order}: API Order
 * 
 */
function sendCancellationEmail(order) {
    var Resource = require('dw/web/Resource');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var orderObject = {
        orderNo: order.orderNo,
    }
    var emailObj = {
        to: order.customerEmail,
        subject: Resource.msg('subject.order.cancellation.email', 'confirmation', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
        type: emailHelpers.emailTypes.orderCancellation
    };

    emailHelpers.sendEmail(emailObj, 'checkout/cancellation/cancellationEmail', orderObject);
}

/**
 * Send cancellation Email to customer's
 * @param order {dw.order.Order}: API Order
 * @param productID {string}: productID
 * @param productName {string}: productName
 * @param productPrice {string}: productPrice
 * @param productQuantity {string}: Productquantity

 * 
 */
function sendReturnEmail(order, productID, productName, productPrice, productQuantity) {
    var Resource = require('dw/web/Resource');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var productObject = {
        order: order,
        productID: productID,
        productName: productName,
        productPrice: productPrice,
        productQuantity: productQuantity
    }
    var emailObj = {
        to: order.customerEmail,
        subject: Resource.msg('subject.order.return.email', 'confirmation', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
        type: emailHelpers.emailTypes.orderReturn
    };

    // TODO: change the template which is design for returns
    emailHelpers.sendEmail(emailObj, 'account/order/orderReturnEmail', productObject);
}

function createOrder(order) {
    try {
        var payLoad = prepareCreateOrderPayLoad(order);
        var response = increffServiceRegistry.executeAPI(payLoad, 'orders/outward', 'POST');
        Logger.info('(OrderModel~createOrder) -> Going to send order information to increff API, against order: {0}', order.orderNo);
        Transaction.wrap( function() {
            order.custom.increffRequest = JSON.stringify(payLoad);
            order.custom.increffResponse = JSON.stringify(response);
            if (response.status == 'OK') {
                Logger.info('(OrderModel~createOrder) -> Order information sent to increff API!!!, against order: {0}', order.orderNo);
                order.setExportStatus(dw.order.Order.EXPORT_STATUS_EXPORTED);
            } else {
                Logger.error('(OrderModel~createOrder) -> failed to sent the order information to increff API, against order: {0} and response is:{1}', order.orderNo, JSON.stringify(response));
                order.custom.increffExportedFailed = true;
            }
        });

        return response;
    } catch (e) {
        Logger.error('(OrderModel~createOrder) -> Error occured while try to send order information to increff API.  {0} in {1} : {2} against order no:{3}' , e.toString(), e.fileName, e.lineNumber, order.orderNo);
    }
   
}

function CancellationBySeller(orderJSON, requestId) {
    var OrderMgr = require('dw/order/OrderMgr');
    var Transaction = require('dw/system/Transaction');

    var result = {
        status: 200
    }
    var orderId = orderJSON.orderCode;
    var localtionCode = orderJSON.locationCode;
    try {
        var order = OrderMgr.getOrder(orderId);
        if (!empty(order)) {
            Logger.info('(OrderModel~CancellationBySeller) -> Going to cancel order as request by increff API with Order no. {0}' , orderId);
            // first make a refund call
            var payUAPIModel = require('*/cartridge/scripts/models/payUAPIModel');
            var payUResult = payUAPIModel.sendCancelOrRefundCall(order, null);
            if (!payUResult.error) {
                Transaction.wrap( function() {
                    var cancelledOrder = OrderMgr.cancelOrder(order);
                    cancelledOrder.setCancelCode('IncreffCancelltation');
                    cancelledOrder.setCancelDescription('This order has been cancelled by Increff with payU Response: ' + JSON.stringify(payUResult));
                });

                sendCancellationEmail(cancelledOrder);
            } else {
                result.status = 500;
                Logger.error('(OrderModel~CancellationBySeller) -> not able to cancel the Order no. {0} and payUResponse is: {1}' , orderId, JSON.stringify(payUResult));
            }

        }
    } catch (e) {
        Logger.error('(OrderModel~CancellationBySeller) -> Error occured while trying to cancel the order as request by increff API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.status = 500;
    }
    
    return result;
}

function cancellationByCustomer(order) {
    var Transaction = require('dw/system/Transaction');
    var OrderMgr = require('dw/order/OrderMgr');

    var result = {
        error: false
    };

    try {
        Logger.info('(OrderModel~cancellationByCustomer) -> Going to cancel order as request by customer to increff API with Order no. {0}' , order.orderNo);
        var payLoad = prepareOrderCancellationPayLoad(order);
        var endpoint =  'orders/' + order.orderNo +'/cancel';
        var response = increffServiceRegistry.executeAPI(payLoad, endpoint, 'PUT');
        if (response.ok) {
            // its success case
            // refund the payment 
            Logger.info('(OrderModel~cancellationByCustomer) -> Going to cancel order as request by customer API with Order no. {0}' , order.orderNo);
            // first make a refund call
            var payUAPIModel = require('*/cartridge/scripts/models/payUAPIModel');
            var payUResult = payUAPIModel.sendCancelOrRefundCall(order, null);
            if (!payUResult.error) {
                Transaction.wrap( function() {
                    order.setCancelCode('CustomerCancelltation');
                    order.setCancelDescription('This order has been cancelled by Customer with payU Response: ' + JSON.stringify(payUResult));
                    OrderMgr.cancelOrder(order);
                });
                result.message = 'You order has been cancelled, you will recieve your refund shorlty!';
                sendCancellationEmail(order);

            } else {
                result.error = true;
                result.message = 'Sorry, Your refund request had an issue. Please get in touch with our customer support team.';
                Logger.error('(OrderModel~cancellationByCustomer) -> not able to cancel the Order no. {0} and payUResponse is: {1}' , order.orderNo, JSON.stringify(payUResult));
            }

        } else {
            result.error = true;
            result.message = 'Oops! we are not able to cancel your order, its already processed, Contact our support if you still want to cancel this order';
            Logger.error('(OrderModel~cancellationByCustomer) -> Not able to cancel the order from increff, Increff response is: ' + JSON.stringify(response));
        }
    } catch (e) {
        Logger.error('(OrderModel~cancellationByCustomer) -> Error occured while try to send customer cancelltion information to increff API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.error = true;
        result.message = 'Error occured while trying to cancel your order, Please contact our support, or try after sometime!'
    }
    return result;
}

function packSalesOrder(order, requestPayLoad) {
    var Transaction = require('dw/system/Transaction');
    var OrderMgr = require('dw/order/OrderMgr');
    var result = {
        error: false
    };

    try {
        Transaction.wrap( function() {
            order.setShippingStatus(dw.order.Order.SHIPPING_STATUS_SHIPPED);
            //order.trackOrderChange(JSON.stringify(requestPayLoad));
        });
        result.response = {
            shipmentCode: 'shipment_' + order.orderNo,
            shipmentItems: requestPayLoad.shipmentItems
        };
        result.status = 200;
    } catch (e) {
        Logger.error('(OrderModel~packSalesOrder) -> Error occured while try to set packsales order information from increff.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.error = true;
        result.status = 500;
    }
    return result;
    
}

function getOrderInvoice(orderId) {
    var result = {
        error: false
    }

    try {
        var response = increffServiceRegistry.executeMiniOMSAPI('', 'invoice/invoice-pdf?referenceNo=' + orderId, 'GET');
        if (response.ok && response.object.documentUrl) {
            result.response = response.object;
            result.message = 'Invoice generated sucessfully!';
        } else {
            result.message = 'Opps! something went wrong while generating invoice, Please contact support if error persiste';
            result.error = true;
        }
    } catch (e) {
        Logger.error('(OrderModel~createOrder) -> Error occured while try to send order information to increff API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.message = 'Opps! something went wrong while generating invoice, Please contact support if error persiste';
        result.error = true;
    }
    return result;

}

/**
 * 
 * @param {string} orderId
 * @param {string} productID
 * @param {string} reason
 * 
 * The return which customer trigged, A return case be made as a whole or only per item 
 */
function createCustomerReturns(orderid, productID, reason) {
    var OrderMgr = require('dw/order/OrderMgr');
    var order = OrderMgr.getOrder(orderid);
    var returnAwb = '';
    var courierName = '';
    var result = {
        error: false
    }
    try {

        var omsReturnPayLoad = prepareReturnOMSPayLoad(order, productID, reason);
        var omsResponse = increffServiceRegistry.executeMiniOMSAPI(omsReturnPayLoad, 'return/create', 'POST');
        if (!empty(omsResponse) && omsResponse.ok) {
            returnAwb = omsResponse.object.returnAwb;
            courierName = omsResponse.object.courierName;
        }

        var requestPayLoad = prepareReturnOrderPayLoad(order, productID, reason, returnAwb, courierName);
        var response = increffServiceRegistry.executeAPI(requestPayLoad, 'return/return-orders', 'POST');
        if (!empty(response) && response.ok) {
            result.message = 'Return has been made sucsessfully, we will inform you for further updates';
        } else {
            result.error = true;
            result.message = 'Oops! something went wrong while refurning your items, Please contact our support if error presist';
        }
    } catch (e) {
        Logger.error('(OrderModel~createCustomerReturns) -> Error occured while try to make retruns to increff API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.error = true;
        result.message = 'Oops! something went wrong while refurning your items, Please try again later';
    }
    if (!result.error) {
        var orderLineItemsItr = order.getAllProductLineItems().iterator();
        var productPrice = 0;
        var productName = '';
        var productQuantity = 1;
        while(orderLineItemsItr.hasNext()) {
            var productLineItem = orderLineItemsItr.next();
            if (productLineItem.productID === productID) {
                Transaction.wrap( function() {
                    // found the product update the attributes
                   productLineItem.custom.increffRefund = true;
                   productPrice = productLineItem.adjustedGrossPrice.valueOrNull;
                   productName = productLineItem.product.name;
                   productQuantity = productLineItem.quantityValue;
                });
            }
        }
        // Send the return emails
        sendReturnEmail(order, productID, productName, productPrice, productQuantity)
    }
    return result;
}

function handleReturnNotification(order, orderJOSN) {
    var payUAPIModel = require('*/cartridge/scripts/models/payUAPIModel');
    var orderLineItemsItr = order.getAllProductLineItems().iterator();
    var amountToRefund = 0;

    var result = {
        response : {hasError: false},
        status: 200
    };

    try {
        while(orderLineItemsItr.hasNext()) {
            var productLineItem = orderLineItemsItr.next();
            if (productLineItem.productID === orderJOSN.orderItems[0].channelSkuCode) {
                Transaction.wrap( function() {
                     // found the product update the attributes
                    productLineItem.custom.increffReson = orderJOSN.orderItems[0].qcReason;
                    productLineItem.custom.increffQCStatus = orderJOSN.orderItems[0].qcStatus;
                    amountToRefund = productLineItem.getAdjustedGrossPrice().value;
    
                    if (orderJOSN.orderItems[0].qcStatus === 'PASS') {
                        var payUResult = payUAPIModel.sendCancelOrRefundCall(order, amountToRefund);
                        if (!payUResult.error) {
                            productLineItem.custom.increffRefund = true;
                            productLineItem.custom.payURefundResponse = JSON.stringify(payUResult);
                        } else {
                            result.response.hasError = true;
                            result.status = 400;
                            Logger.error('(OrderModel~handleReturnNotification) -> not able to refund the Order no. {0} and payUResponse is: {1}' , order.orderNo, JSON.stringify(payUResult));
                        }
                    } else {
                        result.response.hasError = true;
                        result.status = 400;
                        Logger.error('(OrderModel~handleReturnNotification) -> Not able to hanlde the refund notification for order no {0} and notification is: {1}', order.orderNo, JSON.stringify(orderJOSN));
                    }
                });
            } else {
                result.response.hasError = true;
                result.status = 400;
            }
        }
    } catch (e) {
        Logger.error('(OrderModel~handleReturnNotification) -> Error occured while try to hanlde return notification from increff API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.response.hasError = true;
        result.status = 500;
    }
    return result;

}

function handleRTONotification(order, orderJSON) {
    var OrderMgr = require('dw/order/OrderMgr');
    var result = {
        status: 200,
        message: 'sucess'
    }
        try {
            // var orderLineItemsItr = order.getAllProductLineItems().iterator();
            // var productArray = [];
            // while(orderLineItemsItr.hasNext()) {
            //     var productLineItem = orderLineItemsItr.next();
            //     var product = {
            //         itemCode: order.orderNo + '_' + productLineItem.productID,
            //         reason: 'RTO Retrun',
            //         channelSkuCode: productLineItem.productID
            //     };
            //     productArray.push(product);
            // }
            // var requestPayLoad = prepareReturnOrderPayLoadRTO(order, productArray, orderJSON.awbNumber, orderJSON.transporter);
            // var response = increffServiceRegistry.executeAPI(requestPayLoad, 'return/return-orders', 'POST');

           // if (!empty(response) && response.ok) {
            if (true) {
                Logger.info('(OrderModel~handleRTONotification) -> Going to cancel order as request by RTO API with Order no. {0}' , order.orderNo);
                // first make a refund call
                var payUAPIModel = require('*/cartridge/scripts/models/payUAPIModel');
                var payUResult = payUAPIModel.sendCancelOrRefundCall(order, null);
                if (!payUResult.error) {
                    Transaction.wrap( function() {
                        order.setCancelCode('RTOCancelltation');
                        order.setCancelDescription('This order has been cancelled by RTO with payU Response: ' + JSON.stringify(payUResult));
                        order.trackOrderChange(JSON.stringify(orderJSON));
                        OrderMgr.cancelOrder(order);
                    });
                    result.message = 'You order has been cancelled, you will recieve your refund shortly!';
                    result.status = 200;
                    sendCancellationEmail(order)

                } else {
                    result.error = true;
                    result.message = 'Sorry, Your refund request had an issue. Please get in touch with our customer support team.';
                    result.status = 400;
                    Logger.error('(OrderModel~handleRTONotification) -> not able to cancel the Order no. {0} and payUResponse is: {1}' , order.orderNo, JSON.stringify(payUResult));
                }
            }
        } catch (e) {
            Logger.error('(OrderModel~handleRTONotification) -> Error occured while try to hanlde shipping notification from shiprokcet API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        }
    return result;
}

function hanldeHandoverNotification(orderJSON) {
    var handOverItems = orderJSON.handoverItems;
    var OrderMgr = require('dw/order/OrderMgr');
    var result = {
        message: 'order Status Update',
        status: 200,
        hasError: false
    }

    try {
        handOverItems.forEach(function(item) {
            var orderID = item.orderCode;
            var order = OrderMgr.getOrder(orderID);
            if (order) {
                Transaction.wrap( function() {
                    order.setExportStatus(dw.order.Order.EXPORT_STATUS_EXPORTED);
                })
            } else {
                result.message = 'Order Not Found';
                result.status = 400;
                result.hasError = true
            }
        });
    } catch (e) {
        Logger.error('(OrderModel~hanldeHandoverNotification) -> Error occured while try to hanlde handover notification from Increff API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.message = 'internal server error';
        result.status = 500;
        result.hasError = true;
    }
   return result;
}

function getShippingLablesAndAWB(order) {
    var result = {
        error: false, 
        response: ''
    }
    try {
        var omsShippingPayLoad = getShippingLabelPayLoad(order);
        var omsResponse = increffServiceRegistry.executeMiniOMSAPI(omsShippingPayLoad, 'shipping-label/pack', 'POST');
        if (!empty(omsResponse) && omsResponse.ok) {
            result.response = omsResponse.object;
        } else {
            result.error = true;
            result.message = 'Your order might not be shipped, Please try again later or contact the support if error presist';
            Logger.error('(OrderModel~getShippingLablesAndAWB) -> Not able to get the shpping lables from OMS for order no {0} and response is: {1}', order.orderNo, JSON.stringify(omsResponse));
        }
    } catch (e) {
        Logger.error('(OrderModel~getShippingLablesAndAWB) -> Error occured while try to get shipping lables from mini oms API.  {0} in {1} : {2}' , e.toString(), e.fileName, e.lineNumber);
        result.error = true;
        result.message = 'An error occured while try to get tracking details, Please contact the support if error presist';
    }
    return result;
}

module.exports = {
    createOrder: createOrder,
    CancellationBySeller: CancellationBySeller,
    CancellationByCustomer: cancellationByCustomer,
    packSalesOrder: packSalesOrder,
    getOrderInvoice: getOrderInvoice,
    createCustomerReturns: createCustomerReturns,
    handleReturnNotification: handleReturnNotification,
    handleRTONotification: handleRTONotification,
    hanldeHandoverNotification: hanldeHandoverNotification,
    getShippingLablesAndAWB: getShippingLablesAndAWB
}
