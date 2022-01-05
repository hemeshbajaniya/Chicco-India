'use strict';

/**
 * @namespace Login
 */

var page = module.superModule;

var server = require('server');

server.extend(page);

var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger').getLogger('easyRewardz');

var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var EasyRewardzAccountModel = require('*/cartridge/scripts/easyrewardz/model/AccountModel.js');

/**
 * Login-GenerateOtp : This endpoint is called by the customer to generate otp code
 * @name Base/Login-GenerateOtp
 * @function
 * @memberof Login
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - phone - the customer phone number
 * @param {serverfunction} - get
 */

server.post('GenerateOtp', server.middleware.https, consentTracking.consent, function(req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');

    var phoneNumber = req.form.phoneNumber;
    var reqValue = req;
    var result = {
        error: false,
        message: ''
    }
    if (!empty(phoneNumber)) {
        var customerProfile = CustomerMgr.searchProfile('phoneHome = {0}', phoneNumber);
        if (!empty(customerProfile)) {
            try {
                var apiResult = EasyRewardzAccountModel.generateOTP(customerProfile.phoneHome, customerProfile.email, customerProfile.phoneHome);
                if (!apiResult.error) {
                    result.message = Resource.msg('message.otp.sucess.profile.otp.sent', 'otp', null);
                    result.addtioanlMessage = Resource.msgf('label.otp.sent', 'otp', null, phoneNumber);
                    result.customerPhone = phoneNumber;
                    result.requestID = apiResult.optRequestID;
                } else {
                    result.message = Resource.msg('message.otp.error.profile.error', 'otp', null);
                    result.error = true;
                }
            } catch(ex) {
                Logger.error('Login~GenerateOtp -> Exception occured while try to generate otp code, Exception {0}', ex);
                result.message = Resource.msg('message.otp.error.general', 'otp', null);
                result.error = true;
            }

        } else {
            result.message = Resource.msg('message.otp.error.profile.not.found', 'otp', null);
            result.error = true;
        }
    } else {
        result.message = Resource.msg('message.otp.error.profile.not.found', 'otp', null);
        result.error = true;
    }

    res.json(result);
    return next();

});

server.post('VerifyOtp', server.middleware.https, consentTracking.consent, function(req, res, next) {
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');

    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');

    var result = {
        error: false,
        message: ''
    }
    var optCodes = req.form.opt_number1 + req.form.opt_number2 + req.form.opt_number3 + req.form.opt_number4 + req.form.opt_number5 + req.form.opt_number6;
    var phoneNumber = req.form.phoneNumber;
    var requestID = req.form.requestID
    if (!empty(optCodes)) {
        try {
            var apiResult = EasyRewardzAccountModel.validateOTP(phoneNumber, optCodes, requestID);
            if (!apiResult.error) {
                // TODO start reset password token flow
                var customerProfile = CustomerMgr.searchProfile('phoneHome = {0}', phoneNumber);
                var randomToken = require('*/cartridge/scripts/easyrewardz/helper/loginHelper.js').updatePasswordForOTPLogin(customerProfile);
               
                var customerLoginResult = Transaction.wrap(function () {
                var authenticateCustomerResult = CustomerMgr.authenticateCustomer(customerProfile.email, randomToken);
        
                    if (authenticateCustomerResult.status !== 'AUTH_OK') {
                        var errorCodes = {
                            ERROR_CUSTOMER_DISABLED: 'error.message.account.disabled',
                            ERROR_CUSTOMER_LOCKED: 'error.message.account.locked',
                            ERROR_CUSTOMER_NOT_FOUND: 'error.message.login.form',
                            ERROR_PASSWORD_EXPIRED: 'error.message.password.expired',
                            ERROR_PASSWORD_MISMATCH: 'error.message.otp.mismatch',
                            ERROR_UNKNOWN: 'error.message.error.unknown',
                            default: 'error.message.otp.mismatch'
                        };
        
                        var errorMessageKey = errorCodes[authenticateCustomerResult.status] || errorCodes.default;
                        var errorMessage = Resource.msg(errorMessageKey, 'login', null);
        
                        return {
                            error: true,
                            errorMessage: errorMessage,
                            status: authenticateCustomerResult.status,
                            authenticatedCustomer: null
                        };
                    }
        
                    return {
                        error: false,
                        errorMessage: null,
                        status: authenticateCustomerResult.status,
                        authenticatedCustomer: CustomerMgr.loginCustomer(authenticateCustomerResult, true)
                    };
                });

                if (customerLoginResult.error) {
                    if (customerLoginResult.status === 'ERROR_CUSTOMER_LOCKED') {
                        var context = {
                            customer: customer || null
                        };
                        var email = customer.profile.email;
                        
                        var emailObj = {
                            to: email,
                            subject: Resource.msg('subject.account.locked.email', 'login', null),
                            from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
                            type: emailHelpers.emailTypes.accountLocked
                        };
        
                        hooksHelper('app.customer.email', 'sendEmail', [emailObj, 'account/accountLockedEmail', context], function () {});
                    }
                    res.json({
                        error: [customerLoginResult.errorMessage || Resource.msg('error.message.login.form', 'login', null)],
                        message: customerLoginResult.errorMessage
                    });
                    
                    return next();
                }
                if (customerLoginResult.authenticatedCustomer) {
                    result.error = false;
                    result.redirectUrl = accountHelpers.getLoginRedirectURL(req.querystring.rurl, req.session.privacyCache, false)
                }
            } else {
                result.error = true;
                result.message = Resource.msg('message.otp.error.not.valid', 'otp', null);
            }
        } catch (ex) {
            Logger.error('Login~VerifyOtp -> Exception occured while try to verfiy otp code, Exception {0}, line no {1}', ex, ex.lineNumber);
            result.message = Resource.msg('message.otp.error.general', 'otp', null);
            result.error = true;
        }
    } else {
        result.message = Resource.msg('message.otp.error.not.valid', 'otp', null);
        result.error = true;
    }

    res.json(result);
    return next();

});

module.exports = server.exports();
