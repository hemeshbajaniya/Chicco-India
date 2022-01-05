try {
    // Mobile Menu
    var windowSize = $(window).width();
    if (windowSize < 1200) {
      $('#mySidenav .parent-menu').on('click', function () {
        console.log("slide");
        $(this).find('.sub-menu').slideToggle('slow');
      });
    }
    jQuery(window).resize(function () {
      var windowSize_resize = $(window).width();
      if (windowSize_resize < 1200) {
        $('#mySidenav .parent-menu').on('click', function () {
          $(this).find('.sub-menu').slideToggle('slow');
        });
      }
    });
jQuery(document).ready(function (jQuery) {

  // Added sticky-header class on header
  jQuery(window).scroll(function () {
    if (jQuery(this).scrollTop() > 10) {
      jQuery('.site-header').addClass('sticky-header');
    } else {
      jQuery('.site-header').removeClass('sticky-header');
    }
  });

  // Added sticky-filter_sort class on header
  jQuery(window).scroll(function () {
    if (jQuery(this).scrollTop() > 10) {
      jQuery('.product_listing_sec .fixed_filter_sort').addClass('sticky_fixed_filter_sort');
    } else {
      jQuery('.product_listing_sec .fixed_filter_sort').removeClass('sticky_fixed_filter_sort');
    }
  });

  /* Banner Slider */
  jQuery('.banner_slider .owl-carousel').owlCarousel({
    margin: 30,
    loop: true,
    autoplay: 2000,
    nav: true,
    navText: ["<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>"],
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      768: {
        items: 1,
      },
      1000: {
        items: 1,
      },
      1501: {
        items: 1
      }
    }
  });


  /* Product Slider */
  jQuery('.products_slider .owl-carousel').owlCarousel({
    loop: true,
    margin: 30,
    autoplay: true,
    nav: true,
    navText: ["<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>"],
    dots: false,
    responsive: {
      0: {
        items: 1,
      },
      767: {
        items: 2,
      },
      992: {
        items: 3,
      },
      1200: {
        items: 4,
      },
    }
  });

  /* Promotion Slider */
  jQuery('.promotion_slider .owl-carousel').owlCarousel({
    loop: true,
    margin: 30,
    autoplay: true,
    nav: true,
    navText: ["<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>"],
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      767: {
        items: 2,
      },
      992: {
        items: 2,
      },
      1200: {
        items: 3,
      },
    }
  });


  /* Child Age Slider */
  // jQuery('.child_age_slider').slick({
  //   slidesToShow    : 1,
  //   slidesToScroll  : 1,
  //   autoplay        : true,
  //   autoplaySpeed   : 7000,
  //   dots            : true,
  //   arrows          : false,
  // });
  jQuery('.child_age_slider .owl-carousel').owlCarousel({
    loop: true,
    margin: 30,
    autoplay: 500,
    nav: true,
    navText: ["<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>"],
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      768: {
        items: 1,
      },
      1000: {
        items: 1,
      },
      1501: {
        items: 1
      }
    }
  });



  // Static Info Slider
  jQuery('.info_slider .owl-carousel').owlCarousel({
    loop: true,
    margin: 30,
    autoplay: 500,
    nav: true,
    navText: ["<i class='fa fa-angle-left' aria-hidden='true'></i>", "<i class='fa fa-angle-right' aria-hidden='true'></i>"],
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 1,
      },
      992: {
        items: 1,
      },
      1200: {
        items: 1,
      }
    }
  });



  /* Product Details Images */
  /* Thumbnails slider */
  // Change the main image whenever a thumbnail button is activated


  


  /* Match Height */
  jQuery('.solution-boxes .box h4').matchHeight({
    byRow: true
  });
  jQuery('.delivery_details .order_boxes .box').matchHeight({
    byRow: true
  });
  jQuery('.advice_section .prmotion_box').matchHeight({
    byRow: true
  });
  jQuery('.advice_section .prmotion_box .content').matchHeight({
    byRow: true
  });
  jQuery('.shopping_shortlist_sec .address_boxes').matchHeight({
    byRow: true
  });

  /* Counter */
  jQuery('.counter').counterUp({
    delay: 10,
    time: 2000
  });



  // Action when click on a Heart icon (color)
  jQuery('.product_box .heart_icon').click(function (e) {
    e.preventDefault(); // Modified: stop link # from loading (Why using link then?)
    jQuery(this).toggleClass('selected'); // Toggle the colored class !
  });



  // Close Top-bar
  jQuery('.top-bar .close_data').click(function () {
    jQuery('.top-bar').slideToggle('slow');
  });



  // Footer Menu Collapse
  if (jQuery(window).width() > 767) {
    jQuery('#about').addClass('show');
    jQuery('#support').addClass('show');
    jQuery('#services').addClass('show');
    jQuery('#products').addClass('show');
    jQuery('#call_us').addClass('show');

    jQuery('.titles').removeAttr('data-toggle');
  }
  else {
    jQuery('#about').removeClass('show');
    jQuery('#support').removeClass('show');
    jQuery('#services').removeClass('show');
    jQuery('#products').removeClass('show');
    jQuery('#call_us').removeClass('show');
  }
  jQuery(window).resize(function () {
    if (jQuery(window).width() > 767) {
      jQuery('#about').addClass('show');
      jQuery('#support').addClass('show');
      jQuery('#services').addClass('show');
      jQuery('#products').addClass('show');
      jQuery('#call_us').addClass('show');

      jQuery('.titles').removeAttr('data-toggle');
    }
    else {
      jQuery('#about').removeClass('show');
      jQuery('#support').removeClass('show');
      jQuery('#services').removeClass('show');
      jQuery('#products').removeClass('show');
      jQuery('#call_us').removeClass('show');
    }
  });




  // Quantity plus Minus
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


  // Open Add New Address form (When click on Add New Address Button on shipping page)
  jQuery('.add_new_address_btn').click(function () {
    jQuery('.add_address_form').slideToggle('slow');
  });


  // Click on Username open dropdown in header
  jQuery('.site-header .ch_username').click(function () {
    jQuery('.user_drop').slideToggle(200);
  });


  // mobile menu open close
  jQuery('.site-header .mobile-menu-open').click(function () {
    jQuery('#mySidenav').css({
      'left': '0'
    });
  });
  jQuery('#mySidenav .closebtn').click(function () {
    jQuery('#mySidenav').css({
      'left': '-100%'
    });
  });


  // Filter option in Mobile Open and close
  jQuery('.product_listing_sec .fixed_filter_sort .filter_icon').click(function () {
    jQuery('#mobile_filter').css({
      'left': '0'
    });
  });
  jQuery('#mobile_filter .close_icon ').click(function () {
    jQuery('#mobile_filter').css({
      'left': '-100%'
    });
  });

  $(document).on('click', '#Age_Range', function () {
    var isChecked = $('#Age_Range').is(':checked')
    if (isChecked) {
      jQuery('#filter_subcat').css({ 'display': "block" })
    } else {
      jQuery('#filter_subcat').css({ 'display': "none" })
    }
  });
  $(document).on('click', '#Plates_Cutlery', function () {
    var isChecked = $('#Plates_Cutlery').is(':checked')
    if (isChecked) {
      jQuery('#subcategories').css({ 'display': "block" })
    } else {
      jQuery('#subcategories').css({ 'display': "none" })
    }
  });
  $(document).on('click', '#shop_by_price', function () {
    var isChecked = $('#shop_by_price').is(':checked')
    if (isChecked) {
      jQuery('#price_range').css({ 'display': "block" })
    } else {
      jQuery('#price_range').css({ 'display': "none" })
    }
  });
  $(document).on('click', '#Offers', function () {
    var isChecked = $('#Offers').is(':checked')
    if (isChecked) {
      jQuery('#offers_subcat').css({ 'display': "block" })
    } else {
      jQuery('#offers_subcat').css({ 'display': "none" })
    }
  });
  $(document).on('click', '#ShopBySize', function () {
    var isChecked = $('#ShopBySize').is(':checked')
    if (isChecked) {
      jQuery('#size_subcat').css({ 'display': "block" })
    } else {
      jQuery('#size_subcat').css({ 'display': "none" })
    }
  });
  $(document).on('click', '#Color', function () {
    var isChecked = $('#Color').is(':checked')
    if (isChecked) {
      jQuery('#colors_subcat').css({ 'display': "block" })
    } else {
      jQuery('#colors_subcat').css({ 'display': "none" })
    }
  });

});

  $( '.payment_details .payment_radio label.gift_card' ).on('click', function() {
    if($( '.payment_details .gift-card-summary .payment_radio' ).hasClass( 'active' )){
      console.log("remove frmo gift")
      $( '.payment_details .gift-card-summary .payment_radio' ).removeClass( 'active' );
    }else{
      console.log("add")
      $( '.payment_details .gift-card-summary .payment_radio' ).addClass( 'active' );
    }
  });

  $( '.payment_details .payment_radio label.loyalty_card' ).on('click', function() {
    if($( '.payment_details .loyalty-point-card-summary .payment_radio' ).hasClass( 'active' )){
      console.log("renove")
      $( '.payment_details .loyalty-point-card-summary .payment_radio' ).removeClass( 'active' );
    }else{
      console.log("add")
      $( '.payment_details .loyalty-point-card-summary .payment_radio' ).addClass( 'active' );
    }
  });

  $('.product_filter_listing .filter_icon').on('click', function () {
    $('#mobile_filter').css({
      'left': '0'
    });
  });
  $('#mobile_filter .close_icon ').on('click', function () {
    $('#mobile_filter').css({
      'left': '-100%'
    });
  });
  $('.search-bar').on('click', function(){
    $('#search_popup').slideToggle('slow')
  })
} catch (error) {
  console.log(error)
}
