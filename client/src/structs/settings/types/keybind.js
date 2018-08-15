/**
 * BetterDiscord Keybind Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Combokeys from 'combokeys';
import CombokeysGlobalBind from 'combokeys/plugins/global-bind';
import Setting from './basesetting';

const instances = new Set();
let keybindsPaused = false;

export default class KeybindSetting extends Setting {

    constructor(args, ...merge) {
        super(args, ...merge);

        // When adding a keybind-activated listener, add the keybind setting to the set of active keybind settings
        // This creates a reference to the keybind setting, which may cause memory leaks
        this.on('newListener', ({event: [event, listener]}) => {
            if (event === 'keybind-activated') instances.add(this);
        });

        // When there are no more keybind-activated listeners, remove the keybind setting from the set of active keybind settings
        // Always remember to unbind keybind-activated listeners!
        this.on('removeListener', ({event: [event, listener]}) => {
            if (!this.listenerCount('keybind-activated')) instances.delete(this);
        });

        this.__keybind_activated = this.__keybind_activated.bind(this);

        this.combokeys = new Combokeys(this);
        CombokeysGlobalBind(this.combokeys);
        this.combokeys.bindGlobal(this.value, this.__keybind_activated);
    }

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return '';
    }

    setValueHook() {
        this.combokeys.reset();
        this.combokeys.bindGlobal(this.value, this.__keybind_activated);
    }

    __keybind_activated(event) {
        if (KeybindSetting.paused) return;
        this.emit('keybind-activated', event);
    }

    // Event function aliases for Combokeys
    get addEventListener() { return this.on }
    get removeEventListener() { return this.removeListener }

    static _init() {
        document.addEventListener('keydown', this.__event_handler.bind(this, 'keydown'));
        document.addEventListener('keyup', this.__event_handler.bind(this, 'keyup'));
        document.addEventListener('keypress', this.__event_handler.bind(this, 'keypress'));
    }

    static __event_handler(event, data) {
        for (const keybindSetting of instances) {
            keybindSetting.emit(event, data);
        }
    }

    static get paused() {
        return keybindsPaused;
    }

    static set paused(paused) {
        keybindsPaused = paused;
    }

}

KeybindSetting._init();
