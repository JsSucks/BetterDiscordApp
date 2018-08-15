/**
 * BetterDiscord Async EventEmitter
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import EventEmitter from 'events';

/**
 * Extends Node.js' EventEmitter to call event listeners asyncronously.
 */
export default class AsyncEventEmitter extends EventEmitter {

    /**
     * Emits an event.
     * @param {String} event The event to emit
     * @param {Any} ...data Data to be passed to event listeners
     * @return {Promise}
     */
    async emit(event, ...data) {
        let listeners = this._events[event] || [];
        listeners = Array.isArray(listeners) ? listeners : [listeners];

        // Special treatment of internal newListener and removeListener events
        if(event === 'newListener' || event === 'removeListener') {
            data = [{
                event: data,
                fn: err => {
                    if (err) throw err;
                }
            }];
        }

        for (const listener of listeners) {
            await listener.apply(this, data);
        }
    }

    /**
     * Adds an event listener that will be removed when it is called and therefore only be called once.
     * If a callback is not specified a promise that is resolved once the event is emitted is returned.
     */
    once(event, callback) {
        if (callback) {
            // If a callback was specified add this event as normal
            return EventEmitter.prototype.once.apply(this, arguments);
        }

        // Otherwise return a promise that is resolved once this event is emitted
        return new Promise((resolve, reject) => {
            EventEmitter.prototype.once.call(this, event, data => {
                return resolve(data);
            });
        });
    }

    /**
     * Unbinds an event listener.
     */
    off(event, callback) {
        this.removeListener(event, callback);
    }

}
