'use strict';

var base = module.superModule;

module.exports = function fullProduct(product, apiProduct, options) {
    base.call(this, product, apiProduct, options);


    var productCustomHelper = require('*/cartridge/scripts/helpers/productCustomHelper');
    var categoryMain = require('*/cartridge/scripts/helpers/categoryMain');
    var freeMaternityKitHelper = require('*/cartridge/scripts/helpers/freeMaternityKitHelper');

    Object.defineProperty(product, 'freeMaternityKitEligible', {
        enumerable: true,
        value: productCustomHelper.checkFreeMaternityKit(apiProduct)
    });

    Object.defineProperty(product, 'freeMaternityKitEnabled', {
        enumerable: true,
        value: productCustomHelper.freeMaternityKitEnabled()
    });

    Object.defineProperty(product, 'freeMaternityKitCustomerEligible', {
        enumerable: true,
        value: freeMaternityKitHelper.customerEligibleForFreeKit()
    });

    Object.defineProperty(product, 'youtubeVideo', {
        enumerable: true,
        value: !empty(apiProduct.custom.youtubeVideo) ? apiProduct.custom.youtubeVideo : ''
    });

    Object.defineProperty(product, 'youtubeVideo2', {
        enumerable: true,
        value: !empty(apiProduct.custom.youtubeVideo2) ? apiProduct.custom.youtubeVideo2 : ''
    });

    Object.defineProperty(product, 'youtubeVideo3', {
        enumerable: true,
        value: !empty(apiProduct.custom.youtubeVideo3) ? apiProduct.custom.youtubeVideo3 : ''
    });

    Object.defineProperty(product, 'youtubeVideo4', {
        enumerable: true,
        value: !empty(apiProduct.custom.youtubeVideo4) ? apiProduct.custom.youtubeVideo4 : ''
    });

    Object.defineProperty(product, 'youtubeVideo5', {
        enumerable: true,
        value: !empty(apiProduct.custom.youtubeVideo5) ? apiProduct.custom.youtubeVideo5 : ''
    });

    Object.defineProperty(product, 'youtubeVideo6', {
        enumerable: true,
        value: !empty(apiProduct.custom.youtubeVideo6) ? apiProduct.custom.youtubeVideo6 : ''
    });

    Object.defineProperty(product, 'YouTubeLinks', {
        enumerable: true,
        value: !empty(apiProduct.custom.YouTubeLinks) ? apiProduct.custom.YouTubeLinks : ''
    });

    Object.defineProperty(product, 'specifications', {
        enumerable: true,
        value: !empty(apiProduct.custom.specifications) ? apiProduct.custom.specifications : ''
    });

    Object.defineProperty(product, 'warningsInstruction', {
        enumerable: true,
        value: !empty(apiProduct.custom.warningsInstruction) ? apiProduct.custom.warningsInstruction : ''
    });

    Object.defineProperty(product, 'subtitle', {
        enumerable: true,
        value: !empty(apiProduct.custom.subtitle) ? apiProduct.custom.subtitle : ''
    });

    Object.defineProperty(product, 'AgeGroup', {
        enumerable: true,
        value: !empty(apiProduct.custom.AgeGroup) ? apiProduct.custom.AgeGroup : ''
    });

    Object.defineProperty(product, 'highlightsImages1', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages1) ? apiProduct.custom.highlightsImages1 : ''
    });

    Object.defineProperty(product, 'highlightsImages2', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages2) ? apiProduct.custom.highlightsImages2 : ''
    });

    Object.defineProperty(product, 'highlightsImages3', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages3) ? apiProduct.custom.highlightsImages3 : ''
    });

    Object.defineProperty(product, 'highlightsImages4', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages4) ? apiProduct.custom.highlightsImages4 : ''
    });

    Object.defineProperty(product, 'highlightsImages5', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages5) ? apiProduct.custom.highlightsImages5 : ''
    });

    Object.defineProperty(product, 'highlightsImages6', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages6) ? apiProduct.custom.highlightsImages6 : ''
    });

    Object.defineProperty(product, 'highlightsImages7', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages7) ? apiProduct.custom.highlightsImages7 : ''
    });

    Object.defineProperty(product, 'highlightsImages8', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages8) ? apiProduct.custom.highlightsImages8 : ''
    });

    Object.defineProperty(product, 'highlightsImages9', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages9) ? apiProduct.custom.highlightsImages9 : ''
    });

    Object.defineProperty(product, 'highlightsImages10', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsImages10) ? apiProduct.custom.highlightsImages10 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle1', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle1) ? apiProduct.custom.highlightsTextTitle1 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle2', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle2) ? apiProduct.custom.highlightsTextTitle2 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle3', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle3) ? apiProduct.custom.highlightsTextTitle3 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle4', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle4) ? apiProduct.custom.highlightsTextTitle4 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle5', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle5) ? apiProduct.custom.highlightsTextTitle5 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle6', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle6) ? apiProduct.custom.highlightsTextTitle6 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle7', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle7) ? apiProduct.custom.highlightsTextTitle7 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle8', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle8) ? apiProduct.custom.highlightsTextTitle8 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle9', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle9) ? apiProduct.custom.highlightsTextTitle9 : ''
    });

    Object.defineProperty(product, 'highlightsTextTitle10', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextTitle10) ? apiProduct.custom.highlightsTextTitle10 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription1', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription1) ? apiProduct.custom.highlightsTextDescription1 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription2', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription2) ? apiProduct.custom.highlightsTextDescription2 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription3', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription3) ? apiProduct.custom.highlightsTextDescription3 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription4', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription4) ? apiProduct.custom.highlightsTextDescription4 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription5', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription5) ? apiProduct.custom.highlightsTextDescription5 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription6', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription6) ? apiProduct.custom.highlightsTextDescription6 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription7', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription7) ? apiProduct.custom.highlightsTextDescription7 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription8', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription8) ? apiProduct.custom.highlightsTextDescription8 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription9', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription9) ? apiProduct.custom.highlightsTextDescription9 : ''
    });

    Object.defineProperty(product, 'highlightsTextDescription10', {
        enumerable: true,
        value: !empty(apiProduct.custom.highlightsTextDescription10) ? apiProduct.custom.highlightsTextDescription10 : ''
    });

    Object.defineProperty(product, 'withOutFeatureCarouselCategory', {
        enumerable: true,
        value: apiProduct.categories.length > 0 ? apiProduct.categories[0].parent.ID : ''
    });

    Object.defineProperty(product, 'withOutFeatureCarouselCategoryMain', {
        enumerable: true,
        value: apiProduct.categories.length > 0 ? apiProduct.categories[0].ID : ''
    });

    Object.defineProperty(product, 'faq', {
        enumerable: true,
        value: !empty(apiProduct.custom.faq) ? apiProduct.custom.faq : ''
    });

    Object.defineProperty(product, 'returnPolicy', {
        enumerable: true,
        value: !empty(apiProduct.custom.returnPolicy) ? apiProduct.custom.returnPolicy : ''
    });

    
    // var ProductMgr = require('dw/catalog/ProductMgr');
    // var categoryid = ProductMgr.getProduct(product.id);
    // if(categoryid.allCategories.length > 0){
    //     var rootCatId = categoryMain.getCategoryModel(categoryid.allCategories[0].displayName ? categoryid.allCategories[0].displayName : '');
    // }
    
    // if(!empty(rootCatId)){
    //     product['rootCatId'] = rootCatId[0].htmlValue; 
    // }

    var ProductMgr = require('dw/catalog/ProductMgr');
    var categoryid = ProductMgr.getProduct(product.id);
    var masterId;

    if (product.productType == 'variant') {
        masterId = categoryid.masterProduct;
    } else {
        masterId = categoryid;
    }

    if (masterId.allCategories.length > 0) {
        var indexCat = masterId.allCategories.length - 1;
        var catID = masterId.allCategories[indexCat];
    }

    if (!empty(catID)) {
        product['rootCatId'] = catID.displayName;
    }

    
    return product;
};
