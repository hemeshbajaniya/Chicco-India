/* eslint no-underscore-dangle:0 */

var server = require('server');

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

server.extend(module.superModule);

server.append('Confirm', function (req, res, next) {
    var order = res.viewData.order;
    if (order && order.orderNumber) {
        DataLayerHelper.purchaseDataLayerViewHelper(req, res, order.orderNumber);
    }
    next();
});

module.exports = server.exports();
