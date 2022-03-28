
(function ($) {
    "use strict";


    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function () {
        var check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

    $('#cboEmpresa').on('change', () => {
        var tipoCbo = $('#cboEmpresa option:selected').val();
        
        if (tipoCbo === 'codbar') {
            $('#id-color-fondo').removeClass('container-login-tecflex');
            $('#btn-login').removeClass('login100-form-btn');
            $('.input-text-color').removeClass('focus-input100');

            $('#id-color-fondo').addClass('container-login-codbar');
            $('#btn-login').addClass('login100-form-btn-codbar');
            $('.input-text-color').addClass('focus-input100-codbar');

        } else {
            $('#id-color-fondo').removeClass('container-login-codbar');
            $('#btn-login').removeClass('login100-form-btn-codbar');
            $('.input-text-color').removeClass('focus-input100-codbar');

            $('#id-color-fondo').addClass('container-login-tecflex');
            $('#btn-login').addClass('login100-form-btn');
            $('.input-text-color').addClass('focus-input100');
        }

    });

})(jQuery);