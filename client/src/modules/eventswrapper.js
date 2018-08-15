/**
 * BetterDiscord Events Wrapper Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const eventemitters = new WeakMap();

export default class EventsWrapper {

    constructor(eventemitter, bind) {
        eventemitters.set(this, eventemitter);
        this.bind = bind || this;
    }

    get eventSubs() {
        return this._eventSubs || (this._eventSubs = []);
    }

    get on() { return this.subscribe }
    subscribe(event, callback) {
        if (this.eventSubs.find(e => e.event === event && e.callback === callback)) return;
        const boundCallback = (...args) => callback.apply(this.bind, args);
        this.eventSubs.push({ event, callback, boundCallback });
        eventemitters.get(this).on(event, boundCallback);
    }

    once(event, callback) {
        if (this.eventSubs.find(e => e.event === event && e.callback === callback)) return;
        const boundCallback = (...args) => this.off(event, callback) && callback.apply(this.bind, args);
        this.eventSubs.push({ event, callback, boundCallback });
        eventemitters.get(this).on(event, boundCallback);
    }

    get off() { return this.unsubscribe }
    unsubscribe(event, callback) {
        for (const index in this.eventSubs) {
            if (this.eventSubs[index].event !== event || (callback && this.eventSubs[index].callback === callback)) continue;
            eventemitters.get(this).removeListener(event, this.eventSubs[index].boundCallback);
            this.eventSubs.splice(index, 1);
        }
    }

    unsubscribeAll() {
        for (const event of this.eventSubs) {
            eventemitters.get(this).removeListener(event.event, event.boundCallback);
        }
        this.eventSubs.splice(0, this.eventSubs.length);
    }

}
