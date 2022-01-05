'use strict';

var page = module.superModule;

var server = require('server');
server.extend(page);


server.append('Show', function (req, res, next) {

    var viewdata = res.getViewData();
    var ProductMgr = require('dw/catalog/ProductMgr');
    var categoryid = ProductMgr.getProduct(viewdata.product.id);
    var masterId;

    if (viewdata.product.productType == 'variant') {
        masterId = categoryid.masterProduct;
    } else {
        masterId = categoryid;
    }

    if (masterId.allCategories.length > 0) {
        var indexCat = masterId.allCategories.length - 1;
        var catID = masterId.allCategories[indexCat];
    }

    if (!empty(catID)) {
        viewdata.product['rootCatId'] = catID.displayName;
        res.setViewData(viewdata.product);
    }

    next();
});

module.exports = server.exports();