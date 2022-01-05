$(document).ready(function () {

    $('.btn-loyalty-point-redeem').click(function (e) {
        e.preventDefault();
        var points = $('#loyalty-point-number');
        points.removeClass('is-invalid');

        var responseContainer = $('.loyalty-response-msg');
        responseContainer.removeClass('alert-success');
        responseContainer.addClass('alert-danger');
        responseContainer.addClass('d-none');

        var url = $(this).data('action');

        if (!points.val()) {
            points.addClass('is-invalid');
            return;
        }

        if (!($.isNumeric(points.val()))) {
            points.addClass('is-invalid');
            return;
        }

        $.spinner().start();
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: { points:  points.val()},
            success: function (response) {
                if (response.error) {
                    responseContainer.removeClass('d-none');
                    responseContainer.html(response.message);
                    if (response.availablePoints && response.pointValue) {
                        $('.loyalty-points-avalible').html(response.availablePoints);
                        $('.loyalty-points-worth').html(response.pointValue);
                    }
                } else {
                    responseContainer.removeClass('d-none alert-danger');
                    responseContainer.addClass('alert-success');
                    if (response.availablePoints && response.pointValue) {
                        $('.loyalty-points-avalible').html(response.availablePoints);
                        $('.loyalty-points-worth').html(response.pointValue);
                    }
                    responseContainer.html(response.message);
                    $('body').trigger('checkout:updateCheckoutView',
                    { order: response.order, customer: response.customer });
                }
                points.val('');
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });
    });

});
