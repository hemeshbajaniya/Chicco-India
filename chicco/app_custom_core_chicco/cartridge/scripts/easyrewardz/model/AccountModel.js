'use strict';

var Logger = require('dw/system/Logger').getLogger('easyRewardz');
var Site = require('dw/system/Site');

var AuthenticationModel = require('*/cartridge/scripts/easyrewardz/model/AuthenticationModel.js');
var easyRewardzServiceRegistry = require('*/cartridge/scripts/easyrewardz/services/easyRewardzServiceRegistry.js');


function prepareRegistrationPayload(customer, authtoken, storeCode) {
    var customerProfile = customer.profile;
    var payLoad =  {
            UserName: Site.current.preferences.custom.easyRewardzUserName,
            SecurityToken: authtoken,
            FirstName: customerProfile.firstName,
            LastName: customerProfile.lastName,
            DateOfBirth: !empty(customerProfile.birthday) ? getDateString(customerProfile.birthday) : '',
            PinCode: "",
            EmailId: customerProfile.email,
            MobileNo: customerProfile.phoneHome,
            EasyPin: "",
            Gender: "",
            MemberShipCardNumber: "",
            StoreCode: storeCode,
            AnniversaryDate: "",
            AssignMembershipCard: "0",
            CCIPolicyNo: "",
            Address1: "",
            Address2: "",
            EmailSubscribe: [
                "",
                ""
            ],
            SMSSubscribe: "",
            EasyPinTypeId: "",
            ReferralCode: "",
            InvitedBy: "",
            ProfileThumbnailImagepath: "",
            EnrollDate: "",
            CompanyName: "Chicco",
            ClientCustomerID: "",
            LoyaltyID: "",
            PANNo: "",
            DeviceID: "",
            ChildGender: "",
            ChildName: "",
            ChildDOB: "",
            ExpectedDateDelivery: "",
            Twin: "",
            Remarks: "",
            ChannelCode: "Website", 
            CustomerTypeCode: "Loyalty", 
            TierName: "",
            CountryCode: "91",
            TierExpiryDate: ""
        }
    return payLoad;
}

function prepareGenerateOTPPayLoad(memberID, emailID, mobileNo, authToken) {
    var payLoad = {
        MemberID: memberID,
        EmailID: emailID,
        MobileNumber: mobileNo,
        StoreCode: Site.current.preferences.custom.easyRewardzStoreCode,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        SecurityToken: authToken
    }
    return payLoad;
}

function prepareOTPVerifyPayLoad(memeberID, OTP, authToken, requestID) {
    var payLoad = {
        MemberID: memeberID,
        RequestID: requestID,
        OTP: OTP,
        UserName: Site.current.preferences.custom.easyRewardzUserName,
        SecurityToken: authToken
    }
    return payLoad;
}

function createAccount(customer) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var storeId = Site.current.preferences.custom.easyRewardzStoreCode;
    var requestPayLoad = prepareRegistrationPayload(customer, authToken, storeId);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'RegisterEasyAccount');
    if (!empty(response) && !response.ReturnCode == '0') {
        result.message = response.ReturnMessage;
    } else {
        Logger.error('(AccountModel~createAccount) -> Error occured while try to create customer: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function updateAccount(customer) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var storeId = Site.current.preferences.custom.easyRewardzStoreCode;
    var requestPayLoad = prepareRegistrationPayload(customer, authToken, storeId);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'UpdateMemberProfile');
    if (!empty(response) && !response.ReturnCode == '0') {
        result.message = response.ReturnMessage;
    } else {
        Logger.error('(AccountModel~updateAccount) -> Error occured while try to updateAccount customer: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function generateOTP(memberID, emailID, mobileNo) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var requestPayLoad = prepareGenerateOTPPayLoad(memberID, emailID, mobileNo, authToken);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'GenerateOTP');
    if (!empty(response) && response.ReturnCode == '0') {
        result.message = response.ReturnMessage;
        result.optRequestID = response.RequestID;
    } else {
        Logger.error('(AccountModel~generateOTP) -> Error occured while try to generate OTP code: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function validateOTP(memberID, OTP, requestID) {
    var result = {
        error: false,
        message: ''
    };
    var authToken = AuthenticationModel.getAuthToken();
    var requestPayLoad = prepareOTPVerifyPayLoad(memberID, OTP, authToken, requestID);
    var response = easyRewardzServiceRegistry.executeAPI(requestPayLoad, 'ValidateOTP');
    if (!empty(response) && response.ReturnCode == '0') {
        result.message = response.ReturnMessage;
    } else {
        Logger.error('(AccountModel~validateOTP) -> Error occured while try to validate OTP code: Reason code : {0}' , response.ReturnMessage);
        result.message = response.ReturnMessage;
        result.error = true;
    }
    return result;
}

function getDateString(date) {
    var StringUtils = require('dw/util/StringUtils');
    var formattedDate = StringUtils.formatCalendar(date, 'dd MMMM yyyy');
    return formattedDate;
}

module.exports = {
    createAccount: createAccount,
    generateOTP: generateOTP,
    validateOTP: validateOTP,
    updateAccount: updateAccount
}