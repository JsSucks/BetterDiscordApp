/**
 * BetterDiscord Dispatch Hook
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Reflection from './reflection';
import { MonkeyPatch } from './patcher';
import Events from './events';
import EventListener from './eventlistener';

// Discord seems to like to dispatch some things multiple times
const dispatched = new WeakSet();

/**
 * Discord event hook.
 * @extends {EventListener}
 */
export default class extends EventListener {

    init() {
        this.hook();
    }

    bindings() {
        this.hook = this.hook.bind(this);
        this.dispatch = this.dispatch.bind(this);
    }

    get eventBindings() {
        return [
            { id: 'discord-ready', callback: this.hook }
        ];
    }

    hook() {
        const { Dispatcher } = Reflection.modules;
        MonkeyPatch('BD:EVENTS', Dispatcher).after('dispatch', this.dispatch);
    }

    /**
     * Emit callback.
     */
    dispatch(Dispatcher, [event], retVal) {
        if (dispatched.has(event)) return;
        dispatched.add(event);

        Events.emit('discord-dispatch', event);
        Events.emit(`discord-dispatch:${event.type}`, event);
    }

}
