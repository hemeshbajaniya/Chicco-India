window.jQuery = window.$ = require("jquery");
var processInclude = require("base/util");
processInclude(require("base/main"));

$(document).ready(function () {
    processInclude(require('./component/freeMaternityKit'));
    processInclude(require('./login/otpLogin'));
    processInclude(require('./component/addToCartPLP'));
    processInclude(require('./component/footer'));
    processInclude(require('./component/babyRegistry'));
    processInclude(require('./components/formValidation'));
    processInclude(require('./components/clientSideValidation'));
    processInclude(require('./component/main_design'));
    processInclude(require('wishlist/product/wishlistHeart'));
    processInclude(require('./component/giftCard'));
    processInclude(require('./font-awesome-5-pro'));
    processInclude(require('./facebookpixel'));
    // processInclude(require('font-awesome/fonts'));
    processInclude(require("./component/wishlistCart"));
    processInclude(require('./component/wishlistDetail'));
    processInclude(require('./product/base'));
    processInclude(require('./product/detail'));
    processInclude(require('./search/search'));
    processInclude(require('./component/loyaltyPoints'));
    processInclude(require('./cart/cart'));
    processInclude(require('./component/accountAction'));
    processInclude(require('./component/shiprocket'));
    processInclude(require('./wishlist'));

});
require("base/components/spinner");

