'use strict';

/**
 * @module controllers/BackInStock
 */

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var server = require('server');
var Resource = require('dw/web/Resource');

server.post('Add', function (req, res, next) {
    var firstName = req.form.firstName;
    var lastName = req.form.lastName;
    var email = req.form.email;
    var pid = req.form.pid;

    // eslint-disable-next-line no-undef
    if (empty(firstName) || empty(lastName) || empty(email)) {
        res.json({
            success: false,
            message: Resource.msg('backinstock.error.info', 'backinstock', null)
        });
        return next();
    }

    var AddSubscriber = require('~/cartridge/scripts/models/AddSubscriber');
    var result = AddSubscriber.add({
        email: email,
        firstName: firstName,
        lastName: lastName,
        pid: pid
    });

    res.json({
        success: result.success,
        message: result.message
    });

    return next();
});

module.exports = server.exports();
