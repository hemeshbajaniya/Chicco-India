/* eslint no-underscore-dangle:0 */

var server = require('server');

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    DataLayerHelper.searchDataLayerViewHelper(req, res);
    next();
});

module.exports = server.exports();
