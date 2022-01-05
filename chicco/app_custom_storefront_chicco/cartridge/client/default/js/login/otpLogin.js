'use strict';

$(document).ready(function () {

    $(document).on('submit', '.request-otp-form', function (e) {
        var form = $(this);
        e.preventDefault();
        e.stopImmediatePropagation();

        var phoneNumber = form.find('#phonNumber');
        phoneNumber.removeClass('is-invalid');
        $('.request-otp-error-message').addClass('d-none')

        var url = form.attr('action');

        if (phoneNumber.val() == '' || phoneNumber.val().length == 0) {
            phoneNumber.addClass('is-invalid');
            return;
        }

        var pattern = /^\s*\+?\s*([0-9][\s-]*){9,}$/i
        var phoneNumberValue = phoneNumber.val();
        if(!pattern.test(phoneNumberValue)) {
            phoneNumber.addClass('is-invalid');
            return;
        }

        form.spinner().start();
        $('form.registration').trigger('login:register', e);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: form.serialize(),
            success: function (data) {
                form.spinner().stop();
                if (!data.error) {
                    $('.sucess-otp-message').text(data.addtioanlMessage);
                    $('.request-otp-verify-form').removeClass('d-none');
                    setCountDown('01:00', '.count-down');
                    $('.otp-phoneNumber').val(data.customerPhone);
                    $('.otp-requestID').val(data.requestID);
                    $('.request-otp-form').addClass('d-none')
                } else {
                    $('body').trigger('registration:failed', data.message);
                    if (data.error) {
                        $('.request-otp-error-message').text(data.message);
                        $('.request-otp-error-message').removeClass('d-none')
                    }
                }
            },
            error: function (err) {
                form.spinner().stop();
            }
        });
        return false;
    });

   $(document).on('submit', '.request-otp-verify-form', function (e) {
        var form = $(this);
        e.preventDefault();
        e.stopImmediatePropagation();

        $('.verify-otp-error-message').addClass('d-none')

        var url = form.attr('action');

        form.spinner().start();
        $('form.registration').trigger('login:register', e);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: form.serialize(),
            success: function (data) {
                form.spinner().stop();
                if (!data.error) {
                    $('.sucess-otp-message').text(data.message);
                    location.href = data.redirectUrl;
                } else {
                    $('body').trigger('registration:failed', data.message);
                    if (data.error) {
                        $('.verify-otp-error-message').text(data.message);
                        $('.verify-otp-error-message').removeClass('d-none')
                    }
                }
            },
            error: function (err) {
                form.spinner().stop();
            }
        });
        return false;
    });

    $(document).on('click', '.resend-otp', function(e) {
        e.preventDefault();
        $('.request-otp-form').removeClass('d-none');
        $('.request-otp-verify-form').addClass('d-none');
    });

    if ($('.request-otp-verify-form').length > 0) {
        $('.request-otp-verify-form').find('.opt > input').each(function() {
            $(this).attr('maxlength', 1);
            $(this).on('keyup', function(e) {
                var parent = $($(this).parent());
                
                if (e.keyCode === 8 || e.keyCode === 37) {
                    var prev = ('input#' + $(this).data('previous'));
                    
                    if (prev.length) {
                        $(prev).select();
                    }
                } else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 39) {
                    var next = ('input#' + $(this).data('next'));
                    
                    if (next.length) {
                        $(next).select();
                    } else {
                        if (parent.data('autosubmit')) {
                            parent.submit();
                        }
                    }
                }
            });
        });    
    }

});

function setCountDown(time, selector) {
    var timer2 = time;
var interval = setInterval(function() {


  var timer = timer2.split(':');
  //by parsing integer, I avoid all extra string processing
  var minutes = parseInt(timer[0], 10);
  var seconds = parseInt(timer[1], 10);
  --seconds;
  minutes = (seconds < 0) ? --minutes : minutes;
  if (minutes < 0) clearInterval(interval);
  seconds = (seconds < 0) ? 59 : seconds;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  //minutes = (minutes < 10) ?  minutes : minutes;
  $(selector).html(seconds);
  timer2 = minutes + ':' + seconds;
  if (seconds == 0) {
    $('.request-otp-form').removeClass('d-none');
    $('.request-otp-verify-form').addClass('d-none');
  }
}, 1000);
}