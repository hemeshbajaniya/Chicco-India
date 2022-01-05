'use strict';

var Calendar = require('dw/util/Calendar');
var Site = require('dw/system/Site');
var StringUtils = require('dw/util/StringUtils');
var Logger = require('dw/system/Logger').getLogger('returnHelper', 'returnHelper');
var System = require('dw/system/System');

function isReturnAllowed(deliveredDateString, allowedDays) {
    var result = {
        allowed: false,
        formattedAllowedDate: ''
    }
    var orderDeliveredDate = deliveredDateString.replace(/\s/g, 'T');
    var date = new Date(orderDeliveredDate);
    Logger.info('(returnsHelpers~isReturnAllowed)-> The return Date is: ' + deliveredDateString + ' days are ' + allowedDays);
    var calendar = new Calendar(date);
    calendar.add(Calendar.DAY_OF_YEAR, parseInt(allowedDays));

    var currentCalendar = Site.current.calendar;
    result.allowed = currentCalendar.before(calendar);
    result.formattedAllowedDate = StringUtils.formatCalendar(calendar, 'dd MMMM yyyy');
    return result;
}

module.exports = {
    isReturnAllowed: isReturnAllowed
}