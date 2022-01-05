'use strict';

var base = require('../product/base');

/**
 * appends params to a url
 * @param {string} url - Original url
 * @param {Object} params - Parameters to append
 * @returns {string} result url with appended parameters
 */
function appendToUrl($url, params) {
  var $newUrl = $url;
  $newUrl +=
    ($newUrl.indexOf('?') !== -1 ? '&' : '?') +
    Object.keys(params)
      .map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
      })
      .join('&');

  return $newUrl;
}

/**
 * Checks whether the basket is valid. if invalid displays error message and disables
 * checkout button
 * @param {Object} data - AJAX response from the server
 */
function validateBasket(data) {
  if (data.valid.error) {
    if (data.valid.message) {
      var $errorHtml =
        "<div class='alert alert-danger alert-dismissible valid-cart-error " +
        "fade show' role='alert'>" +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
        "<span aria-hidden='true'>&times;</span>" +
        "</button>" +
        data.valid.message +
        "</div>";

      $('.cart-error').empty().append($errorHtml);
    } else {
      $('.cart')
        .empty()
        .append(
          "<div class='row'> " +
            "<div class='col-12 text-center'> " +
            '<h1>' +
            data.resources.emptyCartMsg +
            "</h1> " +
            "</div> " +
            "</div>"
        );
      $('.number-of-items').empty().append(data.resources.numberOfItems);
      $('.minicart-quantity').empty().append(data.numItems);
      $('.minicart .popover').empty().removeClass('show');
    }

    $('.checkout-btn').addClass('disabled');
  } else {
    $('.checkout-btn').removeClass('disabled');
  }
}

/**
 * re-renders the order totals and the number of items in the cart
 * @param {Object} data - AJAX response from the server
 */
function updateCartTotals(data) {
  if (data.numItems) {
    $('.minicart-quantity').text(data.numItems);
  }
  var $miniCartSelector = $('.mini-cart-data');
  var $noOfItems = $miniCartSelector.find('.mini-cart-data .number-of-items');
  var $shippingCostSelector = $miniCartSelector.find('.shipping-cost');
  var $totalTaxSelector = $miniCartSelector.find('.tax-total');
  var $grandTotalSelector = $miniCartSelector.find('.grand-total');
  var $subTotalSelector = $miniCartSelector.find('.sub-total');
  var $orderDiscountSelector = $miniCartSelector.find('.order-discount');

  if ($noOfItems.length > 0) {
    $noOfItems.empty().append(data.resources.numberOfItems);
  }
  if ($shippingCostSelector.length > 0) {
    $shippingCostSelector.empty().append(data.totals.totalShippingCost);
  }
  if ($totalTaxSelector.length > 0) {
    $totalTaxSelector.empty().append(data.totals.totalTax);
  }
  if ($grandTotalSelector.length > 0) {
    $grandTotalSelector.each(function () {
      $(this).empty().append(data.totals.grandTotal);
    });
  }
  if ($subTotalSelector.length > 0) {
    $subTotalSelector.empty().append(data.totals.subTotal);
  }

  if (data.totals.orderLevelDiscountTotal.value > 0) {
    $orderDiscountSelector.removeClass('hide-order-discount');
    $miniCartSelector
      .find('.order-discount-total')
      .empty()
      .append('- ' + data.totals.orderLevelDiscountTotal.formatted);
  } else {
    $orderDiscountSelector.addClass('hide-order-discount');
  }

  if (data.totals.shippingLevelDiscountTotal.value > 0) {
    $miniCartSelector
      .find('.shipping-discount')
      .removeClass('hide-shipping-discount');
    $miniCartSelector
      .find('.shipping-discount-total')
      .empty()
      .append('- ' + data.totals.shippingLevelDiscountTotal.formatted);
  } else {
    $miniCartSelector
      .find('.shipping-discount')
      .addClass('hide-shipping-discount');
  }

  data.items.forEach(function (item) {
    if (item.price.list) {
      $miniCartSelector
        .find(
          '.item-total-' +
            item.UUID +
            ' .product-line-item-details  .price .strike-through'
        )
        .remove();
      $miniCartSelector
        .find(
          '.item-total-' + item.UUID + ' .product-line-item-details  .price'
        )
        .prepend(
          "<span class='strike-through list'>" +
            "<span class='value' content='' " +
            item.priceTotal.nonAdjustedFormattedPrice +
            " ''>" +
            "<span class='sr-only'>label.price.reduced.from</span>" +
            "<span class='eswListPrice'>" +
            item.priceTotal.nonAdjustedFormattedPrice +
            "</span>" +
            "<span class='sr-only'>label.price.to</span></span></span>"
        );
    } else {
      $miniCartSelector
        .find(
          '.item-total-' +
            item.UUID +
            ' .product-line-item-details  .price .strike-through'
        )
        .remove();
    }
    $miniCartSelector
      .find('.item-total-' + item.UUID + ' .product-line-item-details  .sales')
      .empty()
      .append(item.priceTotal.price);
  });
  // Custom End
}

