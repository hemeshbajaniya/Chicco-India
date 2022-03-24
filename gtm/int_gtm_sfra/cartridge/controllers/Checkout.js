/* eslint no-underscore-dangle:0 */

var server = require('server');

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

server.extend(module.superModule);

server.append('Login', function (req, res, next) {
    DataLayerHelper.checkoutDataLayerViewHelper(req, res, '', 'checkoutSteps');
    next();
});

server.append('Begin', function (req, res, next) {
    var stage = 'shipping';
    if (req.querystring.stage) {
        stage = req.querystring.stage;
    }
    DataLayerHelper.checkoutDataLayerViewHelper(req, res, stage, 'checkoutSteps');
    next();
});

module.exports = server.exports();
