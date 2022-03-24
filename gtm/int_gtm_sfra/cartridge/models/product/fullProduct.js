/* eslint no-underscore-dangle:0 */

var base = module.superModule || require('app_storefront_base/cartridge/models/product/fullProduct');

var productDatalayer = require('*/cartridge/models/product/decorators/productDatalayer');

module.exports = function fullProduct(product, apiProduct, options) {
    base(product, apiProduct, options);
    productDatalayer(product, apiProduct, options);
    return product;
};
