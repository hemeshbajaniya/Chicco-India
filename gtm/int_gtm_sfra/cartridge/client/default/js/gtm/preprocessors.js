/* eslint no-underscore-dangle:0 */
var $ = window.jQuery;

exports.preprocessImpression = function (impression, element) {
    var $el = $(element);

    var listID = $el.closest('[data-gtmcurrentlist]').attr('data-gtmcurrentlist');
    var categoryPath = $el.closest('[data-gtmcurrentcategorypath]').attr('data-gtmcurrentcategorypath');

    if (!listID && window._gtmGlobalData && window._gtmGlobalData.GTMCurrentList) {
        listID = window._gtmGlobalData.GTMCurrentList;
    }

    if (!categoryPath && window._gtmGlobalData && window._gtmGlobalData.GTMCurrentCategoryPath) {
        categoryPath = window._gtmGlobalData.GTMCurrentCategoryPath;
    }

    if (categoryPath) {
        impression.category = categoryPath;
    }

    var position = $el.closest('[data-gtmcurrentposition]').attr('data-gtmcurrentposition');
    if (position) {
        impression.position = parseInt(position, 10);
    }

    if (listID) {
        impression.list = listID;
    }
    return impression;
};
