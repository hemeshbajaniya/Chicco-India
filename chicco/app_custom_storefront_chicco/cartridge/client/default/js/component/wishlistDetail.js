'use strict';

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
        status = 'alert-danger';
    }

    if ($('.add-to-wishlist-messages').length === 0) {
        $('body').append(
            '<div class="add-to-wishlist-messages "></div>'
        );
    }
    $('.add-to-wishlist-messages')
        .append('<div class="add-to-wishlist-alert text-center ' + status + '">' + data.msg + '</div>');

    setTimeout(function () {
        $('.add-to-wishlist-messages').remove();
    }, 5000);
}

module.exports = {
    addToWishlist: function () {
        $('body').on('click', '.wishlistTile', function (e) {
            e.preventDefault();
            var icon = $(this).find($('i'));
            var url = $(this).attr('href');
            var pid = $('.Detailedproduct').data('pid');

            if (!url || !pid) {
                return;
            }

            $.spinner().start();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: {
                    pid: pid
                },
                success: function (data) {
                    displayMessageAndChangeIcon(data, icon);
                    icon.addClass('selected');
                    icon.parent('.pdp-wishlist').addClass('selected');
                },
                error: function (err) {
                    displayMessageAndChangeIcon(err, icon);
                }
            });
        });
    }
};
