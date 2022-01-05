'use strict';

function addBabyFormFields($selector) {
    var radioName = Math.floor(100000 + Math.random() * 900000).toFixed();
    var form = `
    <div class="baby-registry-groups w-100 register_product_form main_title">
        <div class="col-12 text-right">
            <a href="#" class="remove-baby-form">${window.Resources.LABEL_BABY_REGISTRY_FORM_REMOVE_BUTTON}</a>
        </div>
        <div class="col-md-12">
        <div class="form-group required">
            <label class="form-control-label" for="registration-form-phone">
                ${window.Resources.LABEL_BABY_REGISTRY_FORM_NAME}
            </label>
            <input
                type="text"
                class="form-control w-100 field"
                name="baby-name"
                id="baby-registration-form-name"
                data-missing-error="${window.Resources.LABEL_BABY_REGISTRY_FORM_NAME_MISSING}"
                aria-describedby="form-name-error"
                placeholder="${window.Resources.LABEL_BABY_REGISTRY_FORM_NAME_PLACEHOLDER}"
                required>
            <div class="invalid-feedback" id="form-baby-registration-error"></div>
        </div>
        </div>
        <div class="col-md-12">
        <div class="form-group required">
            <label class="form-control-label" for="registration-form-phone">
                ${window.Resources.LABEL_BABY_REGISTRY_FORM_AGE}
            </label>
            <input
                type="date"
                class="form-control w-100 field"
                id="baby-registration-form-age"
                data-missing-error="${window.Resources.LABEL_BABY_REGISTRY_FORM_AGE_PLACEHOLDER_MISSING}"
                aria-describedby="form-age-error"
                placeholder="${window.Resources.LABEL_BABY_REGISTRY_FORM_AGE_PLACEHOLDER}"
                required
                >
            <div class="invalid-feedback" id="form-baby-registration-age-error"></div>
        </div>
        </div>
        <div class="col-md-12">
        <div class="form-group required mb-0">
            <label class="form-control-label" for="registration-form-gender">
                ${window.Resources.LABEL_BABY_REGISTRY_FORM_GENDER}
            </label>
            <label class="radio-img">
                <input
                    type="radio"
                    class="form-check-input"
                    name="baby-registration-form-gender-${radioName}"
                    id="baby-registration-form-gender-male-${radioName}"
                    aria-describedby="form-gender-error"
                    value="Male" 
                     checked>
                <span>
                    ${window.Resources.LABEL_BABY_REGISTRY_FORM_MALE}
                </span> 
            </label>
            <label class="radio-img">
                <input
                    type="radio"
                    name="baby-registration-form-gender-${radioName}"
                    class="form-check-input"
                    id="baby-registration-form-gender-female-${radioName}"
                    aria-describedby="form-gender-error"
                    value="Female" >
                <span>
                    ${window.Resources.LABEL_BABY_REGISTRY_FORM_FEMALE}
                </span> 
            </label>
        </div>
        </div>
        <hr/>
    </div>
    `
    if ($selector) {
        $selector.append(form);
    }
    return;
}

function fillBabyRegistryForm(babyObject, index) {
    if (babyObject == null) {
        babyObject = {
            name: '',
            age: '',
            gender: ''
        }
    }
    var radioName = Math.floor(100000 + Math.random() * 900000).toFixed();
    var form = `
    <div class="baby-registry-groups w-100 register_product_form main_title">
        <div class="col-12 text-right ${index === 0 ? 'd-none': ''}">
            <a href="#" class="remove-baby-form">${window.Resources.LABEL_BABY_REGISTRY_FORM_REMOVE_BUTTON}</a>
        </div>
        <div class="col-md-12">
        <div class="form-group required">
            <label class="form-control-label" for="registration-form-phone">
                ${window.Resources.LABEL_BABY_REGISTRY_FORM_NAME}
            </label>
            <input
                type="text"
                class="form-control w-100 field"
                name="baby-name"
                value="${babyObject.name ? babyObject.name : ''}"
                id="baby-registration-form-name"
                data-missing-error="${window.Resources.LABEL_BABY_REGISTRY_FORM_NAME_MISSING}"
                aria-describedby="form-name-error"
                placeholder="${window.Resources.LABEL_BABY_REGISTRY_FORM_NAME_PLACEHOLDER}"
                required>
            <div class="invalid-feedback" id="form-baby-registration-error"></div>
        </div>
        </div>
        <div class="col-md-12">
        <div class="form-group required">
            <label class="form-control-label" for="registration-form-phone">
                ${window.Resources.LABEL_BABY_REGISTRY_FORM_AGE}
            </label>
            <input
                type="date"
                class="form-control w-100 field"
                id="baby-registration-form-age"
                value="${babyObject.age ? babyObject.age : ''}"
                data-missing-error="${window.Resources.LABEL_BABY_REGISTRY_FORM_AGE_PLACEHOLDER_MISSING}"
                aria-describedby="form-age-error"
                placeholder="${window.Resources.LABEL_BABY_REGISTRY_FORM_AGE_PLACEHOLDER}"
                required
                >
            <div class="invalid-feedback" id="form-baby-registration-age-error"></div>
        </div>
        </div>
        <div class="col-md-12">
        <div class="form-group required mb-0">
            <label class="form-control-label" for="registration-form-gender">
                ${window.Resources.LABEL_BABY_REGISTRY_FORM_GENDER}
            </label>
            <label class="radio-img">
                <input
                    type="radio"
                    class="form-check-input"
                    name="baby-registration-form-gender-${radioName}"
                    id="baby-registration-form-gender-male-${radioName}"
                    aria-describedby="form-gender-error"
                    value="Male" 
                    ${babyObject.gender == 'Male'? 'checked' : ''}>
                <span>
                    ${window.Resources.LABEL_BABY_REGISTRY_FORM_MALE}
                </span> 
            </label>
            <label class="radio-img">
                <input
                    type="radio"
                    name="baby-registration-form-gender-${radioName}"
                    class="form-check-input"
                    id="baby-registration-form-gender-female-${radioName}"
                    aria-describedby="form-gender-error"
                    value="Female" 
                    ${babyObject.gender == 'Female'? 'checked' : ''}
                    >
                <span>
                    ${window.Resources.LABEL_BABY_REGISTRY_FORM_FEMALE}
                </span> 
            </label>
        </div>
        </div>
        <hr/>
    </div>
    `;
    return form;
}

