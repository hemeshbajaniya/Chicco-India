'use strict';

/*
* Model to manage customer subscription and creating custom object for customer contact info and unavailable product
* @module models/AddSubscriber
*/
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var UUIDUtils = require('dw/util/UUIDUtils');
var Resource = require('dw/web/Resource');

/**
 * Add subscriber information to custom object and unavailable product.
 */
exports.add = function (param) {
    var pid = param.pid;
    var firstName = param.firstName;
    var lastName = param.lastName;
    var email = param.email;

    var result = {
        success: false,
        message: Resource.msg('backinstock.error.later', 'backinstock', null)
    };

    var unavailableProduct = CustomObjectMgr.queryCustomObject('UnavailableProduct',
	'custom.productID={0} and custom.email={1}', pid, email);

    if (empty(unavailableProduct)) {
        var subscriber = CustomObjectMgr.queryCustomObject('CustomerContactInfo', 'custom.email={0}', email);
        if (empty(subscriber)) {
            Transaction.wrap(function () {
                subscriber = CustomObjectMgr.createCustomObject('CustomerContactInfo', UUIDUtils.createUUID());
                subscriber.custom.email = email;
                subscriber.custom.firstName = firstName;
                subscriber.custom.lastName = lastName;
            });
        }

        Transaction.wrap(function () {
            unavailableProduct = CustomObjectMgr.createCustomObject('UnavailableProduct', UUIDUtils.createUUID());
            unavailableProduct.custom.email = email;
            unavailableProduct.custom.productID = pid;
        });
        result = {
            success: true,
            message: Resource.msg('backinstock.success', 'backinstock', null)
        };
    } else {
        result = {
            success: true,
            message: Resource.msg('backinstock.success.exist', 'backinstock', null)
        };
    }

    return result;
};
