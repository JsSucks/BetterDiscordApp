/**
 * BetterDiscord Module Base
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

/**
 * Base Module that every non-static module should extend.
 */
class Module {

    constructor(args) {
        this.__ = {
            state: args || {},
            args
        };
        this.init();
    }

    init() {
        if (this.bindings) this.bindings();
        if (this.setInitialState) this.setInitialState(this.state);
    }

    setState(newState) {
        const oldState = this.state;
        Object.assign(this.__.state, newState);
        if (this.stateChanged) this.stateChanged(oldState, newState);
    }

    set args(t) {}
    get args() { return this.__.args; }
    get state() { return this.__.state; }

}

module.exports = { Module };
