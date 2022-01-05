$(document).ready(function () {

    $('.btn-apply-gift-card').click(function (e) {
        e.preventDefault();
        var giftCard = $('#gift-certificate-input-number');
        var giftCardAmount = $('#gift-certificate-input-amount');
        var giftCardReponse = $('.response-msg');
        giftCardReponse.addClass('d-none');
        giftCardReponse.removeClass('alert-success');
        giftCardReponse.html('');
        var url = $(this).data('action');

        giftCard.removeClass('is-invalid');
        giftCardAmount.removeClass('is-invalid');
        if (!giftCard.val()) {
            giftCard.addClass('is-invalid');
            return;
        }

        if (!giftCardAmount.val()) {
            giftCardAmount.addClass('is-invalid');
            return;
        }

        $.spinner().start();
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: { giftCardNo: giftCard.val(), giftCardAmount: giftCardAmount.val() },
            success: function (response) {
                if (response.error) {
                    giftCardReponse.removeClass('d-none');
                    giftCardReponse.html(response.message);
                } else {
                    giftCardReponse.removeClass('d-none alert-danger');
                    giftCardReponse.addClass('alert-success');
                    giftCardReponse.html(response.message);
                    $('body').trigger('checkout:updateCheckoutView',
                    { order: response.order, customer: response.customer });
                }
                $('#gift-certificate-input').val('');
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });
    });

    $('body').on('submit', '#add-gv-form', function (e) {
        e.preventDefault();
        $.spinner().start();

       var url = $(this).attr('action');
       var method = $(this).attr('method');
       var data = $(this).serialize();
       var responseCont = $('.gc-response');

       $.ajax({
        url: url,
        type: method,
        dataType: 'json',
        data: data,
        success: function (response) {
            if (response.error) {
                responseCont.removeClass('d-none');
                responseCont.html(response.message);
            } else {
                location.reload();
            }
            $.spinner().stop();
        },
        error: function () {
            location.reload();
            $.spinner().stop();
        }
    });



    });

    $('body').on('click', '.gift-vc-remove', function (e) {
        e.preventDefault();
        $.spinner().start();
       var url = $(this).attr('href');
       var gvNumber = $(this).data('gv-number');

       $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: { gvNumber: gvNumber},
        success: function (response) {
            location.reload();
            $.spinner().stop();
        },
        error: function () {
            location.reload();
            $.spinner().stop();
        }
        });
    });

    $('.saved-gv-select').on('change', function() {
        var value = $(this).val();
        $('#gift-certificate-input-number').val(value);
     });

     $('.js-gv-sent-amount').on('click', function() {
        $('.js-gv-sent-amount').removeClass('active');
        $(this).addClass('active');
     });

     // submited GV

     $('body').on('submit', '#send-gv-form', function (e) {
        e.preventDefault();
        $.spinner().start();
        var responseCont = $('.sent-gv-response');

        responseCont.addClass('d-none');
       var url = $(this).attr('action');
       var method = $(this).attr('method');
       var data = {
           recipientEmail: $('#recipient-email').val(),
           recipientConfirm: $('#recipient-email-confirm').val(),
           pid: $('.js-gv-sent-amount.active').data('pid'),
           to: $('#gv-sent-to').val(),
           from: $('#gv-sent-from').val(),
           msg: $('#gv-msg').val() ,
       }
       $.ajax({
        url: url,
        type: method,
        dataType: 'json',
        data: data,
        success: function (response) {
            if (response.error) {
                responseCont.removeClass('d-none');
                responseCont.html(response.message);
            } else {
                window.location.href = response.redirectURL;
            }
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
         });

    });

});
