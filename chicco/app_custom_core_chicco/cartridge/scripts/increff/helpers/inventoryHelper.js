var Logger = require('dw/system/Logger').getLogger('increff');

function saveIncreffRequestJSON(requestJSON, requestID) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');
    var ProducMgr = require('dw/catalog/ProductMgr');
    var result = {
        success: true,
        response: {}
    }
    var failureList = [];
    var successList = [];

    try {
        var inventoriesJSON = JSON.parse(requestJSON);
        if (inventoriesJSON.inventories.length > 0) {
            inventoriesJSON.inventories.forEach(function(item) {
                var product = ProducMgr.getProduct(item.channelSkuCode);
                if (!empty(product)) {
                    successList.push(product.ID);
                } else {
                    failureList.push(item.channelSkuCode);
                }
            });
        }
        Transaction.wrap( function() {
            var increffInvenotry = CustomObjectMgr.createCustomObject('IncreffInventory', requestID);
            increffInvenotry.custom.inventoryJSON = requestJSON;
            result.success = true;
        });
    } catch (error) {
        result.success = false;
        Logger.error('Error occured while saving increffInvenotry object: {0} \n Error: {1} \n Stack Trace : {2}',
        requestJSON, error.message, error.stack);
    }
    result.response.failureList = failureList;
    result.response.successList = successList;
    return result;
}

module.exports = {
    saveIncreffRequestJSON: saveIncreffRequestJSON
}