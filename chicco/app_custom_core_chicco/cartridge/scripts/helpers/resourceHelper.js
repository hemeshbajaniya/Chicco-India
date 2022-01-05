'use strict';

/**
 * Resource helper
 *
 */

/**
 * Get the client-side resources of a given page
 * @param {string} pageContext : The page context which need to be render
 * @returns {Object} resources : An objects key key-value pairs holding the resources
 */
function getResources(pageContext) {
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');

    var resources = {
        FREE_MATERNITYKIT_NOT_ELIGIBLE: Resource.msg('info.free.maternitykit.not', 'product', null),
        FREE_MATERNITYKIT_LOGIN: Resource.msg('info.free.maternitykit.login', 'product', null),
        FREE_MATERNITYKIT: Resource.msg('info.free.maternitykit', 'product', null),
        LOGIN_URL: URLUtils.url('Login-Show').toString(),
        LABEL_BABY_REGISTRY_FORM_TITLE: Resource.msg('label.register.baby.form.title', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_NAME: Resource.msg('label.register.baby.form.name', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_NAME_PLACEHOLDER: Resource.msg('label.register.baby.form.name.placeholder', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_NAME_MISSING: Resource.msg('label.register.baby.form.name.missing.error', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_AGE: Resource.msg('label.register.baby.form.age', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_AGE_PLACEHOLDER: Resource.msg('label.register.baby.form.age.placeholder', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_AGE_PLACEHOLDER_MISSING: Resource.msg('label.register.baby.form.age.missing.error', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_GENDER: Resource.msg('label.register.baby.form.gender', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_FEMALE: Resource.msg('label.register.baby.form.gender.female', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_MALE: Resource.msg('label.register.baby.form.gender.male', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_REMOVE_BUTTON: Resource.msg('label.register.baby.form.button.remove', 'babyregistry', null),
        LABEL_BABY_REGISTRY_FORM_ADD_MORE_BUTTON: Resource.msg('label.register.baby.form.button.addmore', 'babyregistry', null),
        LABEL_ORDER_CANCELLTION_MSG: Resource.msg('label.order.cancelle.message', 'account', null),
        LABEL_ORDER_CANCLE_CONFIEM: Resource.msg('label.confirm.action', 'account', null),
        ESTIMATED_DELIEVERY: Resource.msg('Order.now.with.estimated.delivery', 'product', null),
    };
    return resources;
}

module.exports = {
    getResources: getResources
};
