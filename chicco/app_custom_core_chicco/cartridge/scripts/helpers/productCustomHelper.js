'use strict';

var Logger = require('dw/system/Logger').getLogger('productCustomHelper', 'productCustomHelper');

var Site = require('dw/system/Site');

var collections = require('*/cartridge/scripts/util/collections');

/**
 * function use to check if product is free maternityKit
 * @param {dw.catalog.Product} apiProduct - The apiProduct object
 * @returns {Boolean} freeMaternityKit - A boolean falg to show if product is freeMaternityKit
 * 
*/
function checkFreeMaternityKit(apiProduct) {

    if (apiProduct.variant) {
        apiProduct = apiProduct.masterProduct;
    }

    var productCategories = apiProduct.getAllCategories();
    var freeMaternityKit = false;
    try {
        collections.forEach(productCategories, function(category) {
            if (!empty(category.custom.freeMaternityEnabled) && category.custom.freeMaternityEnabled === true) {
                freeMaternityKit = true;
            } 
        });
        // Product override to turn if off or on in specific product
        if (!empty(apiProduct.custom.freeMaternityEnabled) && apiProduct.custom.freeMaternityEnabled === false) {
            freeMaternityKit = false;
        } else if (!freeMaternityKit && !empty(apiProduct.custom.freeMaternityEnabled) && apiProduct.custom.freeMaternityEnabled === true) {
            freeMaternityKit = true;
        }
    
    } catch (ex) {
        Logger.error('(productCustomHelper~checkFreeMaternityKit) Exception occured while try to check product maternitykit, and exception is {0}', ex);
    }
    return freeMaternityKit;
}

/**
 * function use to check if free maternityKit is enabled
 * @returns {Boolean} enabled - A boolean falg to show if freeMaternityKit is enabled
 * 
*/
function freeMaternityKitEnabled() {

    var enabled = !empty(Site.current.preferences.custom.freeMaternityEnabled) ? Site.current.preferences.custom.freeMaternityEnabled: false;
    return enabled;
}

/**
 * method used to get products attribute
 * @param {dw.catalog.Product} apiProduct 
 * @param {Number} quantity
 * @returns {Object} marketingProduct
 */

 function getMarketingProducts(apiProduct, quantity) {
    var Logger = require('dw/system/Logger');
    var PromotionMgr = require('dw/campaign/PromotionMgr');
    var priceFactory = require('*/cartridge/scripts/factories/price');
    var productFactory = require('*/cartridge/scripts/factories/product');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var stringUtils = require('*/cartridge/scripts/helpers/stringUtils');

    try {
        var defaultVariant = apiProduct.variationModel.defaultVariant;
        var defaultVariantPrice;
        var marketingProductData;
        var price;
        var productType = productHelper.getProductType(apiProduct);
        var productModel;

        if (apiProduct.master) {
            var promotions = PromotionMgr.activeCustomerPromotions.getProductPromotions(defaultVariant);
            defaultVariantPrice = priceFactory.getPrice(defaultVariant, null, false, promotions, null);
        }
        productModel = productFactory.get({pid: apiProduct.ID});

        if (defaultVariantPrice) {
            if(defaultVariantPrice.sales) {
                price = defaultVariantPrice.sales.value;
            } else {
                price = defaultVariantPrice.list.value;
            }
        } else {
            if (productModel.price && productModel.price.sales) {
                price = productModel.price.sales.value;
            } else {
                price = prodcutModel.price.list.value;
            }
        }

        var productCategory = '';
        var apiCategories;

        if (apiProduct.getOnlineCategories().length > 0) {
            apiCategories = apiProduct.getOnlineCategories();
            productCategory = stringUtils.removeSingleQuotes(apiCategories[apiCategories.length-1].displayName);
        }

        if (empty(productCategory) && apiProduct.variant &&
            apiProduct.variationModel.master.getOnlineCategories().length > 0) {
                apiCategories = apiProduct.variationModel.master.getOnlineCategories();
                productCategory = stringUtils.removeSingleQuotes(apiCategories[apiCategories.length-1].displayName);
        }

        marketingProductData = {
            name: stringUtils.removeSingleQuotes(apiProduct.name),
            id: apiProduct.ID,
            price: price,
            category: productCategory,
            sku: apiProduct.ID,
            variantID: apiProduct.variant ? apiProduct.ID : '',
            brand: stringUtils.removeSingleQuotes(apiProduct.brand),
            currentCategory: productCategory,
            productType: productType,
            quantity: quantity
        };
        return marketingProductData;
    } catch (e) {
        Logger.error('Error occurred while generating products json. Product {0}: \n Error: {1} \n Message: {2} \n', apiProduct , e.stack, e.message);
        return null;
    }
}

module.exports = {
    checkFreeMaternityKit: checkFreeMaternityKit,
    freeMaternityKitEnabled: freeMaternityKitEnabled,
    getMarketingProducts: getMarketingProducts
}