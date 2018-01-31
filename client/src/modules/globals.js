/**
 * BetterDiscord Globals Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Module from './module';
import Events from './events';
import { ClientIPC } from 'bdipc';

export default new class extends Module {

    constructor(args) {
        super(args);
        this.first();
    }

    bindings() {
        this.first = this.first.bind(this);
        this.setWS = this.setWS.bind(this);
        this.getObject = this.getObject.bind(this);
    }

    first() {
        (async() => {
            const config = await ClientIPC.send('getConfig');
            this.setState(config);

            // This is for Discord to stop error reporting :3
            window.BetterDiscord = {
                'version': config.version,
                'v': config.version
            };
            window.jQuery = {};

            Events.emit('global-ready');
        })();

        if (window.__bd) {
            this.setState(window.__bd);
            window.__bd = {
                setWS: this.setWS
            }
            Events.emit('socket-created', this.state.wsHook);
        }
    }

    setWS(wSocket) {
        const state = this.state;
        state.wsHook = wSocket;
        this.setState(state);
        Events.emit('socket-created');
    }

    getObject(name) {
        return this.state[name];
    }

}
