/**
 * BetterDiscord Module Base
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

/*
Base Module that every non-static module should extend
*/

export default class Module {

    constructor(args) {
        this.__ = {
            state: args || {},
            args
        }
        this.setState = this.setState.bind(this);
        this.init();
    }

    init() {
        if (this.bindings) this.bindings();
        if (this.setInitialState) this.setInitialState(this.state);
        if (this.events) this.events();
    }

    setState(newState) {
        const oldState = this.state;
        Object.assign(this.state, newState);
        if (this.stateChanged) this.stateChanged(oldState, newState);
    }

    set args(t) { }
    get args() { return this.__.args; }


    set state(state) { return this.__.state = state; }
    get state() { return this.__.state; }

}
