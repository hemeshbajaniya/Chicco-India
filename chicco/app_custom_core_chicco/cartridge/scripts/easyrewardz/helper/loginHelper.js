'use strict';

/**
 * Generate random number of six digits
 * 
 * @returns {Number} 6 digit randomCode
 */
function generateRendomCode() {
    
    return 'CHICCOCust@' + Math.floor(100000 + Math.random() * 900000).toFixed();
}

function updatePasswordForOTPLogin(profile) {
    var Transaction = require('dw/system/Transaction');
    var passwordResetToken;
    var randomPassword = generateRendomCode();
    var result;
    Transaction.wrap(function () {
        passwordResetToken = profile.credentials.createResetPasswordToken();
      result = profile.credentials.setPasswordWithToken(
            passwordResetToken,
            randomPassword
        );
    });
    return randomPassword;
}

module.exports = {
    updatePasswordForOTPLogin: updatePasswordForOTPLogin
}