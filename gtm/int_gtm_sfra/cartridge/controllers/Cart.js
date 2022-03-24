/* global empty */
/* eslint no-underscore-dangle:0 */
var base = module.superModule;
var server = require('server');
var collections = require('*/cartridge/scripts/util/collections');
var Transaction = require('dw/system/Transaction');
var BasketMgr = require('dw/order/BasketMgr');
var Decimal = require('dw/util/Decimal');

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

server.extend(base);

server.append('Show', function (req, res, next) {
    var basket = BasketMgr.getCurrentBasket();

    if (!empty(basket) && !empty(basket.allProductLineItems)) {
        var products = DataLayerHelper.generateProductLinesDataLayer(basket.allProductLineItems);
        var viewData = res.getViewData();
        var viewDataLayer = viewData._dataLayer || [];
        viewDataLayer.push({
            event: 'cartShow',
            cartProducts: products,
            pageType: 'cart'
        });
        viewDataLayer.push({
            ecomm_pagetype: "cart",
            ecomm_prodid: collections.map(basket.allProductLineItems, function (p) {
                return p.productID;
            }),
            ecomm_totalvalue: collections.reduce(basket.allProductLineItems, function (val, p) {
                if (p.proratedPrice && p.proratedPrice.decimalValue) {
                    return val.add(p.proratedPrice.decimalValue);
                }
                return val.add(0);
            }, new Decimal(0)).get()
        });
        res.setViewData({
            GTMDataLayer: viewDataLayer
        });
    }
    next();
});

server.append('AddCoupon', function (req, res, next) {
    var viewData = res.getViewData();
    if (viewData.error === false || empty(viewData.error)) {
        var basket = BasketMgr.getCurrentBasket();
        if (!empty(basket) && !empty(basket.allProductLineItems)) {
            var products = DataLayerHelper.generateProductLinesDataLayer(basket.allProductLineItems);
            var viewDataLayer = viewData._dataLayer || [];
            var couponCode = req.querystring.couponCode;
            viewDataLayer.push({ // eslint-disable-line
                event: 'addCoupon',
                cartProducts: products,
                couponCode: couponCode
            });
            res.setViewData({
                GTMDataLayer: viewDataLayer
            });
        }
    }
    next();
});

server.prepend('RemoveProductLineItem', function (req, res, next) {
    var uuid = req.querystring.uuid;

    if (!empty(uuid)) {
        var viewData = res.getViewData();
        var basket = BasketMgr.getCurrentBasket();
        if (!empty(basket)) {
            var pli = collections.find(basket.allLineItems, function (li) {
                return li.UUID === uuid;
            });
            var viewDataLayer = viewData._dataLayer || [];
            var products = DataLayerHelper.generateProductLinesDataLayer([pli]);
            viewDataLayer.push({ // eslint-disable-line
                event: 'removeFromCart',
                ecommerce: {
                    remove: {
                        products: products
                    }
                }
            });
            res.setViewData({
                GTMDataLayer: viewDataLayer
            });
        }
    }
    next();
});

// RemoveProductLineItem
// EditProductLineItem - add/remove if necessary
server.append('AddProduct', function (req, res, next) {
    var viewData = res.getViewData();
    if (viewData.error === false || empty(viewData.error)) {
        var pliUUID = viewData.pliUUID;
        var basket = BasketMgr.getCurrentBasket();
        if (!empty(basket) && !empty(pliUUID)) {
            var pli = collections.find(basket.allLineItems, function (li) {
                return li.UUID === pliUUID;
            });
            if (!empty(pli)) {
                var viewDataLayer = viewData._dataLayer || [];
                var productCategory;

                if (empty(pli.category) && !empty(req.form._gtmGlobalData)) {
                    try {
                        var globalData = JSON.parse(req.form._gtmGlobalData);
                        if (globalData.GTMCurrentCategoryID) {
                            var CatalogMgr = require('dw/catalog/CatalogMgr');
                            var category = CatalogMgr.getCategory(globalData.GTMCurrentCategoryID);
                            if (!empty(category)) {
                                Transaction.wrap(function () {
                                    pli.setCategory(category);
                                });
                            }
                        } else {
                            if (pli.product.variant) {
                                productCategory = pli.product.masterProduct.primaryCategory;
                            } else {
                                productCategory = pli.product.primaryCategory;
                            }
                            if (!empty(productCategory)) {
                                Transaction.wrap(function () {
                                    pli.setCategory(productCategory);
                                });
                            }
                        }
                    } catch (e) { // eslint-disable-line
                    }
                } else if (empty(pli.category) && !empty(pli.product)) {
                    productCategory = pli.product.primaryCategory;
                    if (!empty(productCategory)) {
                        Transaction.wrap(function () {
                            pli.setCategory(productCategory);
                        });
                    }
                }

                var quantityAdded = parseInt(req.form.quantity, 10) || 1;
                var products = DataLayerHelper.generateProductLinesDataLayer([pli]);
                if (products) {
                    products[0].quantity = quantityAdded;
                }

                viewDataLayer.push({ // eslint-disable-line
                    event: 'addToCart',
                    ecommerce: {
                        add: {
                            products: products
                        }
                    }
                });

                res.setViewData({
                    GTMDataLayer: viewDataLayer
                });
            }
        }
    }
    next();
});

module.exports = server.exports();