/**
 * re-renders the order totals and the number of items in the cart
 * @param {Object} message - Error message to display
 */
function createErrorNotification(message) {
  var $errorHtml =
    "<div class='alert alert-danger alert-dismissible valid-cart-error " +
    "fade show' role='alert'>" +
    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
    "<span aria-hidden='true'>&times;</span>" +
    "</button>" +
    "<span class='text-danger'>"+message +"</span>"+
    "</div>";

  $('.cart-error').empty().append($errorHtml);
  setTimeout(function () {
    $('.cart-error').remove();
  }, 5000);

}

/**
 * re-renders the approaching discount messages
 * @param {Object} approachingDiscounts - updated approaching discounts for the cart
 */
function updateApproachingDiscounts(approachingDiscounts) {
  var $html = '';
  $('.approaching-discounts').empty();
  if (approachingDiscounts.length > 0) {
    approachingDiscounts.forEach(function (item) {
      $html +=
        "<div class='single-approaching-discount text-center'>" +
        item.discountMsg +
        "</div>";
    });
  }
  $('.approaching-discounts').append($html);
}

/**
 * Updates the availability of a product line item
 * @param {Object} data - AJAX response from the server
 * @param {string} uuid - The uuid of the product line item to update
 */
function updateAvailability(data, uuid) {
  var $lineItem;
  var $messages = '';

  for (var i = 0; i < data.items.length; i++) {
    if (data.items[i].UUID === uuid) {
      $lineItem = data.items[i];
      break;
    }
  }

  $('.availability-' + $lineItem.UUID).empty();

  if ($lineItem.availability) {
    if ($lineItem.availability.messages) {
      $lineItem.availability.messages.forEach(function (message) {
        $messages += "<p class='line-item-attributes'>' + message + '</p>";
      });
    }

    if ($lineItem.availability.inStockDate) {
      $messages +=
        "<p class='line-item-attributes line-item-instock-date'>" +
        $lineItem.availability.inStockDate +
        "</p>";
    }
  }

  $('.availability-' + $lineItem.UUID).html($messages);
}

/**
 * This event binding function will handle the keyboard pressed keys on the basis of
 * conditions and also it will replace the alphabets with empty string then update the
 * quantity of the product.
 * @param e
 */
$('.quantity-form > .quantity').bind('keyup', function (e) {
  this.value = this.value.replace(/[^\d].+/, '');

  var $keyCode = e.$keyCode ? e.$keyCode : e.which;
  //for down key arrow
  if ($keyCode == 40) {
    decreaseQuantity(this);
  }

  //for up key arrow
  if ($keyCode == 38) {
    increaseQuantity(this);
  }

  if ($keyCode != 8 && $keyCode != 46) {
    if (
      ($keyCode >= 48 && $keyCode <= 57) ||
      ($keyCode >= 96 && $keyCode <= 105)
    ) {
      updateCartQuantity(this, true);
    }
  }

  if ($keyCode < 48 || $keyCode > 57 || $keyCode < 96 || $keyCode > 105) {
    e.preventDefault();
  }
});

