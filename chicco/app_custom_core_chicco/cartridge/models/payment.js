'use strict';

var base = module.superModule;

/**
 * Payment class that represents payment information for the current basket
 * @param {dw.order.Basket} currentBasket - the target Basket object
 * @param {dw.customer.Customer} currentCustomer - the associated Customer object
 * @param {string} countryCode - the associated Site countryCode
 * @constructor
 */
function Payment(currentBasket, currentCustomer, countryCode) {
    base.call(this, currentBasket, currentCustomer, countryCode);

    var freeMaternityKitHelper = require('*/cartridge/scripts/helpers/freeMaternityKitHelper');
    this.freeMaternityKit = freeMaternityKitHelper.validateFreeMaternityKit(currentBasket);
}

module.exports = Payment;
