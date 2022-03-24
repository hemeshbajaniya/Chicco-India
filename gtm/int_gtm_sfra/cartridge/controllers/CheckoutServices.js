/* eslint no-underscore-dangle:0 */

var server = require('server');

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

server.extend(module.superModule);

server.append('SubmitPayment', function (req, res, next) {
    DataLayerHelper.checkoutDataLayerViewHelper(req, res, 'placeOrder', 'checkoutSteps');
    next();
});

server.append('PlaceOrder', function (req, res, next) {
    DataLayerHelper.checkoutErrorDataLayerViewHelper(req, res);
    next();
});
module.exports = server.exports();
