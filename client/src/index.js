/**
 * BetterDiscord Client Core
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

'use strict';

const styles = require('./styles/index.scss');
const { Global, Logger, Utils, PluginManager, BDIpc, WebpackModules, SocketProxy, Events, Vendor } = require('./modules');
//const { UI } = require('./modules/ui/index.jsx');

class BetterDiscord {

    constructor() {
        window.bdUtils = Utils;
        window.wpm = WebpackModules;
        Events.on('global-ready', e => {
            const { UI } = require('./modules/ui/vueui.js');
            this.ui = new UI();
            this.init();
        });

        //Inject styles to head for now
        const style = document.createElement('style');
        style.id = 'bd-main';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(styles));
        document.head.appendChild(style);

        this.init();
    }

    async init() {
        try {
            await PluginManager.loadAllPlugins();
        } catch (err) {
        }

        Events.emit('ready');
    }

}

if (window.BetterDiscord) {
    Logger.log('main', 'Attempting to inject again?');
} else {
    let bdInstance = new BetterDiscord();
    window.BetterDiscord = {'vendor': Vendor};
}
