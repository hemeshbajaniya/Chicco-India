'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./login/login'));

    $('.hide-password').css('display', 'none')
    
    $(".show-password, .hide-password").on('click', function () {
        if ($(this).hasClass('show-password')) {
            $("#login-form-password").attr("type", "text");
            $(this).parent().find(".show-password").hide();
            $(this).parent().find(".hide-password").show();
        } else {
            $("#login-form-password").attr("type", "password");
            $(this).parent().find(".hide-password").hide();
            $(this).parent().find(".show-password").show();
        }
    });

    $('.hide-confirm-pass').css('display', 'none')
    
    $(".show-confirm-pass, .hide-confirm-pass").on('click', function () {
        if ($(this).hasClass('show-confirm-pass')) {
            $("#registration-form-password").attr("type", "text");
            $("#registration-form-password-confirm").attr("type", "text");
            $(this).parent().find(".show-confirm-pass").hide();
            $(this).parent().find(".hide-confirm-pass").show();
        } else {
            $("#registration-form-password").attr("type", "password");
            $("#registration-form-password-confirm").attr("type", "password");
            $(this).parent().find(".hide-confirm-pass").hide();
            $(this).parent().find(".show-confirm-pass").show();
        }
    });

    $('.hide-current-password').css('display', 'none')
    
    $(".show-current-password, .hide-current-password").on('click', function () {
        if ($(this).hasClass('show-current-password')) {
            $("#currentPassword").attr("type", "text");
            $(this).parent().find(".show-current-password").hide();
            $(this).parent().find(".hide-current-password").show();
        } else {
            $("#currentPassword").attr("type", "password");
            $(this).parent().find(".hide-current-password").hide();
            $(this).parent().find(".show-current-password").show();
        }
    });

    $('.hide-new-password').css('display', 'none')
    
    $(".show-new-password, .hide-new-password").on('click', function () {
        if ($(this).hasClass('show-new-password')) {
            $("#newPasswordConfirm").attr("type", "text");
            $("#newPassword").attr("type", "text");
            $(this).parent().find(".show-new-password").hide();
            $(this).parent().find(".hide-new-password").show();
        } else {
            $("#newPasswordConfirm").attr("type", "password");
            $("#newPassword").attr("type", "password");
            $(this).parent().find(".hide-new-password").hide();
            $(this).parent().find(".show-new-password").show();
        }
    });

    if ($('.login-page #login.active').length > 0) {
        $('#login-tab').parent('li').hide();
        $('#register-tab').parent('li').show();
    }

    if ($('.login-page #register.active').length > 0) {
        $('#register-tab').parent('li').hide();
        $('#login-tab').parent('li').show();
    }

    $('#register-tab').on('click', function () {
        $('#register-tab').parent('li').hide();
        $('#login-tab').parent('li').show();
    })

    $('#login-tab').on('click', function () {
        $('#login-tab').parent('li').hide();
        $('#register-tab').parent('li').show();
    })
    
    $( '.login_otp_sec .login_box .get_otp_btn' ).on('click', function() {
        if($('.login_otp_sec .login_box input#phonNumber').val().length >1) {
            console.log($('.login_otp_sec .login_box input#phonNumber').val())
            $('.login_otp_sec .login_box  small').removeClass('d-block');
            $( '.login_otp_sec .login_box .opt_fields' ).slideDown( 'slow' );
        }
        else{
            $('.login_otp_sec .login_box  small').addClass('d-block');
        }
    });
});
