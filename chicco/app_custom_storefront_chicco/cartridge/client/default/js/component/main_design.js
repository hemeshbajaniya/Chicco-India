'use strict';

/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
/**
 * Retrieves url to use when adding a product to the cart
 *
 * @return {string} - The provided URL to use when adding a product to the cart
 */

$(document).on('click', 'div.mobile-menu-open', function () {
    jQuery('.sidenav').css("left", "0");
});

$(document).on('click', 'a.closebtn', function () {
    jQuery('.sidenav').css("left", "-100%");
});

$(document).on('click', 'div.filter_icon', function () {
    jQuery('.mobile-filter').css("left", "0");
});

$(document).on('click', 'div.close_icon', function () {
    jQuery('.mobile-filter').css("left", "-100%");
});

footer_collapse();
jQuery(window).resize(function () {
    footer_collapse();
});

jQuery('.ch_username').click(function () {
    jQuery('.user_drop').slideToggle(200);
});

// Close Top-bar
jQuery('.close_data').click(function () {
    jQuery('.top-bar').slideToggle('slow');
});



// Footer Menu Collapse
function footer_collapse() {
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
}

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
        dots: true,
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
    jQuery('.thumbnails-slider').on('init', function (e, slider) {
        jQuery(slider.$slides.find('.thumbnail-button')).each(function (index) {
            jQuery(this).on('click', function () {
                // Move aria-current="true" to this button
                jQuery(slider.$slides.find('.thumbnail-button').removeAttr('aria-current'));
                jQuery(this).attr('aria-current', true);

                // Change the main image to match this thumbnail button
                var index = jQuery(this).closest('.slick-slide').data('slick-index');
                jQuery('.main-image-slider').slick('slickGoTo', index);
            });
        });
    });

    // Initialize the slider
    jQuery('.thumbnails-slider').slick({
        vertical: true,
        slidesToShow: 4,
        infinite: false,
        dots: false,
        arrows: true,
        prevArrow: "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-up' aria-hidden='true'></i></button>",
        nextArrow: "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-down' aria-hidden='true'></i></button>",
        regionLabel: 'thumbnails carousel',
        responsive: [
            {
                breakpoint: 767,
                settings: {
                    vertical: false,
                    slidesToShow: 4,
                }
            }
        ],
    });


    /* Main image slider */
    jQuery('.main-image-slider').slick({
        slidesToShow: 1,
        draggable: false,
        dots: false,
        arrows: false,
        regionLabel: 'main image carousel',
    });

    // Update the thumbnail slider when the user changes the main slider directly.
    jQuery('.main-image-slider').on('beforeChange', function (e, slider, currentSlide, nextSlide) {
        // Remove aria-current from the last selected thumbnail image button
        jQuery('.thumbnails-slider .thumbnail-button[aria-current="true"]').removeAttr('aria-current');

        // Select the thumbnail image button that goes with this main image. Most importantly, this updates Slick's internal state to be consistent with the visual change.
        jQuery('.thumbnails-slider').slick('slickGoTo', nextSlide);

        // Add aria-current="true" to the correct thumbnail image button to convey to screen readers that it's active.
        jQuery('.thumbnails-slider .thumbnail-button:eq(' + nextSlide + ')').attr('aria-current', true);
    });


    // Button Thumbnail : Add Clss on click 
    jQuery('.product_details .product_imgs .thumbnail-button').click(function (e) {
        e.preventDefault(); // Modified: stop link # from loading (Why using link then?)
        jQuery('.product_details .product_imgs .thumbnail-button').removeClass('current');
        jQuery(this).addClass('current');
    });




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

    // Mobile Menu
    var windowSize = $(window).width();
    if (windowSize < 1200) {
        $('.parent-menu').on('click', function () {
            $(this).find('.sub-menu').slideToggle('slow');
        });
    }
    jQuery(window).resize(function () {
        var windowSize_resize = $(window).width();
        if (windowSize_resize < 1200) {
            $('.parent-menu').on('click', function () {
                $(this).find('.sub-menu').slideToggle('slow');
            });
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


    // Add class when card is selected (Payment Page)
    jQuery('.payment_details .payment_radio label.main_lable').click(function () {
        jQuery('.payment_details .payment_radio').removeClass('active');
        jQuery(this).parent().addClass('active');
        // jQuery( this ).next().slideToggle( 'slow' );
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


    // Open SubCategory
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