/**
 * BetterDiscord Client Utils Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Vendor } = require('../vendor');

const logs = [];

class Logger {

    static err(module, message) { this.log(module, message, 'err'); }
    static warn(module, message) { this.log(module, message, 'warn'); }
    static info(module, message) { this.log(module, message, 'info'); }
    static dbg(module, message) { this.log(module, message, 'dbg'); }
    static log(module, message, level = 'log') {
        message = message.message || message;
        if (typeof message === 'object') {
            //TODO object handler for logs
            console.log(message);
            return;
        }
        level = this.parseLevel(level);
        console[level]('[%cBetter%cDiscord:%s] %s', 'color: #3E82E5', '', `${module}${level === 'debug' ? '|DBG' : ''}`, message);
        logs.push(`[${Vendor.moment().format('DD/MM/YY hh:mm:ss')}|${module}|${level}] ${message}`);
        window.bdlogs = logs;
    }

    static logError(err) {
        if (!err.module && !err.message) {
            console.log(err);
            return;
        }
        this.err(err.module, err.message);
    }

    static get levels() {
        return {
            'log': 'log',
            'warn': 'warn',
            'err': 'error',
            'error': 'error',
            'debug': 'debug',
            'dbg': 'debug',
            'info': 'info'
        };
    }

    static parseLevel(level) {
        return this.levels.hasOwnProperty(level) ? this.levels[level] : 'log';
    }
}

module.exports = { Logger };
