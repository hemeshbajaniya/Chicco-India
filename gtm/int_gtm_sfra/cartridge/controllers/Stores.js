/* eslint no-underscore-dangle:0 */
var base = module.superModule;
var server = require('server');

server.extend(base);

server.append('Find', function (req, res, next) {
    var viewData = res.getViewData();
    var viewDataLayer = viewData._dataLayer || [];
    viewDataLayer.push({
        pageType: 'store locator'
    });
    res.setViewData({
        GTMDataLayer: viewDataLayer
    });
    next();
});
module.exports = server.exports();
