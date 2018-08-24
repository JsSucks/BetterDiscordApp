/**
 * BetterDiscord Reflection Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Modules } from './modules';
import { Reflection as DOM } from 'ui';
import Resolver from './resolver';

export default class Reflection {

    static get modules() {
        return Modules;
    }

    static get resolver() {
        return Resolver;
    }

    static get DOM() {
        return DOM;
    }

}
