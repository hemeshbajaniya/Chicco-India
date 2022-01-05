'use strict';

var Logger = require('dw/system/Logger').getLogger('easyRewardz');
var Site = require('dw/system/Site');

var AuthenticationModel = require('*/cartridge/scripts/easyrewardz/model/AuthenticationModel.js');
var easyRewardzServiceRegistry = require('*/cartridge/scripts/easyrewardz/services/easyRewardzServiceRegistry.js');

function getDateString(date) {
    var StringUtils = require('dw/util/StringUtils');
    var formattedDate = StringUtils.formatCalendar(date, 'dd MMM yyyy');
    return formattedDate;
}

function prepareGVAvailabityPayLoad(memeberID, GVCode, authToken) {
    var payLoad = {
        MemberID: memeberID,
        GVCode: GVCode,
        SecurityToken: authToken,
        IsAlert: '',
        CountryCode: '91'
    }
    return payLoad;
}

function prepareGVBlockedPayLoad(memeberID, GVCode, authToken, amount) {
    var payLoad = {
        MemberID: memeberID,
        GVCode: GVCode,
        SecurityToken: authToken,
        Date: getDateString(Site.current.calendar),
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        Amount: amount,
        CountryCode: '91'
    }
    return payLoad;
}

function prepareGVRedeemPayLoad(orderValues) {
    var payLoad = {
        SecurityToken: orderValues.authToken,
        RequestID: orderValues.requestID,
        MemberID: orderValues.memeberID,
        GVCode: orderValues.GVCode,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        Date: getDateString(Site.current.calendar),
        BillNo: orderValues.orderNo,
        AppliedAmount: orderValues.amount,
        PaidAmount: orderValues.totalAmount,
        OTP: '',
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        CountryCode: '91'
    }
    return payLoad;
}

function prepareGVUnBlock(authToken, memeberID, GVCode, amount) {
    var payLoad = {
        SecurityToken: authToken,
        MemberID: memeberID,
        GVCode: GVCode,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        Date: getDateString(Site.current.calendar),
        Amount: amount,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
    }
    return payLoad;
}

function prepareRedemptionHisotryPayLoad(authToken, memeberId, startDate) {
    var payLoad = {
        SecurityToken: authToken,
        EasyId: memeberId,
        TransactionTypeId: 0,
        TransactionDetailsCount: 30, 
        PageSize: '',
        PageNumber: '',
        StartDate: startDate,
        EndDate: '',
        BillNo: ''
    }
    return payLoad;
}

function prepareIssueGVPayLoad(authToken, memberId, issueToEmail, amount) {
    var payLoad = {
        SecurityToken: authToken,
        MemberID: memberId,
        GVOfferCode: Site.current.preferences.custom.easyRewardzIssueOfferCode,
        GVCode: '',
        PointsRedeemed: '',
        IssueToMemberID: '',
        IssueToEmailId: issueToEmail,
        IssueToMobile: '',
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        Category: '',
        GVAmount: amount,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        ThirdParty: 'No',
        SegmentCode: '',
        TierCode: '',
        TransactionId: '',
        OfferTransactionID: '',
        OfferCode: '',
        Communicate: 'Yes',
        CouponOfferTypeCode: ''
    }
    return payLoad;
}

function verifyGV(memberID, GVCode) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var requestPayLoad = prepareGVAvailabityPayLoad(memberID, GVCode, authToken);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'CheckGVAvailability');
    if (!empty(response) && response.ReturnCode == '0') {
        result.GVCode = response.GVCode;
        result.GVBalance = response.GVBalance;
        result.GVStatus = response.GVStatus
    } else {
        Logger.error('(GiftCardModel~verfiyGV) -> Error occured while try to verfiyGV code: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function blockedGVRedemption(memberID, GVCode, amount) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var requestPayLoad = prepareGVBlockedPayLoad(memberID, GVCode,authToken, amount);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'RedeemGV');
    if (!empty(response) && response.ReturnCode == '0') {
        result.requestID = response.RequestID;
        result.message = 'Gift Card Applied Sucessfully';
    } else {
        Logger.error('(GiftCardModel~blockedGVRedemption) -> Error occured while try to blockedGVRedemption: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        if (response.ReturnCode == '253') {
            result.message = 'Invalid Phone Number';
        } else if (response.ReturnCode == '398') {
            result.message = 'Looks like you are not register with us';
        }
        result.error = true;
    }
    return result;
}

function redeemGV(order) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var preparePayLoad = {
        authToken: authToken,
        requestID: order.custom.gvRequestID,
        memeberID: order.getBillingAddress().getPhone(),
        GVCode: order.custom.gvCode,
        orderNo: order.orderNo,
        amount: order.custom.gvAmount,
        totalAmount: order.getTotalGrossPrice().valueOrNull
    }
    var requestPayLoad = prepareGVRedeemPayLoad(preparePayLoad);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'UseGV');
    if (!empty(response) && response.ReturnCode == '0') {
        result.message = response.ReturnMessage;
    } else {
        Logger.error('(GiftCardModel~redeemGV) -> Error occured while try to redeemGV : Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function unblockGV(memeberID, GVCode, amount) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var requestPayLoad = prepareGVUnBlock(authToken, memeberID, GVCode, orderNo, amount);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'UnBlockGV');
    if (!empty(response) && response.ReturnCode == '0') {
        result.message = 'Gift Card removed Sucessfully';
    } else {
        Logger.error('(GiftCardModel~rollBackRedemption) -> Error occured while try to blockedGVRedemption: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function getCustomerRedemptionHistory(memeberID, startDate) {
    var Calendar = require('dw/util/Calendar')
    var result = {
        error: false,
        response: ''
    };
    var calendar = new Calendar(startDate);
    var formattedDate = getDateString(calendar)
    var authToken = AuthenticationModel.getAuthToken();
    var requestPayLoad = prepareRedemptionHisotryPayLoad(authToken, memeberID, formattedDate);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'GetCustomerTransactionDetails');
    if (!empty(response) && response.MemberTransactionResponseListDTO) {
        result.response = response;
    } else {
        Logger.error('(GiftCardModel~getCustomerRedemptionHistory) -> Error occured while try to get customer history: Reason code : {0}' , response.ReturnMessage);
        result.response = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function issueGVToCustomer(memberId, issueToEmail, amount) {
    var result = {
        error: false,
        response: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var requestPayLoad = prepareIssueGVPayLoad(authToken, memberId, issueToEmail, amount);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'IssueGV');
    if (!empty(response) && response.ReturnCode == '0') {
        result.response = response;
    } else {
        Logger.error('(GiftCardModel~issueGVToCustomer) -> Error occured while try to issue GV to customer: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}


module.exports = {
    verifyGV: verifyGV,
    blockedGVRedemption: blockedGVRedemption,
    redeemGV: redeemGV,
    unblockGV: unblockGV,
    getCustomerRedemptionHistory: getCustomerRedemptionHistory,
    issueGVToCustomer: issueGVToCustomer
}
