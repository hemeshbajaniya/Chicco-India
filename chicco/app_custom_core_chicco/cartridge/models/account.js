'use strict';

var baseAccountModel = module.superModule;

/**
 * Account class that represents the current customer's profile dashboard
 * @param {Object} currentCustomer - Current customer
 * @param {Object} addressModel - The current customer's preferred address
 * @param {Object} orderModel - The current customer's order history
 * @param {String} viewContainer - The view container 
 * @constructor
 */
function account(currentCustomer, addressModel, orderModel, viewContainer) {
    var giftCardHelper = require('*/cartridge/scripts/easyrewardz/helper/giftCardHelper.js');
    var LoyaltyModel = require('*/cartridge/scripts/easyrewardz/model/LoyaltyModel.js');
    var ReferralModel = require('*/cartridge/scripts/easyrewardz/model/ReferralModel.js');

    baseAccountModel.call(this, currentCustomer, addressModel, orderModel, viewContainer);
    try {
        if (!empty(viewContainer) && viewContainer == 'account') {
            this.gVHistory = giftCardHelper.getCustomerRedemptionHistory(currentCustomer.raw.profile);
            this.referral = ReferralModel.getReferralCode(currentCustomer.raw.profile, true);
        }
        this.babyRegistry = currentCustomer.raw.profile.custom.babyRegistry ? JSON.parse(currentCustomer.raw.profile.custom.babyRegistry) : '';
        this.savedGV = currentCustomer.raw.profile.custom.gvCardsNo ? JSON.parse(currentCustomer.raw.profile.custom.gvCardsNo) : '';
        this.loyaltyPoints = LoyaltyModel.getCustomerLoyalityPoints(currentCustomer.raw.profile, true);
    } catch(e) {
        this.error = e
    }
}

module.exports = account;
