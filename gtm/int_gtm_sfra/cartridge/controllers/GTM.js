var server = require('server');

server.get('Tracking', function (req, res, next) {
    var Site = require('dw/system/Site');

    var viewData = res.getViewData();
    viewData.gtmContainerID = Site.current.getCustomPreferenceValue('gtmContainerID');
    viewData.gtmAdditionalScripts = Site.current.getCustomPreferenceValue('gtmAdditionalScripts');

    res.render('gtm/tracking');
    next();
});

module.exports = server.exports();
