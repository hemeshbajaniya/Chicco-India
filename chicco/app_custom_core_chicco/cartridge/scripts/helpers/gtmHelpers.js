'use strict';

function getGTMData(viewData) {
    var products = [];
    try {
        if (!empty(viewData) && viewData != undefined && empty(viewData.cart)) {
            for (var j = 0; j < viewData.order.items.totalQuantity; j++) {
                products.push({
                    id: !empty(viewData.order.items.items[j].id) ? viewData.order.items.items[j].id : '',
                    name: !empty(viewData.order.items.items[j].productName) ? viewData.order.items.items[j].productName : '',
                    price: !empty(viewData.order.items.items[j].priceTotal.price) ? viewData.order.items.items[j].priceTotal.price : '',
                    brand: !empty(viewData.order.items.items[j].brand) ? viewData.order.items.items[j].brand : '',
                    category: '',
                    variant: !empty(viewData.order.items.items[j].variationAttributes) ? viewData.order.items.items[j].variationAttributes.displayValue : '',
                    quantity: !empty(viewData.order.items.items[j].quantity) ? viewData.order.items.items[j].quantity : '',
                    coupon: !empty(viewData.order.totals.discounts) ? viewData.order.totals.discounts[j].couponCode : ''
                });
            }
            products = JSON.stringify(products);
            products = products.replace('&quot;', "'");
            // eslint-disable-next-line no-param-reassign
            viewData.products = products;
        } else {
            for (var j = viewData.cart.numItems-1; j < viewData.quantityTotal; j++) {
                products.push({
                    id: !empty(viewData.cart.items[j].id) ? viewData.cart.items[j].id : '',
                    name: !empty(viewData.cart.items[j].productName) ? viewData.cart.items[j].productName : '',
                    price: !empty(viewData.cart.items[j].price.sales.formatted) ? viewData.cart.items[j].price.sales.formatted : '',
                    brand: !empty(viewData.cart.items[j].brand) ? viewData.cart.items[j].brand : '',
                    category: '',
                    currencyCode: !empty(viewData.cart.items[j].price.sales.currency) ? viewData.cart.items[j].price.sales.currency : '',
                    variant: !empty(viewData.cart.items[j].variationAttributes) ? viewData.cart.items[j].variationAttributes.displayValue : '',
                    quantity: !empty(viewData.cart.items[j].quantity) ? viewData.cart.items[j].quantity : '',
                    coupon: ''
                });
            }
            // products = JSON.stringify(products);
            // products = products.replace('&quot;', "'");
            // eslint-disable-next-line no-param-reassign
            viewData.products = products;
        }
    } catch (error) {
        
    }
    return viewData;
}


module.exports = {
    getGTMData: getGTMData
};