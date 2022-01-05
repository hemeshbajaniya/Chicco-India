'use strict';

/**
 * @namespace Search
 */

var server = require('server');
var page = module.superModule;
server.extend(page);

var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * Search-Show : This endpoint is called when a shopper type a query string in the search box
 * @name Base/Search-Show
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyShortPromotionSensitiveCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - q - query string a shopper is searching for
 * @param {querystringparameter} - search-button
 * @param {querystringparameter} - lang - default is en_US
 * @param {querystringparameter} - cgid - Category ID
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.replace('Show', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function(req, res, next) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var ProductSearch = require('*/cartridge/models/search/productSearch');
    var URLUtils = require('dw/web/URLUtils');
    var productSearch;


    var apiProductSearch = new ProductSearchModel();
    var searchRedirect = req.querystring.q ?
        apiProductSearch.getSearchRedirect(req.querystring.q) :
        null;

    apiProductSearch = searchHelper.setupSearch(apiProductSearch, req.querystring);
    apiProductSearch.search();

    var template = 'search/searchResults';

    var result = searchHelper.search(req, res);

    if (result.searchRedirect) {
        res.redirect(result.searchRedirect);
        return next();
    }

    if (result.category && result.categoryTemplate) {
        template = result.categoryTemplate;
    }

    var redirectGridUrl = searchHelper.backButtonDetection(req.session.clickStream);
    if (redirectGridUrl) {
        res.redirect(redirectGridUrl);
    }

    productSearch = new ProductSearch(
        apiProductSearch,
        req.querystring,
        req.querystring.srule,
        CatalogMgr.getSortingOptions(),
        CatalogMgr.getSiteCatalog().getRoot()
    );

    if (req.querystring.cgid) {
        var pageLookupResult = searchHelper.getPageDesignerCategoryPage(req.querystring.cgid);

        if ((pageLookupResult.page && pageLookupResult.page.hasVisibilityRules()) || pageLookupResult.invisiblePage) {
            // the result may be different for another user, do not cache on this level
            // the page itself is a remote include and can still be cached
            res.cachePeriod = 0; // eslint-disable-line no-param-reassign
        }

        if (pageLookupResult.page) {
            res.page(pageLookupResult.page.ID, {}, pageLookupResult.aspectAttributes);
            return next();
        }
    }

    res.render(template, {
        productSearch: productSearch,
        maxSlots: result.maxSlots,
        reportingURLs: result.reportingURLs,
        refineurl: result.refineurl,
        category: result.category ? result.category : null,
        canonicalUrl: result.canonicalUrl,
        schemaData: result.schemaData,
        apiProductSearch: apiProductSearch
    });

    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var Resource = require('dw/web/Resource');

    var categoryId = '';
    if (!empty(productSearch) && !empty(productSearch.category)) {
        categoryId = productSearch.category.id;
    }

    var breadcrumbs = productHelper.getAllBreadcrumbs(
        categoryId,
        null, []
    );
    breadcrumbs.push({
        htmlValue: Resource.msg('label.search.home', 'search', null),
        url: URLUtils.url('Home-Show')
    });
    breadcrumbs.reverse();
    res.setViewData({
        breadcrumbs: breadcrumbs
    });

    return next();
}, pageMetaData.computedPageMetaData);

server.get('ExcludeProducts', function(req, res, next) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var ProductSearch = require('*/cartridge/models/search/productSearch');

    var apiProduct;
    var inStockProductData = [];
    var inStock = true;

    var showAll = req.querystring.showAll;
    if (showAll) {
        inStock = false;
    }
    var apiProductSearch = new ProductSearchModel();
    apiProductSearch = searchHelper.setupSearch(apiProductSearch, req.querystring, req.httpParameterMap);
    apiProductSearch.search();

    if (!apiProductSearch.personalizedSort) {
        searchHelper.applyCache(res);
    }
    var productSearch = new ProductSearch(
        apiProductSearch,
        req.querystring,
        req.querystring.srule,
        CatalogMgr.getSortingOptions(),
        CatalogMgr.getSiteCatalog().getRoot()
    );

    if (inStock) {
        for (var i = 0; i < productSearch.productIds.length; i++) {
            var product = ProductMgr.getProduct(productSearch.productIds[i].productID);
            if (product.availabilityModel.inStock == true) {
                inStockProductData.push(product.ID);
            }
        }
    }

    res.render('search/components/productTiles', {
        inStockProductData: inStockProductData,
        inStock: inStock,
        productSearch: productSearch
    });
    return next();
});


module.exports = server.exports();