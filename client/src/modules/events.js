/**
 * BetterDiscord Events Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { EventEmitter } from 'events';
const emitter = new EventEmitter();

export default class {
    static on(eventName, callBack) {
        emitter.on(eventName, callBack);
    }

    static off(eventName, callBack) {
        emitter.removeListener(eventName, callBack);
    }

    static emit(...args) {
        emitter.emit(...args);
    }
}