/**
 * DecreaseQuantity function is used to decrease the quantity of the selected product if
 * quantity of the product is empty or null then this function will add the one quantity instead of
 * empty or null. if selected product quantity is one then it will disable the decreaseQuantity button.
 * @param quantitySelector
 * @param id
 */
function decreaseQuantity(quantitySelector, id) {
  var $quantity = parseInt($(quantitySelector).val());
  var $decreasedSelector = $('button.decreased-btn[data-pid="' + id + ' "]');
  if (isNaN($quantity)) {
    $decreasedSelector.attr('disabled', true);
    $quantity = 1;
  }

  $quantity = $quantity > 1 ? $quantity - 1 : $quantity;

  if ($quantity == 1) {
    $decreasedSelector.attr('disabled', true);
  } else {
    $decreasedSelector.attr('disabled', false);
  }
  $(quantitySelector).val($quantity);
  updateCartQuantity(quantitySelector, false);
}

/**
 * IncreaseQuantity function is used to increase the quantity of the selected product if
 * quantity of the product is empty or null then this function will add the one quantity instead of
 * empty or null. if selected product quantity is one then it will disable the decreaseQuantity button.
 * @param quantitySelector
 * @param id
 */
function increaseQuantity(quantitySelector, id) {
  var $quantity = parseInt($(quantitySelector).val());
  var $decreasedSelector = $('button.decreased-btn[data-pid="' + id + '"]');
  if (isNaN($quantity)) {
    $(quantitySelector).val(1);
    $decreasedSelector.attr('disabled', true);
  }

  if ($quantity >= 1) {
    $decreasedSelector.attr('disabled', false);
    $quantity = $quantity + 1;
    $(quantitySelector).val($quantity);
  }
  updateCartQuantity(quantitySelector, false);
}

/**
 * updateCartQuantity function will update the quantity in the product and the cart.
 * quantitySelector param is used to get the selected product class and it data attributes.
 * @param quantitySelector
 * @param isKeyEvent is used to check the current event is fire from keys or mouse.
 */
function updateCartQuantity(quantitySelector, isKeyEvent) {
  var $preSelectQty = $(quantitySelector).data('pre-select-qty');
  var $quantity = isKeyEvent
    ? parseInt(quantitySelector.value)
    : parseInt($(quantitySelector).val());
  var $productID = $(quantitySelector).data('pid');
  var $url = $(quantitySelector).data('action');
  var $uuid = $(quantitySelector).data('uuid');

  if (isNaN($quantity) || $quantity == 0) {
    $quantity = 1;
    $(quantitySelector).val($quantity);
  }

  if ($quantity == 1 || $quantity == 0) {
    $('#decreased-' + $productID).attr('disabled', true);
  } else {
    $('#decreased-' + $productID).attr('disabled', false);
  }

  var $urlParams = {
    pid: $productID,
    quantity: $quantity,
    uuid: $uuid,
  };

  $url = appendToUrl($url, $urlParams);
  $(quantitySelector)
    .parents('.product-info, .align-items-center')
    .spinner()
    .start();

  $.ajax({
    url: $url,
    type: 'get',
    context: quantitySelector,
    dataType: 'json',
    success: function (data) {
      $('.quantity[data-uuid="' + $uuid + '"]').val($quantity);
      $('.coupons-and-promos')
        .children('.coupons-and-promos-wrapper')
        .empty()
        .append(data.totals.discountsHtml);
      $('.minicart-footer .subtotal-total-discount')
        .empty()
        .append(data.totals.subTotal);
      updateCartTotals(data);
      updateApproachingDiscounts(data.approachingDiscounts);
      updateAvailability(data, $uuid);
      validateBasket(data);
      $(quantitySelector).data('pre-select-qty', $quantity);
      $.spinner().stop();
    },
    error: function (err) {
      if (err.responseJSON.redirectUrl) {
        window.location.href = err.responseJSON.redirectUrl;
      } else {
        createErrorNotification(err.responseJSON.errorMessage);
        $(quantitySelector).val(parseInt($preSelectQty, 10));
        $.spinner().stop();
      }
    },
  });
}

