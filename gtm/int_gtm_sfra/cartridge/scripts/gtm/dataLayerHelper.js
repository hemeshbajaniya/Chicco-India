/* global empty */
/* eslint no-underscore-dangle:0 */

var MessageDigest = require('dw/crypto/MessageDigest');
var Bytes = require('dw/util/Bytes');
var Encoding = require('dw/crypto/Encoding');
var collections = require('*/cartridge/scripts/util/collections');
var Decimal = require('dw/util/Decimal');

/**
 * Generates an inline data layer by processing
 * the object and storing a unique hash over the objects
 * contents.
 *
 * @param {Object} dl datalayer
 * @returns {Object} processed datalayer object
 */
// exports.generateInlineDataLayer = function (dl) {
//     var newDl = dl;
//     var md5 = new MessageDigest(MessageDigest.DIGEST_MD5);
//     newDl.ID = Encoding.toHex(md5.digestBytes(new Bytes(JSON.stringify(dl))));
//     return newDl;
// };

exports.generateProductImpressionDataLayer = function (req, res) {
    var viewData = res.getViewData();
    var product = viewData.product;

    if (product) {
        return {
            name: product.productName,
            id: product._gtmMasterID,
            brand: product._gtmBrand,
            price: product._gtmPrice,
            category: product._gtmCategory,
            list: null,
            variant: product._gtmVariantID
        };
    }
    return null;
};

exports.searchDataLayerViewHelper = function (req, res) {
    var viewData = res.getViewData();
    var productSearch = viewData.productSearch;
    var gtmDataLayer = viewData.GTMDataLayer || [];

    if (!empty(productSearch) && !empty(productSearch._gtmCategoryID)) {
        gtmDataLayer.push({
            pageType: "category " + productSearch._gtmCategoryLevel
        });
        gtmDataLayer.push({
            ecomm_pagetype: "category",
            ecomm_category: productSearch._gtmCategoryPath
        });
        res.setViewData({
            GTMGlobalData: {
                GTMCurrentCategoryID: productSearch._gtmCategoryID,
                GTMCurrentCategoryPath: productSearch._gtmCategoryPath,
                GTMCurrentList: "Category L" + productSearch._gtmCategoryLevel
            },
            GTMDataLayer: gtmDataLayer
        });
    } else if (!empty(productSearch)) {
        gtmDataLayer.push({
            pageType: "search results"
        });
        gtmDataLayer.push({
            ecomm_pagetype: "searchresults"
        });
        res.setViewData({
            GTMGlobalData: {
                GTMCurrentList: "Search Results"
            },
            GTMDataLayer: gtmDataLayer
        });
    }
};

exports.productDetailDataLayerViewHelper = function (req, res) {
    var viewData = res.getViewData();
    var product = viewData.product;

    if (product) {
        var gtmDataLayer = viewData.GTMDataLayer || [];

        gtmDataLayer.push({
            ecomm_pagetype: "product",
            ecomm_prodid: product._gtmMasterID,
            ecomm_category: product._gtmCategory,
            ecomm_totalvalue: parseFloat(product._gtmPrice)
        });
        gtmDataLayer.push({
            pageType: 'product detail',
            ecommerce: {
                detail: {
                    products: [{
                        name: product.productName,
                        id: product._gtmMasterID,
                        brand: product._gtmBrand,
                        price: product._gtmPrice,
                        category: product._gtmCategory,
                        variant: product._gtmVariantID
                    }]
                }
            }
        });
        res.setViewData({
            GTMGlobalData: {
                GTMCurrentCategoryID: product._gtmCategoryID
            },
            GTMDataLayer: gtmDataLayer
        });
    }
};

exports.generateProductLinesDataLayer = function (productLineItems) {
    var Site = require('dw/system/Site');
    var products = [];
    for (var i = 0; i < productLineItems.length; i++) {
        var pli = productLineItems[i];
        var pid = pli.productID;
        var variant = null;
        var brand = null;

        var priceAdjustments = pli.getPriceAdjustments();
        var coupon = null;
        for (var j = 0; j < priceAdjustments.length; j++) {
            var pi = priceAdjustments[j];
            if (pi.basedOnCoupon) {
                var couponLine = pi.couponLineItem;
                coupon = couponLine.couponCode;
                break;
            }
        }
        if (!empty(pli.product) && pli.product.isVariant()) {
            pid = pli.product.masterProduct.ID;
            variant = pli.productID;
        }
        if (!empty(pli.product)) {
            brand = pli.product.brand;

            if (empty(brand)) {
                brand = Site.current.name;
            }
        }
        if (pli.proratedPrice.available) {
            products.push({
                name: pli.productName,
                id: pid,
                price: pli.proratedPrice.divide(pli.quantityValue).decimalValue.toString(),
                variant: variant,
                brand: brand,
                quantity: pli.quantityValue,
                category: (!empty(pli.category) ? exports.generateCategoryString(pli.category) : null),
                coupon: coupon
            });
        }
    }
    return products;
};

