/**
 * BetterDiscord Vendor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import WebpackModules from './webpackmodules';
import jQuery from 'jquery';

export default class {

    static get jQuery() {
        return jQuery;
    }

    static get $() {
        return this.jQuery;
    }

    static get moment() {
        return WebpackModules.getModuleByName('Moment');
    }

}
