'use strict';

var page = module.superModule;

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var window = require('*/cartridge/static/default/js/jquery.min.js'); 
server.extend(page);

var URLUtils = require('dw/web/URLUtils');
server.append('AddProduct', function(req, res, next) {
    var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');
    var getGTMData = require('*/cartridge/scripts/helpers/gtmHelpers.js');
    var isWishList = req.querystring.isWishList;
    var productId = req.form.pid;
    var buyNow = req.form.buyNow;
    if (!empty(isWishList)) {
        var list = productListHelper.removeItem(req.currentCustomer.raw, productId, { req: req, type: 10 });
        var viewData = res.getViewData();
        res.setViewData({ redirectURL: 'redirect' });
    }

    if (viewData) {
        viewData = getGTMData.getGTMData(viewData);
        viewData.productID = productId
        res.setViewData(viewData);
    } else {
        var addToCartGtm = res;
        addToCartGtm.viewData.productId = productId
        var viewData = getGTMData.getGTMData(addToCartGtm.viewData);
    }
    res.setViewData(viewData);

    if (!empty(buyNow)) {
        res.setViewData({ redirectCart: URLUtils.https('Checkout-Login').toString() });
    }
    next();
});

server.append('AddCoupon', csrfProtection.generateToken, function(req, res, next) {
    var viewData = res.getViewData();
    if (!viewData.error) {
        var sendRenderedCart = req.querystring.sendRenderedCart;
        if (sendRenderedCart && sendRenderedCart === 'true') {
            var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
            var data = viewData;
            res.json({
                renderedCart: renderTemplateHelper.getRenderedHtml(
                    data,
                    'cart/productCard/cartbonus'
                )
            });
        }
    }
    return next();
});

server.append('RemoveCouponLineItem', csrfProtection.generateToken, function(req, res, next) {
    var viewData = res.getViewData();
    if (!viewData.error) {
        var sendRenderedCart = req.querystring.sendRenderedCart;
        if (sendRenderedCart && sendRenderedCart === 'true') {
            var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
            var data = viewData;
            res.json({
                renderedCart: renderTemplateHelper.getRenderedHtml(
                    data,
                    'cart/productCard/cartbonus'
                )
            });
        }
    }
    return next();
});
module.exports = server.exports();