exports.translateStageToStep = function (stage) {
    switch (stage) {
        case 'shipping':
            return 2;
        case 'payment':
            return 3;
        case 'placeOrder':
            return 4;
        default:
            return 1;
    }
};

exports.checkoutErrorDataLayerViewHelper = function (req, res) {
    var errorType = "SERVER_ERROR";
    var errorMsg = "Generic Error";
    var viewData = res.getViewData();
    if (viewData.error === true) {
        var gtmDataLayer = viewData.GTMDataLayer || [];
        if (!empty(viewData.errorMessage)) {
            errorMsg = viewData.errorMessage;
        } else if (!empty(viewData.serverErrors)) {
            errorMsg = viewData.serverErrors[0];
        } else if (!empty(viewData.fieldErrors)) {
            errorType = "FIELD_ERROR";
            errorMsg = "Field Error";
        }

        // TODO HOOK

        gtmDataLayer.push({
            event: 'checkoutError',
            errorMessage: errorMsg,
            errorType: errorType
        });
        res.setViewData({
            GTMDataLayer: gtmDataLayer
        });
    }
};

/*
 * Event is optional and will not be set if not passed
 */
exports.checkoutDataLayerViewHelper = function (req, res, stage, event) {
    var BasketMgr = require('dw/order/BasketMgr');
    var basket = BasketMgr.getCurrentBasket();
    var viewData = res.getViewData();

    if (viewData.error === true) {
        exports.checkoutErrorDataLayerViewHelper(req, res);
    } else if (!empty(basket) && !empty(basket.allProductLineItems)) {
        var products = exports.generateProductLinesDataLayer(basket.allProductLineItems);

        var step = exports.translateStageToStep(stage);
        var gtmDataLayer = viewData.GTMDataLayer || [];

        var option = null;
        var pinstrs = basket.getPaymentInstruments();
        // TODO extract
        if (!empty(viewData.shippingMethod)) {
            option = viewData.shippingMethod;
        } else if (!empty(pinstrs)) {
            var firstPi = pinstrs[0];
            option = firstPi.paymentMethod;
        }
        // TODO hook

        gtmDataLayer.push({
            pageType: 'checkout',
            event: event,
            ecommerce: {
                checkout: {
                    actionField: {
                        step: step,
                        option: option
                    },
                    products: products
                }
            }
        });
        res.setViewData({
            GTMGlobalData: {
                GTMCurrentCheckoutStep: step
            },
            GTMDataLayer: gtmDataLayer
        });
    }
};

exports.purchaseDataLayerViewHelper = function (req, res, orderNo) {
    if (!empty(orderNo)) {
        var OrderMgr = require('dw/order/OrderMgr');
        var order = OrderMgr.getOrder(orderNo);
        var viewData = res.getViewData();
        var products = exports.generateProductLinesDataLayer(order.allProductLineItems);

        var gtmDataLayer = viewData.GTMDataLayer || [];
        var Site = require('dw/system/Site');

        var priceAdjustments = order.getPriceAdjustments();
        var coupon = null;
        for (var i = 0; i < priceAdjustments.length; i++) {
            var pi = priceAdjustments[i];
            if (pi.basedOnCoupon) {
                var couponLine = pi.couponLineItem;
                coupon = couponLine.couponCode;
                break;
            }
        }
        gtmDataLayer.push({
            ecomm_pagetype: "purchase",
            ecomm_prodid: collections.map(order.allProductLineItems, function (p) {
                return p.productID;
            }),
            ecomm_totalvalue: collections.reduce(order.allProductLineItems, function (val, p) {
                return val.add(p.proratedPrice.decimalValue);
            }, new Decimal(0)).get()
        });

        gtmDataLayer.push({
            pageType: 'purchase',
            event: 'purchase',
            ecommerce: {
                purchase: {
                    actionField: {
                        id: order.orderNo,
                        affiliation: Site.current.name,
                        revenue: order.adjustedMerchandizeTotalNetPrice.decimalValue.toString(),
                        tax: order.totalTax.decimalValue.toString(),
                        shipping: order.adjustedShippingTotalPrice.decimalValue.toString(),
                        coupon: coupon
                    },
                    products: products
                }
            }
        });
        res.setViewData({
            GTMDataLayer: gtmDataLayer
        });
    }
};

exports.generateCategoryString = function (cat) {
    if (empty(cat)) {
        return '';
    }

    var path = [];
    while (!empty(cat) && !empty(cat.parent)) {
        if (!cat.online) {
            cat = cat.parent; // eslint-disable-line
        } else {
            path.unshift(cat.displayName);
            cat = cat.parent; // eslint-disable-line
        }
    }

    return path.join("/");
};
