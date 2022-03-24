'use strict';

var server = require('server');
server.extend(module.superModule);
var getGTMData = require('*/cartridge/scripts/helpers/gtmHelpers.js');
/**
 * Extends Product-Show controller to show Yotpo rating and reviews on product details page.
 */
server.append('Show', function(req, res, next) {
    var YotpoIntegrationHelper = require('*/cartridge/scripts/common/integrationHelper.js');
    var viewData = YotpoIntegrationHelper.addRatingsOrReviewsToViewData(res.getViewData());

    var products = [];
    var viewContent = {};
    var cost = !empty(viewData.product.price.sales) ? viewData.product.price.sales.formatted : '';
    products.push({
        id: !empty(viewData.product.id) ? viewData.product.id : '',
        name: !empty(viewData.product.productName) ? viewData.product.productName : '',
        price: Number(cost.replace(/[^0-9.-]+/g,"")),
        brand: !empty(viewData.product.brand) ? viewData.product.brand : '',
        category: !empty(viewData.product.rootCatId) ? viewData.product.rootCatId : '',
        variant: !empty(viewData.product.variationAttributes) ? viewData.product.variationAttributes : '',
        quantity: !empty(viewData.product.selectedQuantity) ? viewData.product.selectedQuantity : '',
        coupon: ''
    });
    var amount = !empty(viewData.product.price.sales) ? viewData.product.price.sales.formatted : '';
    viewContent.content_name = !empty(viewData.product.productName) ? viewData.product.productName : '',
    viewContent.content_category = !empty(viewData.product.rootCatId) ? viewData.product.rootCatId : '',
    viewContent.content_ids = !empty(viewData.product.id) ? viewData.product.id : '',
    viewContent.content_type = 'product',
    viewContent.value = Number(amount.replace(/[^0-9.-]+/g,"")),
    viewContent.currency = !empty(viewData.product.price.sales) ? viewData.product.price.sales.currency : '',

    products = JSON.stringify(products);
    products = products.replace('&quot;', "'");
    // eslint-disable-next-line no-param-reassign
    viewData.products = products;
    viewData.viewContent = viewContent;

    res.setViewData(viewData);

    next();
});

module.exports = server.exports();