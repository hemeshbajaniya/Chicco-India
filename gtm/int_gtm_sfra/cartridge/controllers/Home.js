/* eslint no-underscore-dangle:0 */
var base = module.superModule;
var server = require('server');

server.extend(base);

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    var viewDataLayer = viewData._dataLayer || [];
    viewDataLayer.push({
        pageType: 'home'
    });
    viewDataLayer.push({
        ecomm_pagetype: "home"
    });
    res.setViewData({
        GTMDataLayer: viewDataLayer
    });
    next();
});
module.exports = server.exports();
