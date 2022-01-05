'use strict';

function getModalHtmlElement(orderId, endpoint) {
    if ($('#account-order-cancelletion').length !== 0) {
        $('#account-order-cancelletion').remove();
    }
    var htmlString = '<!-- Modal -->'
        + '<div class="modal"  tabindex="-1"  id="account-order-cancelletion" role="dialog" style="z-index: 100001 !important;">'
        + '<div class="modal-dialog" role="document">'
        + '<!-- Modal content-->'
        + '<div class="modal-content">'
        + '<div class="modal-header" style="color: white;background-color: #1B3582;font-family: "Roboto", sans-serif;">'
        + '   <h5 class="modal-title">' + window.Resources.LABEL_ORDER_CANCLE_CONFIEM +'</h5>'
        + '    <button type="button" class="close pull-right account-cancelltion-close" data-dismiss="modal" style="color: white;opacity: 1;">'
        + '        &times;'
        + '    </button>'
        + '</div>'
        + '<div class="modal-body">'
        +   '<p>' + window.Resources.LABEL_ORDER_CANCELLTION_MSG +'</p>'
        + '</div>'
        + '<div class="modal-footer">'
        +' <button type="button" class="btn btn-secondary account-cancelltion-close primary-btn" data-dismiss="modal">Close</button>'
        +' <button type="button" class="btn btn-block btn-primary account-confirm-cancelltion blue-btn" data-order-id="' + orderId +'" data-action="' + endpoint +'" >YES</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    $('body').append(htmlString);
}

$(document).ready(function () {

    $(document).on('click', '.account-cancelltion-close', function (e) {
        e.preventDefault();
        $('#account-order-cancelletion').remove();
        location.reload();
    });

    $(document).on('click', '.account-cancelled-order', function (e) {
        e.preventDefault();
        var actionURL =  $(this).attr('href');
        $.spinner().start();
        getModalHtmlElement($(this).data('order-id'), actionURL);
        $('#account-order-cancelletion').show();
        $.spinner().stop();
    });

    $(document).on('click', '.account-confirm-cancelltion', function (e) {
        e.preventDefault();
        var actionURL =  $(this).data('action');
        var from = {
            orderID : $(this).data('order-id')
        };

        $.spinner().start();
        $.ajax({
            url: actionURL,
            type: 'post',
            dataType: 'json',
            data: from,
            success: function (data) {
                $.spinner().stop();
                if (data.error) {
                    $('#account-order-cancelletion .modal-body').empty();
                    $('#account-order-cancelletion .modal-body').append(data.message);
                    $('#account-order-cancelletion .modal-footer').empty();
                } else {
                    $('#account-order-cancelletion .modal-header .modal-title').empty();
                    $('#account-order-cancelletion .modal-body').empty();
                    $('#account-order-cancelletion .modal-body').append(data.message);
                    $('#account-order-cancelletion .modal-footer').empty();
                }
            },
            error: function (err) {
                $.spinner().stop();
            }
        });
    });

    $(document).on('click', '.account-get-invoice', function (e) {
        e.preventDefault();
        var actionURL =  $(this).attr('href');
        var form = {
            orderID : $(this).data('order-id')
        };
        var responseContainer = '.invoice-response-' + $(this).data('order-id');
        $(responseContainer).empty();
        $.spinner().start();
        $.ajax({
            url: actionURL,
            type: 'post',
            dataType: 'json',
            data: form,
            success: function (data) {
                $.spinner().stop();
                if (data.error) {
                    $(responseContainer).empty();
                    $(responseContainer).append(data.message);
                } else {
                    $(responseContainer).empty();
                    $(responseContainer).append(data.message);
                    window.location.href = data.response.documentUrl;
                }
            },
            error: function (err) {
                $.spinner().stop();
            }
        });
    });

    $(document).on('submit', '.return-form', function (e) {
        e.preventDefault();
        var actionURL =  $(this).attr('action');
        var data = $(this).serialize();
        var responseContainer = '.response-return';
        $(responseContainer).empty();
        $.spinner().start();
        $.ajax({
            url: actionURL,
            type: 'post',
            dataType: 'json',
            data: data,
            success: function (data) {
                $.spinner().stop();
                if (data.error) {
                    $(responseContainer).empty();
                    $(responseContainer).append(data.message);
                } else {
                    $(responseContainer).empty();
                    $(responseContainer).append(data.message);
                    location.reload();
                }
            },
            error: function (err) {
                $.spinner().stop();
            }
        });
    });
});

