var baseProductTile = module.superModule;

var productDatalayer = require('*/cartridge/models/product/decorators/productDatalayer');

module.exports = function productTile(product, apiProduct, productType) {
    baseProductTile(product, apiProduct, productType);
    productDatalayer(product, apiProduct);
    return product;
};
