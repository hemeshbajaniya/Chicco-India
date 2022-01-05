'use strict';
 
/**
 * Creates an account model for the current customer
 * @param {Object} req - local instance of request object
 * @returns {Object} a plain object of the current customer's account
 */
function getCategoryModel(categoryId) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var breadcrumbs = productHelper.getAllBreadcrumbs(
        categoryId,
        null,
        []
    );
   
    breadcrumbs.reverse(); 
    
     return breadcrumbs;
}

module.exports={getCategoryModel:getCategoryModel}

