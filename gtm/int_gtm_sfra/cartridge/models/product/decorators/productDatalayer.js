/* global empty */
/* eslint no-underscore-dangle:0 */

var Site = require('dw/system/Site');

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

module.exports = function (product, apiProduct, options) {
    var categoryStr = null;
    if (apiProduct.variant) {
        apiProduct = apiProduct.masterProduct; // eslint-disable-line
    }
    if (!empty(options) && !empty(options.cgid)) {
        var CatalogMgr = require('dw/catalog/CatalogMgr');
        var category = CatalogMgr.getCategory(options.cgid);
        if (!empty(category)) {
            categoryStr = DataLayerHelper.generateCategoryString(category);
            product._gtmCategoryID = category.ID;
        }
    }
    if (empty(categoryStr) && !empty(apiProduct.primaryCategory)) {
        categoryStr = DataLayerHelper.generateCategoryString(apiProduct.primaryCategory);
        product._gtmCategoryID = apiProduct.primaryCategory.ID;
    } else if (empty(categoryStr) && !empty(apiProduct.categoryAssignments)) {
        categoryStr = DataLayerHelper.generateCategoryString(apiProduct.categoryAssignments[0].category);
        product._gtmCategoryID = apiProduct.categoryAssignments[0].category.ID;
    }
    product._gtmCategory = categoryStr;

    var masterID = apiProduct.ID;
    if (apiProduct.variant) {
        masterID = apiProduct.masterProduct.ID;
    }
    product._gtmMasterID = masterID;

    if (!empty(apiProduct.brand)) {
        product._gtmBrand = apiProduct.brand;
    } else {
        product._gtmBrand = Site.current.name;
    }

    product._gtmPrice = null;
    if (product.price.sales) {
        product._gtmPrice = product.price.sales.decimalPrice;
    }

    product._gtmVariantID = null;
    if (apiProduct.variant) {
        product._gtmVariantID = apiProduct.ID;
    }
};
