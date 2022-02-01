'use strict';

/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
function handlePostCartAdd(response) {
  $('.minicart').trigger('count:update', response);
  var messageType = response.error ? 'alert-danger' : 'alert-success';
  // show add to cart toast
  if (
    response.newBonusDiscountLineItem &&
    Object.keys(response.newBonusDiscountLineItem).length !== 0
  ) {
    chooseBonusProducts(response.newBonusDiscountLineItem);
  } else {
    if ($('.add-to-cart-messages').length === 0) {
      $('body').append('<div class="add-to-cart-messages"></div>');
    }

    $(".add-to-cart-messages").append(
      '<div class="alert ' +
        messageType +
        ' add-to-basket-alert text-center" role="alert">' +
        response.message +
        "</div>"
    );

    setTimeout(function () {
      $(".add-to-basket-alert").remove();
    }, 5000);
  }
}

/**
 * Retrieves url to use when adding a product to the cart
 *
 * @return {string} - The provided URL to use when adding a product to the cart
 */
function getAddToCartUrl() {
  return $('.add-to-cart-url').val();
}

$(document).on(
  'click',
  'button.add-to-cart-plp, .add-to-cart-plp',
  function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var addToCartUrl;
    var pid;
    $.spinner().start();
    $('body').trigger('product:beforeAddToCart', this);
    pid = $(this).data('pid');
    addToCartUrl = getAddToCartUrl();
    var $quantity = $(this).data('quantity');
    if ($quantity == undefined) {
        $quantity = $('.pdp-quantity').val();
    }
    var $qtySelector = ''
    var form = {
      pid: pid,
      pidsObj: '',
      childProducts: '',
      quantity: $quantity,
    };

    $(this).trigger('updateAddToCartFormData', form);
    if (addToCartUrl) {
      $.ajax({
        url: addToCartUrl,
        method: 'POST',
        data: form,
        success: function (data) {
          try {
            if(data.products){
              window.dataLayer =  window.dataLayer  ||  [];
              window.dataLayer.push={
                  "event": "addToCart",
                  "ecommerce": {
                      "currencyCode": data.products[0].currencyCode,
                      'add': {
                          'products': data.products
                      }
                  }
              };
              fbq('track', 'AddToCart', {
                content_name: data.products[0].name,
                content_category: data.products[0].category,
                content_ids: [data.products[0].id],
                content_type: data.products[0].type,
                value: data.products[0].price,
                currency: data.products[0].currencyCode,
              });  
            }
          } catch (error) {
              
          }
          $('.minicart-quantity').empty().text(data.quantityTotal);
          handlePostCartAdd(data);
          $('body').trigger('product:afterAddToCart', data);
          $.spinner().stop();
        },
        error: function () {
          $.spinner().stop();
        },
      });
    }
  }
);


