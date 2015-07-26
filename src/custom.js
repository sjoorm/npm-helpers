/**
 * @author Alexey Tishchenko <tischenkoalexey1@gmail.com>
 * @oDesk https://www.odesk.com/users/~01ad7ed1a6ade4e02e
 * @website https://sjoorm.com
 * date: 2014-06-26
 * updated: 2015-07-27
 */
'use strict';
/**
 * Class Custom is a custom HTML, jQuery and Bootstrap helper
 */
var Custom = function () {

    /**
     * Handles `click` event for jsNoClick-classed &lt;a&gt; tags
     */
    function handleNoClick() {
        jQuery(document).on('click', 'a.jsNoClick', null, function () {
            return false;
        });
    }

    /**
     * Handles `submitAjax` jQuery plugin initialization
     */
    function handleFormSubmitAjax() {
        jQuery.fn.submitAjax = function (success, error, beforeSend, complete) {
            formSubmit(jQuery(this), {
                data: {
                    success: success,
                    error: error,
                    beforeSend: beforeSend,
                    complete: complete
                }
            });

            return this;
        };
    }

    /**
     * Gets message JS param
     * @param {string} key
     * @returns {*}
     */
    function getMessage(key) {
        return (typeof(window['pageMessages']) !== 'undefined') &&
        typeof(window['pageMessages'][key]) !== 'undefined' ?
            window['pageMessages'][key] : key;
    }

    /**
     * Gets variable JS param
     * @param {string} key
     * @returns {*}
     */
    function getVar(key) {
        return (typeof(window['pageVariables']) !== 'undefined') &&
        typeof(window['pageVariables'][key]) !== 'undefined' ?
            window['pageVariables'][key] : key;
    }

    /**
     * Gets URL JS param
     * @param {string} key
     * @returns {*}
     */
    function getUrl(key) {
        return (typeof(window['pageUrls']) !== 'undefined') &&
        typeof(window['pageUrls'][key]) !== 'undefined' ?
            window['pageUrls'][key] : key;
    }

    /**
     * Displays bootstrap modal window with specified title and body texts
     * @param {string} title title of the modal window
     * @param {string} msg body text of the modal window
     */
    function showModalMessage(title, msg) {
        if(typeof(title) === 'undefined') {
            title = getMessage('success');
        }

        if(!jQuery.fn.modal) {
            alert(title + '\n' + msg);
        } else {
            var $modal = jQuery('div#jsModal');
            $modal.find('h4#jsModalTitle').html(title);
            $modal.find('div#jsModalBody').html(msg);
            $modal.modal('show');
        }
    }

    /**
     * Shorthand method for showModalMessage() with "success" header
     * @param {string} [msg] {string}
     */
    function showModalSuccess(msg) {
        if(typeof(msg) === 'undefined') {
            msg = getMessage('success');
        }

        showModalMessage(getMessage('success'), msg);
    }

    /**
     * Shorthand method for showModalMessage() with "error" header
     * @param {string} [msg]
     */
    function showModalError(msg) {
        if(typeof(msg) === 'undefined') {
            msg = getMessage('internalError');
        }

        showModalMessage(getMessage('error'), msg);
    }

    /**
     * Default AJAX success function
     * @param {object} data
     */
    function defaultSuccess(data) {
        if(data.success === true) {
            showModalSuccess(data.message);
        } else {
            showModalError(data.message);
        }
    }

    /**
     * Default AJAX success function
     * @param {XMLHttpRequest} XHR
     */
    function defaultError(XHR) {
        var json = JSON.parse(XHR.responseText);
        if(json && json.message) {
            showModalError(json.message);
        } else {
            showModalError();
        }
    }

    /**
     * Default AJAX beforeSend function
     * @param {Event|Object} event
     */
    function defaultBeforeSend(event) {
        var isValidated = true,
            $form = jQuery(event.target);

        if(window['noNeedToValidate']) {
            return true;
        }

        $form.find('[required]').each(function(index, element) {
            var $element = jQuery(element);
            if(!$element.val()) {
                isValidated = false;
                $element
                    .parents('div.form-group')
                    .first()
                    .removeClass('has-success')
                    .addClass('has-error');
            } else {
                $element
                    .parents('div.form-group')
                    .first()
                    .removeClass('has-error')
                    .addClass('has-success');
            }
        });

        if(isValidated) {
            if(jQuery.blockUI) {
                $form.data('validated', true).block({
                    message: getMessage('processing')
                });
            }

            return true;
        } else {
            $form.removeAttr('validated');

            if(event.preventDefault) {
                event.preventDefault();
            }
            if(event['simpleModal']) {
                alert(Custom.getMessage('pleaseCompleteAllRequiredFields'));
            } else {
                showModalError(Custom.getMessage('pleaseCompleteAllRequiredFields'));
            }
            scrollTo($form);

            return false;
        }
    }

    /**
     * Submits specified form through AJAX request
     * @param {jQuery} $form
     * @param {Event|object} event
     */
    function formSubmit($form, event) {
        var success = null,
            error = null,
            beforeSend = null,
            complete = null;
        if(typeof(event) === 'object' && typeof(event.data) === 'object' && event.data !== null) {
            if(typeof(event.data.success) === 'function') {
                success = event.data.success;
            }
            if(typeof(event.data.error) === 'function') {
                error = event.data.error;
            }
            if(typeof(event.data.beforeSend) === 'function') {
                beforeSend = event.data.beforeSend;
            }
            if(typeof(event.data.complete) === 'function') {
                complete = event.data.complete;
            }
        }
        if(success === null) {
            success = defaultSuccess;
        }
        if(error === null) {
            error = defaultError;
        }
        if(beforeSend === null) {
            beforeSend = function() {
                return defaultBeforeSend(event);
            }
        }
        if(complete === null) {
            complete = function() {
                if(jQuery.blockUI) {
                    $form.unblock();
                }
            }
        }

        jQuery.ajax({
            type: $form.attr('method'),
            dataType: 'json',
            url: $form.attr('action'),
            data: $form.serialize(),
            success: success,
            error: error,
            beforeSend: beforeSend,
            complete: complete
        });
    }

    /**
     * Scrolls page to specified target
     * @param {jQuery} $target
     * @param {int} [duration]
     */
    function scrollTo($target, duration) {
        if(!$target.length) {
            return;
        }

        if(typeof(duration) === 'undefined') {
            duration = 800;
        }

        jQuery('html, body').animate({scrollTop: $target.offset().top}, duration);
    }

    return {
        /**
         * Initializes helper basic functionality
         */
        init: function () {
            handleNoClick();
            handleFormSubmitAjax();
        },

        /**
         * Callback to be bind via jQuery.on() method
         * Success and error function can be passed through "data" argument of jQuery.on()
         * @param {Event|Object} event
         * @returns {boolean}
         */
        submitAjax: function(event) {
            formSubmit(jQuery(this), event);
            return false;
        },

        showModalMessage: showModalMessage,

        showModalSuccess: showModalSuccess,

        showModalError: showModalError,

        getMessage: getMessage,

        getVar: getVar,

        getUrl: getUrl,

        scrollTo: scrollTo,

        defaultBeforeSend: defaultBeforeSend,

        defaultError: defaultError
    }
}();
