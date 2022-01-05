'use strict';

var baseOrderModel = module.superModule;

var ProductLineItemsModel = require('*/cartridge/models/productLineItems');

/**
 * Order class that represents the current order
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket/order
 * @param {Object} options - The current order's line items
 * @param {Object} options.config - Object to help configure the orderModel
 * @param {string} options.config.numberOfLineItems - helps determine the number of lineitems needed
 * @param {string} options.countryCode - the current request country code
 * @constructor
 */
function OrderModel(lineItemContainer, options) {
    baseOrderModel.call(this, lineItemContainer, options);
    if (!empty(this.orderNumber)) {
        var shippingStatus = dw.order.OrderMgr.getOrder(this.orderNumber).shippingStatus;
        if (shippingStatus.value === 0) {
            this.shippingStatus = 'Not Shipped';
        } else if (shippingStatus.value === 1) {
            this.shippingStatus = 'Part Shipped';
        } else if (shippingStatus.value === 2) {
            this.shippingStatus = 'Shipped';
        }
    }
    if (!lineItemContainer) {
        this.productName = null;
        
    } else {    
        // product name
        var productLineItemsModel = new ProductLineItemsModel(lineItemContainer.productLineItems, options.containerView);
        this.productName = productLineItemsModel.items[0].productName;
        if ('status' in lineItemContainer) {
            this.createdOrder = lineItemContainer.status.displayValue === 'CREATED' ? 'FAILED' : lineItemContainer.status.displayValue; 
        }
    }
   
}

module.exports = OrderModel;
