/**
 * BetterDiscord Sparkplug
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This file is evaluated in the renderer process!
 */

import electron, { ipcRenderer } from 'electron';

(() => {
    if (module.exports.bd) return;

    console.log('[BetterDiscord|Sparkplug]');

    const currentWindow = electron.remote.getCurrentWindow();

    if (currentWindow.__bd_preload) {
        for (const preloadScript of currentWindow.__bd_preload) {
            try {
                require(preloadScript);
            } catch (err) {
                console.error('[BetterDiscord|Sparkplug] Error thrown in preload script', preloadScript, err);
            }
        }
    }

    ipcRenderer.on('--bd-inject-script', (event, {script, variable}) => {
        console.log('[BetterDiscord|Sparkplug] Injecting script', script, variable);
        if (variable) window[variable] = require(script);
        else require(script);
    });

    const ls = window.localStorage;
    if (!ls) console.warn('[BetterDiscord|Sparkplug] Failed to hook localStorage :(');
    const wsOrig = window.WebSocket;

    const bd = module.exports.bd = {
        localStorage: ls,
        wsHook: null,
        wsOrig,
        ignited: true
    };

    class WSHook extends window.WebSocket {

        constructor(url, protocols) {
            super(url, protocols);
            this.hook(url, protocols);
        }

        hook(url, protocols) {
            console.info(`[BetterDiscord|WebSocket Proxy] new WebSocket detected, url: ${url}`);
            if (!url.includes('gateway.discord.gg')) return;

            if (bd.setWS) {
                bd.setWS(this);
                console.info(`[BetterDiscord|WebSocket Proxy] WebSocket sent to instance`);
                return;
            }

            console.info(`[BetterDiscord|WebSocket Proxy] WebSocket stored to bd.wsHook`);
            bd.wsHook = this;
        }

    }

    window.WebSocket = WSHook;
})();
