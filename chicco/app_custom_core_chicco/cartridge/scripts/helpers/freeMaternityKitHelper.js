'use strict';
var Resource = require('dw/web/Resource');

var collections = require('*/cartridge/scripts/util/collections');

/**
 * function use to check if customer is eligbleForFreeKit
 * @returns {Boolean} freeMaternityKit - A boolean falg to show if customer is eligible for freeMaternityKit
 * 
*/
function customerEligibleForFreeKit() {
if (customer && customer.authenticated && customer.profile) {
    if (customer.profile.custom.freeMaternityEligible === true) {
            return true;
        }
    }
    return false;
}


/**
 * function use to check if customer is Auhenticated
 * @returns {Boolean} freeMaternityKit - A boolean falg to show if customer is eligible for freeMaternityKit
 * 
*/
function customerAuhenticated() {
    if (customer && customer.authenticated && customer.profile) {
        return true;
    } else {
        return false;
    }
}

/**
 * function use to remove free kit from customer
 * 
*/
function removeFreeKitFromCustomer() {
    var Transaction = require('dw/system/Transaction');
    if (customer && customer.authenticated && customer.profile) {
        Transaction.wrap(function () {
            customer.profile.custom.freeMaternityEligible = false;
        });
    }
}

/**
 * function use to validate free maternity kit
 * @param {dw.order.Basket} basket - Current custmer basket
 * @returns {Boolean} freeMaternityKit - A boolean flag to show if its a validate maternity kit or not
 * 
*/
function validateFreeMaternityKit(basket) {
    var result = {
        error: false,
        freeMaternityKitItem: false
    };
    if (!this.customerEligibleForFreeKit) {
        result.error = true;
        result.message = Resource.msg('info.free.maternitykit.not', 'product', null);
        return;
    }

    var freeMaternityKitItem = false;
    var productLineItems = basket.productLineItems;
    collections.forEach(productLineItems, function (item) {
        if (item.product === null || !item.product.online) {
            result.error = true;
            return;
        }

        if (item.custom.freeMaternityEnabled) {
            // current lineItem has free maternity product
            freeMaternityKitItem = true;
            result.freeMaternityKitItem = true;
            if (item.quantityValue > 1) {
                result.error = true;
                result.message = Resource.msg('error.invalid.free.maternitykit.quantity', 'cart', null);
                return;
            }
        }
        
    });
    if (freeMaternityKitItem) {
        collections.forEach(productLineItems, function (item) {
            if (!item.custom.freeMaternityEnabled) {
                // if item is mixed then show error message
                result.error = true;
                result.message = Resource.msg('error.invalid.free.maternitykit.mix', 'cart', null);
                return;
            }
            
        });
       
    }
    return result;
}

module.exports = {
    customerEligibleForFreeKit: customerEligibleForFreeKit,
    validateFreeMaternityKit: validateFreeMaternityKit,
    removeFreeKitFromCustomer: removeFreeKitFromCustomer,
    customerAuhenticated: customerAuhenticated
}