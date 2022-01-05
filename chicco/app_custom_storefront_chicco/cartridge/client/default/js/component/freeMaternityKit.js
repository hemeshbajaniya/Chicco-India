'use strict';

/**
 * Generates the modal window on the first call.
 *
 */
function getModalHtmlElement() {
    if ($('#freeMaternityKit').length !== 0) {
        $('#freeMaternityKit').remove();
    }
    var htmlString = '<!-- Modal -->'
        + '<div class="modal"  tabindex="-1"  id="freeMaternityKit" role="dialog">'
        + '<div class="modal-dialog" role="document">'
        + '<!-- Modal content-->'
        + '<div class="modal-content">'
        + '<div class="modal-header">'
        + '   <h5 class="modal-title">' + window.Resources.FREE_MATERNITYKIT +'</h5>'
        + '    <button type="button" class="close pull-right" data-dismiss="modal">'
        + '        &times;'
        + '    </button>'
        + '</div>'
        + '<div class="modal-body"></div>'
        + '<div class="modal-footer">'
        +' <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    $('body').append(htmlString);
}

$(document).ready(function () {
    $('body').on('click', '.free-kit-authenticate', function (e) {
        e.preventDefault();
        getModalHtmlElement();
        $('#freeMaternityKit .modal-body').empty();
        $('#freeMaternityKit .modal-body').html('<h5 class="text-center">'+ window.Resources.FREE_MATERNITYKIT_LOGIN +' <a class="btn btn-primary" href="' + window.Resources.LOGIN_URL +'">Here</a></h3>');
        $('#freeMaternityKit').modal('show');

    });

    $('body').on('click', '.free-kit-not-eligible', function (e) {
        e.preventDefault();
        getModalHtmlElement();
        $('#freeMaternityKit .modal-body').empty();
        $('#freeMaternityKit .modal-body').html('<h5 class="text-center">'+ window.Resources.FREE_MATERNITYKIT_NOT_ELIGIBLE +'</h3>');
        $('#freeMaternityKit').modal('show');
    });
});

