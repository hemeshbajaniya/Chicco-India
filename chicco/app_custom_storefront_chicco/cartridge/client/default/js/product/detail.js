'use strict';
var base = require('./base');

module.exports = {
  availability: base.availability,

  addToCart: base.addToCart,

  updateAttributesAndDetails: function () {
    $('body').on('product:statusUpdate', function (e, data) {
      var $productContainer = $('.product-detail[data-pid="' + data.id + '"]');

      $productContainer
        .find('.description-and-detail .product-attributes')
        .empty()
        .html(data.attributesHtml);

      if (data.shortDescription) {
        $productContainer
          .find('.description-and-detail .description')
          .removeClass('hidden-xl-down');
        $productContainer
          .find('.description-and-detail .description .content')
          .empty()
          .html(data.shortDescription);
      } else {
        $productContainer
          .find('.description-and-detail .description')
          .addClass('hidden-xl-down');
      }

      if (data.longDescription) {
        $productContainer
          .find('.description-and-detail .details')
          .removeClass('hidden-xl-down');
        $productContainer
          .find('.description-and-detail .details .content')
          .empty()
          .html(data.longDescription);
      } else {
        $productContainer
          .find('.description-and-detail .details')
          .addClass('hidden-xl-down');
      }
    });
  },

  showSpinner: function () {
    $('body').on(
      'product:beforeAddToCart product:beforeAttributeSelect',
      function () {
        $.spinner().start();
      }
    );
  },
  updateAttribute: function () {
    $('body').on('product:afterAttributeSelect', function (e, response) {
      if ($('.product-detail>.bundle-items').length) {
        response.container.data('pid', response.data.product.id);
        response.container.find('.product-id').text(response.data.product.id);
      } else if ($('.product-set-detail').eq(0)) {
        response.container.data('pid', response.data.product.id);
        response.container.find('.product-id').text(response.data.product.id);
      } else {
        $('.product-id').text(response.data.product.id);
        $('.product-detail:not(".bundle-item")').data(
          'pid',
          response.data.product.id
        );
      }
    });
  },
  updateAddToCart: function () {
    $('body').on('product:updateAddToCart', function (e, response) {
      // update local add to cart (for sets)
      $('button.add-to-cart-plp', response.$productContainer).attr(
        'disabled',
        !response.product.readyToOrder || !response.product.available
      );

      var enable = $('.product-availability')
        .toArray()
        .every(function (item) {
          return $(item).data('available') && $(item).data('ready-to-order');
        });
      $('button.add-to-cart-global').attr('disabled', !enable);
    });
  },
  updateAvailability: function () {
    $('body').on('product:updateAvailability', function (e, response) {
      $('div.availability', response.$productContainer)
        .data('ready-to-order', response.product.readyToOrder)
        .data('available', response.product.available);

      $('.availability-msg', response.$productContainer)
        .empty()
        .html(response.message);

      if ($('.global-availability').length) {
        var allAvailable = $('.product-availability')
          .toArray()
          .every(function (item) {
            return $(item).data('available');
          });

        var allReady = $('.product-availability')
          .toArray()
          .every(function (item) {
            return $(item).data('ready-to-order');
          });

        $('.global-availability')
          .data('ready-to-order', allReady)
          .data('available', allAvailable);

        $('.global-availability .availability-msg')
          .empty()
          .html(
            allReady ? response.message : response.resources.info_selectforstock
          );
      }
    });
  },
  sizeChart: function () {
    $('.size-chart a').on('click', function (e) {
      e.preventDefault();
      var url = $(this).attr('href');
      var $prodSizeChart = $(this)
        .closest('.size-chart')
        .find('.size-chart-collapsible');
      if ($prodSizeChart.is(':empty')) {
        $.ajax({
          url: url,
          type: 'get',
          dataType: 'json',
          success: function (data) {
            $prodSizeChart.append(data.content);
          },
        });
      }
      $prodSizeChart.toggleClass('active');
    });

    var $sizeChart = $('.size-chart-collapsible');
    $('body').on('click touchstart', function (e) {
      if ($('.size-chart').has(e.target).length <= 0) {
        $sizeChart.removeClass('active');
      }
    });
  },
  copyProductLink: function () {
    $('body').on('click', '#fa-link', function () {
      event.preventDefault();
      var $temp = $('<input>');
      $('body').append($temp);
      $temp.val($('#shareUrl').val()).select();
      document.execCommand('copy');
      $temp.remove();
      $('.copy-link-message').attr('role', 'alert');
      $('.copy-link-message').removeClass('d-none');
      setTimeout(function () {
        $('.copy-link-message').addClass('d-none');
      }, 3000);
    });
  },

  productSlider: function () {
    $('.thumbnails-slider').on('init', function (e, slider) {
      $(slider.$slides.find('.thumbnail-button')).each(function (index) {
        $(this).on('click', function () {
          // Move aria-current='true' to this button
          $(
            slider.$slides.find('.thumbnail-button').removeAttr('aria-current')
          );
          $(this).attr('aria-current', true);

          // Change the main image to match this thumbnail button
          var index = $(this).closest('.slick-slide').data('slick-index');
          $('.main-image-slider').slick('slickGoTo', index);
        });
      });
    });

    // Initialize the slider
    $('.thumbnails-slider').slick({
      vertical: true,
      slidesToShow: 4,
      infinite: false,
      dots: false,
      arrows: true,
      prevArrow:
        "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-up' aria-hidden='true'></i></button>",
      nextArrow:
        "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-down' aria-hidden='true'></i></button>",
      regionLabel: 'thumbnails carousel',
      responsive: [
        {
          breakpoint: 767,
          settings: {
            vertical: false,
            slidesToShow: 4,
          },
        },
      ],
    });

    /* Main image slider */
    $('.main-image-slider').slick({
      slidesToShow: 1,
      draggable: false,
      dots: false,
      arrows: false,
      regionLabel: 'main image carousel',
    });

    // Update the thumbnail slider when the user changes the main slider directly.
    $('.main-image-slider').on(
      'beforeChange',
      function (e, slider, currentSlide, nextSlide) {
        // Remove aria-current from the last selected thumbnail image button
        $(
          '.thumbnails-slider .thumbnail-button[aria-current="true"]'
        ).removeAttr('aria-current');

        // Select the thumbnail image button that goes with this main image. Most importantly, this updates Slick's internal state to be consistent with the visual change.
        $('.thumbnails-slider').slick('slickGoTo', nextSlide);

        // Add aria-current='true' to the correct thumbnail image button to convey to screen readers that it's active.
        $('.thumbnails-slider .thumbnail-button:eq(' + nextSlide + ')').attr(
          'aria-current',
          true
        );
      }
    );

    // Button Thumbnail : Add Clss on click
    $('.product_details .product_imgs .thumbnail-button').click(function (e) {
      e.preventDefault(); // Modified: stop link # from loading (Why using link then?)
      $('.product_details .product_imgs .thumbnail-button').removeClass(
        'current'
      );
      $(this).addClass('current');
    });
  },

  productPoints: function () {
    var $price = $('.product-sales-price').data('price');
    var $divider = 100;
    var $points = $price / $divider;
    var $roundPrice = Math.round($points);
    $('.product-total-points').text($roundPrice);
  },
  quantitySelectors: function () {
    jQuery('#add').click(function () {
      if (jQuery(this).prev().val() < 100) {
        jQuery(this).prev().val(+jQuery(this).prev().val() + 1);
      }
    });
  
    jQuery('#sub').click(function () {
      if (jQuery(this).next().val() > 1) {
        if (jQuery(this).next().val() > 1) jQuery(this).next().val(+jQuery(this).next().val() - 1);
      }
    });
  },

  focusChooseBonusProductModal: base.focusChooseBonusProductModal(),
};

