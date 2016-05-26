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
var Custom = function() {

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
            success = Custom.defaultSuccess;
        }
        if(error === null) {
            error = Custom.defaultError;
        }
        if(beforeSend === null) {
            beforeSend = function() {
                return Custom.defaultBeforeSend(event);
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

    return {

        /**
         * Initialises handlers
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

        /**
         * Displays bootstrap modal window with specified title and body texts
         * @param {string} title title of the modal window
         * @param {string} msg body text of the modal window
         */
        showModalMessage: function(title, msg) {
            if(typeof(title) === 'undefined') {
                title = Custom.getMessage('success');
            }

            if(!jQuery.fn.modal) {
                alert(title + '\n' + msg);
            } else {
                var $modal = jQuery('div#jsModal');
                $modal.find('h4#jsModalTitle').html(title);
                $modal.find('div#jsModalBody').html(msg);
                $modal.modal('show');
            }
        },

        /**
         * Shorthand method for showModalMessage() with "success" header
         * @param {string} [msg] {string}
         */
        showModalSuccess: function(msg) {
            if(typeof(msg) === 'undefined') {
                msg = Custom.getMessage('success');
            }

            Custom.showModalMessage(Custom.getMessage('success'), msg);
        },

        /**
         * Shorthand method for showModalMessage() with "error" header
         * @param {string} [msg]
         */
        showModalError: function(msg) {
            if(typeof(msg) === 'undefined') {
                msg = Custom.getMessage('internalError');
            }

            Custom.showModalMessage(Custom.getMessage('error'), msg);
        },

        /**
         * Gets message JS param
         * @param {string} key
         * @returns {string}
         */
        getMessage: function(key) {
            return (typeof(window['pageMessages']) !== 'undefined') &&
            typeof(window['pageMessages'][key]) !== 'undefined' ?
                window['pageMessages'][key] : key;
        },

        /**
         * Gets variable JS param
         * @param {string} key
         * @returns {*}
         */
        getVar: function(key) {
            return (typeof(window['pageVariables']) !== 'undefined') &&
            typeof(window['pageVariables'][key]) !== 'undefined' ?
                window['pageVariables'][key] : key;
        },

        /**
         * Gets URL JS param
         * @param {string} key
         * @returns {string}
         */
        getUrl: function(key) {
            return (typeof(window['pageUrls']) !== 'undefined') &&
            typeof(window['pageUrls'][key]) !== 'undefined' ?
                window['pageUrls'][key] : key;
        },

        /**
         * Scrolls page to specified target
         * @param {jQuery} $target
         * @param {int} [duration]
         */
        scrollTo: function($target, duration) {
            if(!$target.length) {
                return;
            }

            if(typeof(duration) === 'undefined') {
                duration = 800;
            }

            jQuery('html, body').animate({scrollTop: $target.offset().top}, duration);
        },

        /**
         * Default AJAX beforeSend function
         * @param {Event|Object} event
         */
        defaultBeforeSend: function(event) {
            var isValidated = true,
                $form = jQuery(event.target);

            if(window['noNeedToValidate']) {
                return true;
            }

            $form.find('[required]').each(function(index, element) {
                var $element = jQuery(element);
                if(
                    !$element.val() ||
                    !(['radio', 'checkbox'].indexOf($element.attr('type')) > -1 && $element.is(':checked'))
                ) {
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
                        message: Custom.getMessage('processing')
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
                    Custom.showModalError(Custom.getMessage('pleaseCompleteAllRequiredFields'));
                }
                Custom.scrollTo($form);

                return false;
            }
        },

        /**
         * Default AJAX success function
         * @param {object} data
         */
        defaultSuccess: function(data) {
            if(data.success === true) {
                Custom.showModalSuccess(data.message);
            } else {
                Custom.showModalError(data.message);
            }
        },

        /**
         * Default AJAX success function
         * @param {XMLHttpRequest} XHR
         */
        defaultError: function(XHR) {
            var json = JSON.parse(XHR.responseText);
            if(json && json.message) {
                Custom.showModalError(json.message);
            } else {
                Custom.showModalError();
            }
        }
    }
}();
