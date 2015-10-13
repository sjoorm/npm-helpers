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
 * @returns {{log: log, levelUp: levelUp, levelDown: levelDown}}
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
     * Increases log level up
     */
    function levelUp() {
        ++level;
        duration[level] = timestamp();
    }

    /**
     * Decreases log level down
     */
    function levelDown() {
        duration[level] = timestamp() - duration[level];
        --level;
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

    /**
     * Adds log line with given message, preceded with corresponding log level mark
     * @param {string} message
     */
    function log(message) {
        if(!enabled) {
            return;
        }
        if(level < 0) {
            levelUp();
        }

        var indent = '';
        for(var i = 0; i < level; ++i) {
            indent = indent + '-';
        }

        console.log((level ? (indent + ' ') : '') + message + ' [+' + seconds(level) + ' ms.]')
    }

    return {
        log: log,
        levelUp: levelUp,
        levelDown: levelDown
    };
};