function setRegistryFieldValue(getValues) {
    var fieldsArray = [];
    $('.baby-registry-groups').each(function (item) {
        var name = $(this).children().find('input#baby-registration-form-name').val();
        var age =$(this).children().find('input#baby-registration-form-age').val();
        var gender = $(this).children().find('input.form-check-input:checked').val();
        if (name !== "" && age !=="" && gender !=="") {
           var form = {
               name: name,
               age: age,
               gender: gender
           };
           fieldsArray.push(form);
        }
    });

    if (getValues) {
        return JSON.stringify(fieldsArray);
    }

    if (fieldsArray.length > 0) {
        $('#baby-registery-json').val(JSON.stringify(fieldsArray));
    }
}

function getModalHtmlElement() {
    if ($('#baby-registry-account').length !== 0) {
        $('#baby-registry-account').remove();
    }
    var htmlString = '<!-- Modal -->'
        + '<div class="modal popup-modal gift_voucher_popup"  tabindex="-1"  id="baby-registry-account" style="z-index: 9999" role="dialog">'
        + '<div class="modal-dialog modal-dialog-centered modal-lg" role="document">'
        + '<!-- Modal content-->'
        + '<div class="modal-content">'
        + '    <button type="button" class="close_btn text-uppercase" data-dismiss="modal" aria-label="Close">'
        + '        <i class="fa fa-times" aria-hidden="true"></i>'
        + '    </button>'
        + '    <h3 class="modal-title text-center mt-5">' + window.Resources.LABEL_BABY_REGISTRY_FORM_TITLE +'</h3>'
        + '<div class="shopping_shortlist_sec delete_cart_item_popup">'
        +   '<div class="modal-body shipping_product">'
        +   '</div>'
        + '</div>'
        + '<div class="modal-footer">'
        +' <button type="button" class="blue-btn py-2 w-50 btn btn-block btn-primary update-baby-registry" data-dismiss="modal">Update</button>'
        +' <button type="button" class="primary-btn py-2 w-50 btn btn-secondary" data-dismiss="modal">Close</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    $('body').append(htmlString);
}

$(document).ready(function () {

    $(document).on('click', '.add-more-baby-registry', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        $.spinner().start();
        addBabyFormFields($('.baby-form-addtional'));
        $.spinner().stop();
        return;
    });
    
    $(document).on('click', 'a.remove-baby-form', function (e) {
        e.preventDefault();
        $(this).closest('.baby-registry-groups').remove();
    });

    $('.baby-registry-account-edit').on('click', function (e) {
        e.preventDefault();
        getModalHtmlElement();
        var babyObjects = $(this).data('baby-registry');
        $('#baby-registry-account .modal-body').empty();
        if (babyObjects) {
            babyObjects.forEach(function(babyObject, i) {
                $('#baby-registry-account .modal-body').append(fillBabyRegistryForm(babyObject, i));
            });
        } else {
            $('#baby-registry-account .modal-body').append(fillBabyRegistryForm({}, 0));
        }
        var addMorebutton = `
        <div class="baby-form-addtional w-100"></div>
        <div class="col-md-12">
            <div class="form-group">
                <a href="#" class="regiter_another_baby add-more-baby-registry">
                    ${window.Resources.LABEL_BABY_REGISTRY_FORM_ADD_MORE_BUTTON}
                </a>
            </div>
        </div>
        `;
        $('#baby-registry-account .modal-body').append(addMorebutton);
        $('#baby-registry-account').data('action-url', $(this).attr('href'));
        $('#baby-registry-account').modal('show');
    });

    $(document).on('click', '.update-baby-registry', function (e) {
        e.preventDefault();
        var actionURL =  $('#baby-registry-account').data('action-url');
        var from = {
            babyRegistry : setRegistryFieldValue(true)
        }
        $.spinner().start();
        $.ajax({
            url: actionURL,
            type: 'post',
            dataType: 'json',
            data: from,
            success: function (data) {
                $.spinner().stop();
                location.reload();

            },
            error: function (err) {
                $.spinner().stop();
                location.reload();
            }
        });
    });

});




module.exports = {
    setRegistryFieldValue: setRegistryFieldValue,
    addBabyFormFields: addBabyFormFields
}