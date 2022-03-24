var base = module.superModule;

var baseGetConfig = base.getConfig;

base.getConfig = function (apiProduct, params) {
    var options = baseGetConfig.apply(this, arguments);
    if (params.cgid) {
        options.cgid = params.cgid;
    } else {
        options.cgid = null;
    }
    return options;
};

module.exports = base;
