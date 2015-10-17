/**
 * Created by PhpStorm.
 * @author: Alexey Tishchenko
 * @email: tischenkoalexey1@gmail.com
 * @oDesk: https://www.odesk.com/users/%7E01ad7ed1a6ade4e02e
 * @date: 28.02.15
 */

'use strict';

/**
 * Browser hash-based navigation helper. Check navigation.html "config" value for details.
 * @param {object} pages
 * @param {function} [callbackAfter]
 * @returns {{next: next, prev: prev, setHash: setHash}}
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

    /**
     * Sets breadcrumbs to selected state(hash)
     * @param {string} hash
     * @param {boolean} [checkIfAllowed]
     */
    function setHash(hash, checkIfAllowed) {
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
    }

    /**
     * To the next step
     */
    function next() {
        if(current < config.length - 1 && config[current].up()) {
            setHash(config[++current].hash);
        }
    }

    /**
     * To the previous step
     */
    function prev() {
        if(current > 0 && config[current].down()) {
            setHash(config[--current].hash);
        }
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
            window.onhashchange = function() {
                var hash = window.location.hash.substr(1, window.location.hash.length-1),
                    position = getIndex(hash);

                if(position > current) {
                    while(position > current) {
                        next();
                    }
                } else if(position < current) {
                    while(position < current) {
                        prev();
                    }
                }

                setHash(hash);
            };

            setHash(config[0].hash);

            initialized = true;
        },

        next: next,

        prev: prev,

        setHash: setHash,

        getHash: function() {
            return config[current].hash;
        }
    }
};
