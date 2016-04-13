/**
 * Created by PhpStorm.
 * @author: Alexey Tishchenko
 * @email: tischenkoalexey1@gmail.com
 * @oDesk: https://www.odesk.com/users/%7E01ad7ed1a6ade4e02e
 * @date: 06.10.15
 */

'use strict';

/**
 * Formatter component used for printing money in configured format
 * @param {object} [configCustom]
 * @returns {{money: function}}
 * @constructor
 */
var Formatter = function(configCustom) {

    var config = {
        money: {
            currency: '$',
            small: 'C999,00',
            big: 'C88.999,00'
        }
    };

    if(typeof(configCustom) === 'object') {
        if(typeof(configCustom['money']) === 'object') {
            if (typeof(configCustom['money']['currency']) !== 'undefined') {
                config.money.currency = configCustom['money']['currency'];
            }
            if (typeof(configCustom['money']['small']) !== 'undefined') {
                config.money.small = configCustom['money']['small'];
            }
            if (typeof(configCustom['money']['big']) !== 'undefined') {
                config.money.big = configCustom['money']['big'];
            }
        }
    }

    /**
     * Formats money < 1000
     * @param {float|int} value
     * @returns {string}
     */
    function moneySmall(value) {
        var template = config.money.small;
        var x = parseInt(value),
            z = value - x;
        z = z.toFixed(2);
        return template
            .replace('999', 'xxx').replace('00', 'zz')
            .replace('xxx', x+'').replace('zz', z.substring(2,4));
    }

    /**
     * Formats money >= 1000
     * @param {float|int} value
     * @returns {string}
     */
    function moneyBig(value) {
        var template = config.money.big;
        var z = value - parseInt(value);
        value = parseInt(value);
        var x = value % 1000,
            y = (value - (value % 1000)) / 1000;
        x = x < 100 ? (x < 10 ? '00' + x : '0' + x) : x;
        z = z.toFixed(2);
        return template
            .replace('88', 'yy').replace('999', 'xxx').replace('00', 'zz')
            .replace('xxx', x+'').replace('yy', y+'').replace('zz', z.substring(2,4));
    }

    return {

        /**
         * Prints money value according to pre-configured format
         * @param {float|int|string} value
         * @param {string} [currency]
         * @returns {String}
         */
        money: function(value, currency) {
            if(typeof(currency) === 'undefined') {
                currency = config.money.currency;
            }

            value = parseFloat(value).toFixed(2);

            return (value > 1000 ? moneyBig(value) : moneySmall(value))
                .replace('C', currency);
        }
    }
};
