var server = require('server');

var Site = require('dw/system/Site');

server.get('CheckService', 
            function (req, res, next) {
    
    var pinCode = req.querystring.pinCode;
    var result = {};

    if (!empty(pinCode)) {
        var Serviceability = require('*/cartridge/scripts/shiprocket/model/Serviceability.js');
        result = Serviceability.getServiceETD(pinCode);
    } else {
        result.error = true;
        result.errorMsg = 'Please enter a valid location';
    }
    res.json(result);
    return next();
});

module.exports = server.exports();