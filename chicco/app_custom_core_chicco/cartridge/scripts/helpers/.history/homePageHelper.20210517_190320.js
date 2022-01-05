'use strict';

var Logger = require('dw/system/Logger').getLogger('homePageHelper', 'homePageHelper');
var Site = require('dw/system/Site');

var collections = require('*/cartridge/scripts/util/collections');

/**
 * function use get customer applicable active promotions
 * @returns {Array} activePromotions - List of active promotions
 * 
*/
function getAllActivePromotions() {
  var PromotionMgr = require('dw/campaign/PromotionMgr');

  var activePromotions = new Array();
  var customerActivePromtoions = PromotionMgr.getActiveCustomerPromotions().promotions;
  collections.forEach(customerActivePromtoions, function(customerPromotion) {
      try {
        var promotionObj = {
            name: !empty(customerPromotion.name) ? customerPromotion.name : '',
            calloutMsg: !empty(customerPromotion.calloutMsg) ? customerPromotion.calloutMsg.markup : '',
            imgURL: !empty(customerPromotion.image) ? customerPromotion.image.URL : '',
            imgTitle: !empty(customerPromotion.image) ? customerPromotion.image.title : '',
            endDateString: getPromotionEndDateString(customerPromotion.endDate)
        };
        activePromotions.push(promotionObj);
      } catch (ex) {
        Logger.error('(homePageHelper.js~getAllActivePromotions) -> Error occured while try to get all active customer promotions. Exception is:' + ex);
      }

  });
  return activePromotions;
}

/**
 * Local function use get poromtion ending date string from current date
 * @param {Date} promotionEndDate - The ending date of promotion
 * @returns {String} endingDateString - The ending date string including days, hours, minutes & seconds
 * 
*/
function getPromotionEndDateString(promotionEndDate) {
    var currentDate = Site.current.getCalendar().time;
    var endingDateString = 'No End Date!'
    if (!empty(promotionEndDate)) {
        try {
            var endDate = new Date(promotionEndDate.getFullYear() +1, 0, 1);
            var seconds = Math.floor((endDate - (currentDate))/1000);
            var minutes = Math.floor(seconds/60);
            var hours = Math.floor(minutes/60);
            var days = Math.floor(hours/24);
             
            hours = hours-(days*24);
            minutes = minutes-(days*24*60)-(hours*60);
            seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
            endingDateString = days + ' Days : ' + hours + ' Hours : ' +  minutes + ' Mins : ' + seconds + ' Secs';
        } catch (ex) {
            Logger.error('(homePageHelper.js~getPromotionEndDateString) -> Error occured while try to convert promotion ending date into string. Exception is {0}', ex);
        }
    }
    return endingDateString;
}

module.exports = {
    getAllActivePromotions: getAllActivePromotions
}