/* eslint no-underscore-dangle:0 */

var base = module.superModule;

var DataLayerHelper = require('*/cartridge/scripts/gtm/dataLayerHelper');

function ProductSearch(productSearch, httpParams, sortingRule, sortingOptions, rootCategory) {
    base.call(this, productSearch, httpParams, sortingRule, sortingOptions, rootCategory);

    if (productSearch.category) {
        this._gtmCategoryID = productSearch.category.ID;
        this._gtmCategoryPath = DataLayerHelper.generateCategoryString(productSearch.category);
        var level = 0;
        var cat = productSearch.category;
        while (!cat.root) {
            if (cat.online) {
                level++;
            }
            cat = cat.parent;
        }
        this._gtmCategoryLevel = level;
    }
}

ProductSearch.prototype = Object.create(base.prototype);

module.exports = ProductSearch;
