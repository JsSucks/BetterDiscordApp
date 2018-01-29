/**
 * BetterDiscord Client Utils Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { WebpackModules } = require('./webpackmodules');
const jQuery = require('jquery');

class Vendor {

    static get jQuery() {
        return jQuery;
    }

    static get $() {
        return jQuery;
    }

    static get moment() {
        return WebpackModules.getModuleByName('Moment');
    }

}

module.exports = { Vendor };
