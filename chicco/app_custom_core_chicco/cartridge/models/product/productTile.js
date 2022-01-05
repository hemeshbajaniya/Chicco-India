'use strict';

var ATTRIBUTE_NAME = 'color';

var URLUtils = require('dw/web/URLUtils');

var decorators = require('*/cartridge/models/product/decorators/index');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var PromotionMgr = require('dw/campaign/PromotionMgr');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');

/**
 * Get product search hit for a given product
 * @param {dw.catalog.Product} apiProduct - Product instance returned from the API
 * @returns {dw.catalog.ProductSearchHit} - product search hit for a given product
 */
 function getProductSearchHit(apiProduct) {
    var searchModel = new ProductSearchModel();
    searchModel.setSearchPhrase(apiProduct.ID);
    searchModel.search();

    if (searchModel.count === 0) {
        searchModel.setSearchPhrase(apiProduct.ID.replace(/-/g, ' '));
        searchModel.search();
    }

    var hit = searchModel.getProductSearchHit(apiProduct);
    if (!hit) {
        var tempHit = searchModel.getProductSearchHits().next();
        if (tempHit.firstRepresentedProductID === apiProduct.ID) {
            hit = tempHit;
        }
    }
    return hit;
}

module.exports = function productTile(product, apiProduct, productType, params) {

    var productSearchHit = getProductSearchHit(apiProduct);
    var options = productHelper.getConfig(apiProduct, { pid: product.id });

    decorators.base(product, apiProduct, productType);
    decorators.price(product, apiProduct, options.promotions, false, options.optionModel);
    decorators.images(product, apiProduct, { types: ['medium'], quantity: 'single' });
    decorators.availability(product, 1, apiProduct.minOrderQuantity.value, apiProduct.availabilityModel);
    decorators.promotions(product, options.promotions);
    decorators.ratings(product);
    if (productType === 'set') {
        decorators.setProductsCollection(product, apiProduct);
    }

    decorators.searchVariationAttributes(product, productSearchHit);
    
    var colorVariations;
    var defaultVariantImage;
    var defaultVariant;
    var selectedSwatch;
    var variationPdpURL;
    var swatchesURL;
    var variationParam = '';
    var variationParamValue = '';
    var otherVariantValues = '';
    var promotion = PromotionMgr.activeCustomerPromotions.getProductPromotions(apiProduct);
    if (product.variationsAttributes) {
        Object.keys(product.variationsAttributes).forEach(function (key) {
            if (product.variationsAttributes[key].id !== ATTRIBUTE_NAME) {
                defaultVariant = apiProduct.variationModel.defaultVariant;
                otherVariantValues = product.variationsAttributes[key].values;
                if (!empty(defaultVariant) && !empty(defaultVariant.custom)) {
                    Object.keys(otherVariantValues).forEach(function (value) {
                        if (defaultVariant.custom[product.variationsAttributes[key].id] === otherVariantValues[value].id) {
                            variationParam = product.variationsAttributes[key].id;
                            variationParamValue = otherVariantValues[value].id;
                        }
                    });
                } else {
                    variationParam = product.variationsAttributes[key].id;
                    variationParamValue = product.variationsAttributes[key].values[0].id;
                }
            }

            if (product.variationsAttributes[key].id === ATTRIBUTE_NAME) {
                colorVariations = product.variationsAttributes[key];
            }

            if (!empty(colorVariations) && !empty(colorVariations.values)) {
                Object.keys(colorVariations.values).forEach(function (key) {
                    if (colorVariations.values[key]) {
                        colorVariations.values[key].swatchesURL = URLUtils.url(
                                'Product-Variation',
                                'dwvar_' + product.id + '_color',
                                colorVariations.values[key].id,
                                'pid',
                                product.id,
                                'quantity',
                                '1'
                                ).toString();

                        colorVariations.values[key].pdpURL = URLUtils.url(
                                'Product-Show',
                                'pid',
                                product.id,
                                'dwvar_' + product.id + '_color',
                                colorVariations.values[key].id
                                ).toString();

                        if (!empty(variationParam) && !empty(variationParamValue)) {
                            colorVariations.values[key].swatchesURL = URLUtils.url(
                                    'Product-Variation',
                                    'dwvar_' + product.id + '_color',
                                    colorVariations.values[key].id,
                                    'dwvar_' + product.id + '_' + variationParam,
                                    variationParamValue,
                                    'pid',
                                    product.id,
                                    'quantity',
                                    '1'
                                    ).toString();

                            colorVariations.values[key].pdpURL = URLUtils.url(
                                    'Product-Show',
                                    'pid',
                                    product.id,
                                    'dwvar_' + product.id + '_color',
                                    colorVariations.values[key].id,
                                    'dwvar_' + product.id + '_' + variationParam,
                                    variationParamValue
                                    ).toString();
                        }
                    }
                });
            }
        });
    }

    if (!empty(colorVariations) && !empty(colorVariations.values)) {
        var varAttr = colorVariations.values;
        var variant = apiProduct.variationModel.defaultVariant;
        if (!empty(variant) && !empty(variant.custom)) {
            Object.keys(varAttr).forEach(function (key) {
                if (variant.custom.color == varAttr[key].id) {
                    defaultVariantImage = !empty(varAttr[key].largeImage) ? varAttr[key].largeImage.url : '';
                    variationPdpURL = !empty(varAttr[key].pdpURL) ? varAttr[key].pdpURL : '';
                    defaultVariant = variant;
                    selectedSwatch = varAttr[key];
                }
            });
        } else {
            defaultVariantImage = !empty(varAttr[0].largeImage) ? varAttr[0].largeImage.url : '';
            variationPdpURL = !empty(varAttr[0].pdpURL) ? varAttr[0].pdpURL : '';
            defaultVariant = varAttr[0];
            selectedSwatch = varAttr[0];
        }
        
        Object.defineProperty(product, 'variationPdpURL', {
            enumerable: true,
            value: variationPdpURL
        });
        
        Object.defineProperty(product, 'selectedSwatch', {
            enumerable: true,
            value: selectedSwatch
        });
        
        Object.defineProperty(product, 'colorVariationsValues', {
            enumerable: true,
            value: colorVariations
        });

        Object.defineProperty(product, 'promotion', {
            enumerable: true,
            value: promotion
        });
        
        if (apiProduct.variationModel && apiProduct.variationModel.defaultVariant) {
            var options = productHelper.getConfig(apiProduct.variationModel.defaultVariant, { pid: product.id });
            Object.defineProperty(product, 'defaultVariantAvailabilityStatus', {
                enumerable: true,
                value: apiProduct.variationModel.defaultVariant.getAvailabilityModel().availabilityStatus
            });
        }
        
    }
    Object.defineProperty(product, 'defaultVariant', {
        enumerable: true,
        value: apiProduct.variationModel.defaultVariant
    });

    return product;
};