/**
 * Created by PhpStorm.
 * @author: Alexey Tishchenko
 * @email: tischenkoalexey1@gmail.com
 * @oDesk: https://www.odesk.com/users/%7E01ad7ed1a6ade4e02e
 * @date: 28.02.15
 */

'use strict';

/**
 * Browser hash-based navigation helper. Check test/navigation.html "config" value for details.
 * @param {object} pages
 * @param {function} [callbackAfter]
 * @returns {{init: Function, next: Function, prev: Function, setHash: Function, getHash: Function}}
 * @constructor
 */
var Navigation = function(pages, callbackAfter) {

    var initialized = false,
        afterSetHash = function(){},
        config = [],
        current = 0;

    /**
     * Gets hash pointer
     * @param {string} hash
     * @returns {number}
     */
    function getIndex(hash) {
        for(var i = 0; i < config.length; ++i) {
            if(config[i].hash === hash) {
                return i;
            }
        }

        return 0;
    }

    /**
     * Checks if jump from page specified by "from" index
     * to page specified by "to" is allowed or not
     * @param {number} from
     * @param {number} to
     * @returns {boolean}
     */
    function isAllowed(from, to) {
        return from === to || config[to].allow.indexOf(from) !== -1;
    }

    // Initialise Navigation config
    config = pages;
    if(typeof(callbackAfter) === 'function') {
        afterSetHash = callbackAfter;
    }

    return {

        /**
         * Initialises Navigation component
         */
        init: function() {
            var ptr = this;
            window.onhashchange = function() {
                var hash = window.location.hash.substr(1, window.location.hash.length-1),
                    position = getIndex(hash);

                if(position > current) {
                    while(position > current) {
                        ptr.next();
                    }
                } else if(position < current) {
                    while(position < current) {
                        ptr.prev();
                    }
                }

                ptr.setHash(hash);
            };

            this.setHash(config[0].hash);

            initialized = true;
        },

        /**
         * To the next step
         */
        next: function() {
            if(current < config.length - 1 && config[current].up()) {
                this.setHash(config[++current].hash);
            }
        },

        /**
         * To the previous step
         */
        prev: function() {
            if(current > 0 && config[current].down()) {
                this.setHash(config[--current].hash);
            }
        },

        /**
         * Sets breadcrumbs to selected state(hash)
         * @param {string} hash
         * @param {boolean} [checkIfAllowed]
         */
        setHash: function(hash, checkIfAllowed) {
            hash = hash.replace('#', '');
            var to = getIndex(hash);

            // check for allowance
            if(typeof(checkIfAllowed) === 'undefined') {
                checkIfAllowed = true;
            }
            if(checkIfAllowed && !isAllowed(current, to)) {
                return;
            }

            // jump
            current = to;
            window.history.pushState(hash, hash, '#' + hash);

            // draw current page block
            jQuery('[data-hash]').each(function(index, element) {
                if(element.getAttribute('data-hash') === hash) {
                    if(initialized && typeof(Custom) === 'object') {
                        Custom.scrollTo(jQuery(element).show());
                    }
                } else {
                    jQuery(element).hide();
                }
            });

            // post-action callback
            afterSetHash();
        },

        /**
         * Gets current hash value
         * @returns {string}
         */
        getHash: function() {
            return config[current].hash;
        }
    }
};
