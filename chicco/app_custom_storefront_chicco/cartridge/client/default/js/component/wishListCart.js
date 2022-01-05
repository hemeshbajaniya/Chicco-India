'use strict';

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

/**
 * appends params to a url
 * @param {string} url - Original url
 * @param {Object} params - Parameters to append
 * @returns {string} result url with appended parameters
 */
 function appendToUrl(url, params) {
  var newUrl = url;
  newUrl += (newUrl.indexOf('?') !== -1 ? '&' : '?') + Object.keys(params).map(function (key) {
      return key + '=' + encodeURIComponent(params[key]);
  }).join('&');

  return newUrl;
}

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} icon - icon that was clicked to add a product to the wishlist
 */
function displayMessageAndChangeIcon(data, icon) {
  $.spinner().stop();
  var status;
  if (data.success) {
    status = 'alert-success';
    if (icon.hasClass('fa-heart-o')) {
      icon.removeClass('fa-heart-o').addClass('fa-heart');
    }
  } else {
    status = "alert-danger";
  }

  if ($('.add-to-wishlist-messages').length === 0) {
    $('body').append('<div class="add-to-wishlist-messages "></div>');
  }
  $(".add-to-wishlist-messages").append(
    '<div class="add-to-wishlist-alert text-center ' +
      status +
      '">' +
      data.msg +
      '</div>'
  );

  setTimeout(function () {
    $('.add-to-wishlist-messages').remove();
  }, 5000);

  var $targetElement = $('a[data-pid="' + data.pid + '"]').closest('.product_details').find('.remove-product');
  var itemToMove = {
      actionUrl: $targetElement.data('action'),
      productID: $targetElement.data('pid'),
      productName: $targetElement.data('name'),
      uuid: $targetElement.data('uuid')
  };
  $('body').trigger('afterRemoveFromCart', itemToMove);
  setTimeout(function () {
    $('#removeProductModal').modal();
}, 2000);
}

module.exports = {
  
  addToWishlist: function () {
    $('body').on('click', '.wishlistTile', function (e) {
      e.preventDefault();
      var icon = $(this).find($('i'));
      var url = $(this).attr('href');
      var pid = $('.cart-wishlist').data('pid');
      var optionId = $(this)
        .closest('.product-detail')
        .find('.product-option')
        .attr('data-option-id');
      var optionVal = $(this)
        .closest('.product-detail')
        .find('.options-select option:selected')
        .attr('data-value-id');
      optionId = optionId || null;
      optionVal = optionVal || null;
      if (!url || !pid) {
        return;
      }

      var actionUrl = $(this).data('action');
      var productID = $(this).data('pid');
      var productName = $(this).data('name');
      var uuid = $(this).data('uuid');

      $.spinner().start();
      $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: {
          pid: pid,
          optionId: optionId,
          optionVal: optionVal,
        },
        success: function (data) {
          displayMessageAndChangeIcon(data, icon);
          confirmDelete(actionUrl, productID, productName, uuid);
        },
        error: function (err) {
          displayMessageAndChangeIcon(err, icon);
        },
      });
    });
  },
};

