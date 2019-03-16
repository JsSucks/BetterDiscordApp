/**
 * BetterDiscord Globals Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import path from 'path';
import sparkplug from 'sparkplug';
import { ClientIPC } from 'common';
import Module from './module';
import Events from './events';

export default new class extends Module {

    constructor(args) {
        super(args);

        // webpack replaces this with the normal require function
        // eslint-disable-next-line no-undef
        this.require = __non_webpack_require__;
    }

    initg() {
        this.first();
    }

    bindings() {
        this.first = this.first.bind(this);
        this.setWS = this.setWS.bind(this);
        this.getObject = this.getObject.bind(this);
    }

    async first() {
        const config = await ClientIPC.send('getConfig');
        this.setState({ config });

        const nativeModuleErrors = await ClientIPC.getNativeModuleErrors();
        this.setState({ nativeModuleErrors });

        // This is for Discord to stop error reporting :3
        window.BetterDiscord = {
            version: config.version,
            v: config.version
        };
        window.jQuery = {};

        if (sparkplug.bd) {
            this.setState({ bd: sparkplug.bd });
            sparkplug.bd.setWS = this.setWS;
        }

        Events.emit('global-ready');
        Events.emit('socket-created', this.state.wsHook);
    }

    setWS(wSocket) {
        const state = this.state;
        state.wsHook = wSocket;
        this.setState(state);
        Events.emit('socket-created');
    }

    getObject(name) {
        return this.config[name] || this.bd[name];
    }

    get bd() {
        return this.state.bd;
    }

    get localStorage() {
        return this.bd.localStorage;
    }

    get webSocket() {
        return this.bd.wsHook;
    }

    get WebSocket() {
        return this.bd.wsOrig;
    }

    get ignited() {
        return this.bd.ignited;
    }

    get config() {
        return this.state.config;
    }

    get paths() {
        return this.config.paths;
    }

    getPath(id) {
        return this.paths.find(path => path.id === id).path;
    }

    get version() {
        return this.config.versions.core;
    }

    get nativeModuleErrors() {
        return this.state.nativeModuleErrors;
    }

    get nativeModuleErrorCount() {
        return Object.keys(this.nativeModuleErrors).length;
    }

}
