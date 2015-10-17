/**
 * Created by PhpStorm.
 * @author: Alexey Tishchenko
 * @email: tischenkoalexey1@gmail.com
 * @oDesk: https://www.odesk.com/users/%7E01ad7ed1a6ade4e02e
 * @date: 05.10.15
 */

'use strict';

/**
 * Custom logger class
 * @param {boolean} [logging]
 * @returns {{log: function, up: function, down: function, wrap: function}}
 * @constructor
 */
var Logger = function(logging) {

    /** LOGGING **/
    var enabled = false,
        level = -1,
        duration = [];

    if(typeof(logging) === 'boolean') {
        enabled = logging;
    }

    /**
     * Fetches UNIX timestamp
     * @returns {number}
     */
    function timestamp() {
        return Date.now ? Date.now() : (new Date).getTime();
    }

    /**
     * Gets passed seconds amount (on specified level)
     * @param {number} index
     * @returns {number}
     */
    function seconds(index) {
        return typeof(duration[index]) === 'undefined' ?
            0 :
            (timestamp() - duration[index]);
    }

    return {

        /**
         * Adds log line with given message, preceded with corresponding log level mark
         * @param {string} message
         * @returns {Logger}
         */
        log: function(message) {
            if(!enabled) {
                return this;
            }
            if(level < 0) {
                this.up();
            }

            var indent = '';
            for(var i = 0; i < level; ++i) {
                indent = indent + '-';
            }

            console.log((level ? (indent + ' ') : '') + message + ' [+' + seconds(level) + ' ms.]');

            return this;
        },

        /**
         * Increases Logger log level
         * @returns {Logger}
         */
        up: function() {
            ++level;
            duration[level] = timestamp();

            return this;
        },

        /**
         * Decreases Logger log level
         * @returns {Logger}
         */
        down: function() {
            duration[level] = timestamp() - duration[level];
            --level;

            return this;
        },

        /**
         * Logs execution of passed callback wrapping it in BEGIN and END messages
         * @param {string} message
         * @param {function} callback
         * @returns {Logger}
         */
        wrap: function(message, callback) {
            this.up().log('BEGIN ' + message);
            callback();
            return this.log('END ' + message).down();
        }
    };
};
