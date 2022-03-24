/* eslint no-underscore-dangle:0 */

var server = require('server');

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

server.extend(module.superModule);

server.append('SubmitShipping', function (req, res, next) {
    DataLayerHelper.checkoutDataLayerViewHelper(req, res, 'payment', 'checkoutSteps');
    next();
});

module.exports = server.exports();