/**
 * replace content of modal
 * @param {string} actionUrl - url to be used to remove product
 * @param {string} productID - pid
 * @param {string} productName - product name
 * @param {string} uuid - uuid
 */
 function confirmDelete(actionUrl, productID, productName, uuid) {
  var $deleteConfirmBtn = $('.cart-delete-confirmation-btn');
  var $productToRemoveSpan = $('.product-to-remove');

  $deleteConfirmBtn.data('pid', productID);
  $deleteConfirmBtn.data('action', actionUrl);
  $deleteConfirmBtn.data('uuid', uuid);

  $productToRemoveSpan.empty().append(productName);
}

module.exports = function () {
  $('body').on('click', '.remove-product', function (e) {
    e.preventDefault();

    var actionUrl = $(this).data('action');
    var productID = $(this).data('pid');
    var productName = $(this).data('name');
    var uuid = $(this).data('uuid');
    confirmDelete(actionUrl, productID, productName, uuid);
});

$('body').on('afterRemoveFromCart', function (e, data) {
    e.preventDefault();
    confirmDelete(data.actionUrl, data.productID, data.productName, data.uuid);
});

  $("body").on("click", ".cart-delete-confirmation-btn", function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var productID = $(this).data("pid");
    var url = $(this).data("action");
    var uuid = $(this).data("uuid");
    var urlParams = {
      pid: productID,
      uuid: uuid,
    };

    url = appendToUrl(url, urlParams);

    $("body > .modal-backdrop").remove();

    $.spinner().start();
    $.ajax({
      url: url,
      type: "get",
      dataType: "json",
      success: function (data) {
        if (data.basket.items.length === 0) {
          $(".cart-container").empty();
          $(".empty-cart-container").append(
            "<div class='row'> " +
              "<div class='col-12 text-center'> " +
              "<h1>" +
              data.basket.resources.emptyCartMsg +
              "</h1> " +
              "</div> " +
              "</div>"
          );
          $(".number-of-items")
            .empty()
            .append(data.basket.resources.numberOfItems);
          $(".minicart-quantity").empty().append(data.basket.numItems);
          $(".left_paymet_boxes").empty();
          $(".minicart-link").attr({
            "aria-label": data.basket.resources.minicartCountOfItems,
            title: data.basket.resources.minicartCountOfItems,
          });
          $(".minicart .popover").empty();
          $(".minicart .popover").removeClass("show");
          $("body").removeClass("modal-open");
          $("html").removeClass("veiled");
        } else {
          if (data.toBeDeletedUUIDs && data.toBeDeletedUUIDs.length > 0) {
            for (var i = 0; i < data.toBeDeletedUUIDs.length; i++) {
              $(".uuid-" + data.toBeDeletedUUIDs[i]).remove();
            }
          }
          $(".uuid-" + uuid).remove();
          if (!data.basket.hasBonusProduct) {
            $(".bonus-product").remove();
          }
          $(".coupons-and-promos")
            .empty()
            .append(data.basket.totals.discountsHtml);
          updateCartTotals(data.basket);
          updateApproachingDiscounts(data.basket.approachingDiscounts);
          $("body").trigger("setShippingMethodSelection", data.basket);
          validateBasket(data.basket);
        }

        $("body").trigger("cart:update");

        $.spinner().stop();
      },
      error: function (err) {
        if (err.responseJSON.redirectUrl) {
          window.location.href = err.responseJSON.redirectUrl;
        } else {
          location.reload();
          createErrorNotification(err.responseJSON.errorMessage);
          $.spinner().stop();
        }
      },
    });
  });

  $('body').on('click', '.delete-product', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var productID = $(this).data('pid');
    var url = $(this).data('action');
    var uuid = $(this).data('uuid');
    var urlParams = {
      pid: productID,
      uuid: uuid,
    };

    url = appendToUrl(url, urlParams);

    $('body > .modal-backdrop').remove();

    $.spinner().start();
    $.ajax({
      url: url,
      type: 'get',
      dataType: 'json',
      success: function (data) {
        if (data.basket.items.length === 0) {
          $('.cart-container').empty();
          $('.empty-cart-container').append(
            "<div class='row'> " +
              "<div class='col-12 text-center'> " +
              "<h1>" +
              data.basket.resources.emptyCartMsg +
              "</h1> " +
              "</div> " +
              "</div>"
          );
          $('.number-of-items')
            .empty()
            .append(data.basket.resources.numberOfItems);
          $('.minicart-quantity').empty().append(data.basket.numItems);
          $('.left_paymet_boxes').empty();
          $('.minicart-link').attr({
            'aria-label': data.basket.resources.minicartCountOfItems,
            title: data.basket.resources.minicartCountOfItems,
          });
          $('.minicart .popover').empty();
          $('.minicart .popover').removeClass('show');
          $('body').removeClass('modal-open');
          $('html').removeClass('veiled');
        } else {
          if (data.toBeDeletedUUIDs && data.toBeDeletedUUIDs.length > 0) {
            for (var i = 0; i < data.toBeDeletedUUIDs.length; i++) {
              $('.uuid-' + data.toBeDeletedUUIDs[i]).remove();
            }
          }
          $('.uuid-' + uuid).remove();
          if (!data.basket.hasBonusProduct) {
            $('.bonus-product').remove();
          }
          $('.coupons-and-promos')
            .empty()
            .append(data.basket.totals.discountsHtml);
          updateCartTotals(data.basket);
          updateApproachingDiscounts(data.basket.approachingDiscounts);
          $('body').trigger('setShippingMethodSelection', data.basket);
          validateBasket(data.basket);
        }

        $('body').trigger('cart:update');

        $.spinner().stop();
      },
      error: function (err) {
        if (err.responseJSON.redirectUrl) {
          window.location.href = err.responseJSON.redirectUrl;
        } else {
          createErrorNotification(err.responseJSON.errorMessage);
          $.spinner().stop();
        }
      },
    });
  });

  /**
   * This is new click event function on the decreased quantity button.
   * It will get the decreased-btn data attribute and builds the quantitySelector
   * class and it will call the decreaseQuantity function.
   */
  $('body')
    .off('click', '.decreased-btn')
    .on('click', '.decreased-btn', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var $pid = $(this).data('pid');
      var $quantitySelector = '.' + $(this).data('pid');
      decreaseQuantity($quantitySelector, $pid);
    });

  /**
   * This is new click event function on the increased quantity button.
   * It will get the increased-btn data attribute and builds the quantitySelector
   * class and it will call the increaseQuantity function.
   */
  $('body')
    .off('click', '.increased-btn')
    .on('click', '.increased-btn', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var $pid = $(this).data('pid');
      var $quantitySelector = '.' + $(this).data('pid');
      increaseQuantity($quantitySelector, $pid);
      return;
    });

  /**
   * This is override change event function on the quantity input field.
   * It is used to update the quantity of the product in the cart. It will call
   * the updateCartQuantity function that will handle the quantity update
   * functionality.
   */
  $('body')
    .off('change', '.quantity-form > .quantity')
    .on('change', '.quantity-form .quantity', function (e) {
      e.preventDefault();
      updateCartQuantity(this, false);
    });

  $('body').on('click','.promo-code-submit .promo-code-btn', function (e) {
    e.preventDefault();
    $.spinner().start();
    $('.coupon-missing-error').hide();
    $('.coupon-error-message').empty();
    if (!$('.coupon-code-field').val()) {
      $('.promo-code-form .form-control').addClass('is-invalid');
      $('.promo-code-form .form-control').attr(
        'aria-describedby',
        'missingCouponCode'
      );
      $('.coupon-missing-error').show();
      $.spinner().stop();
      return false;
    }
    var $form = $('.promo-code-form');
    $('.promo-code-form .form-control').removeClass('is-invalid');
    $('.coupon-error-message').empty();

    $.ajax({
      url: $(this).data('action'),
      type: 'GET',
      dataType: 'json',
      data: $form.serialize(),
      success: function (data) {
        if (data.error) {
          $('.promo-code-form .form-control').addClass('is-invalid');
          $('.promo-code-form .form-control').attr(
            'aria-describedby',
            'invalidCouponCode'
          );
          $('.coupon-error-message').empty().append(data.errorMessage);
          $('body').trigger('promotion:error', data);
        } else {
          $('.coupons-and-promos').empty().append(data.totals.discountsHtml);
          updateCartTotals(data);
          updateApproachingDiscounts(data.approachingDiscounts);
          validateBasket(data);
          $('body').trigger('promotion:success', data);
        }
        if(data.renderedCart){
          $('.shopping_shortlist_sec').replaceWith(data.renderedCart);
        }
        $('.coupon-code-field').val('');
        $.spinner().stop();
      },
      error: function (err) {
        $('body').trigger('promotion:error', err);
        if (err.responseJSON.redirectUrl) {
          window.location.href = err.responseJSON.redirectUrl;
        } else {
          createErrorNotification(err.errorMessage);
          $.spinner().stop();
        }
      },
    });
    return false;
  });

  $('body').on('click', '.remove-coupon', function (e) {
    e.preventDefault();

    var couponCode = $(this).data('code');
    var uuid = $(this).data('uuid');
    var $deleteConfirmBtn = $('.delete-coupon-confirmation-btns');
    var $productToRemoveSpan = $('.coupon-to-remove');

    $deleteConfirmBtn.data('uuid', uuid);
    $deleteConfirmBtn.data('code', couponCode);

    $productToRemoveSpan.empty().append(couponCode);
  });

  $('body').on('click', '.delete-coupon-confirmation-btns', function (e) {
    e.preventDefault();

    var url = $(this).data('action');
    var uuid = $(this).data('uuid');
    var couponCode = $(this).data('code');
    var urlParams = {
      code: couponCode,
      uuid: uuid,
      sendRenderedCart: true
    };

    url = appendToUrl(url, urlParams);

    $('body > .modal-backdrop').remove();

    $.spinner().start();
    $.ajax({
      url: url,
      type: 'get',
      dataType: 'json',
      success: function (data) {
        $('.coupon-uuid-' + uuid).remove();
        updateCartTotals(data);
        updateApproachingDiscounts(data.approachingDiscounts);
        validateBasket(data);
        $.spinner().stop();
        $('body').trigger('promotion:success', data);
        if(data){
          $('.shopping_shortlist_sec').replaceWith(data.renderedCart);
        }
      },
      error: function (err) {
        $('body').trigger('promotion:error', err);
        if (err.responseJSON.redirectUrl) {
          window.location.href = err.responseJSON.redirectUrl;
        } else {
          createErrorNotification(err.responseJSON.errorMessage);
          $.spinner().stop();
        }
      },
    });
  });

  base.selectAttribute();
  base.colorAttribute();
  base.removeBonusProduct();
  base.selectBonusProduct();
  base.enableBonusProductSelection();
  base.showMoreBonusProducts();
  base.addBonusProductsToCart();
  base.buyNow();
};
