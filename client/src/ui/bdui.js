/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events, WebpackModules, DiscordApi, MonkeyPatch } from 'modules';
import { Utils } from 'common';
import { remote } from 'electron';
import DOM from './dom';
import Vue from './vue';
import AutoManip from './automanip';
import { BdSettingsWrapper, BdModals, BdToasts } from './components';

export default class {

    static initUiEvents() {
        this.pathCache = {
            isDm: null,
            server: DiscordApi.currentGuild,
            channel: DiscordApi.currentChannel
        };

        window.addEventListener('keyup', e => Events.emit('gkh:keyup', e));
        this.autoManip = new AutoManip();

        const ehookInterval = setInterval(() => {
            if (!remote.BrowserWindow.getFocusedWindow()) return;
            clearInterval(ehookInterval);
            remote.BrowserWindow.getFocusedWindow().webContents.on('did-navigate-in-page', (e, url, isMainFrame) => {
                const { currentGuild, currentChannel } = DiscordApi;

                if (!this.pathCache.server) {
                    Events.emit('server-switch', { server: currentGuild, channel: currentChannel });
                    this.pathCache.server = currentGuild;
                    this.pathCache.channel = currentChannel;
                    return;
                }

                if (!this.pathCache.channel) {
                    Events.emit('channel-switch', currentChannel);
                    this.pathCache.server = currentGuild;
                    this.pathCache.channel = currentChannel;
                    return;
                }

                if (currentGuild && currentGuild.id && this.pathCache.server && this.pathCache.server.id !== currentGuild.id) {
                    Events.emit('server-switch', { server: currentGuild, channel: currentChannel });
                    this.pathCache.server = currentGuild;
                    this.pathCache.channel = currentChannel;
                    return;
                }

                if (currentChannel && currentChannel.id && this.pathCache.channel && this.pathCache.channel.id !== currentChannel.id)
                    Events.emit('channel-switch', currentChannel);

                this.pathCache.server = currentGuild;
                this.pathCache.channel = currentChannel;
            });
        }, 100);
    }

    static injectUi() {
        DOM.createElement('div', null, 'bd-settings').appendTo(DOM.bdBody);
        DOM.createElement('div', null, 'bd-modals').appendTo(DOM.bdModals);
        DOM.createElement('bd-tooltips').appendTo(DOM.bdBody);
        DOM.createElement('bd-toasts').appendTo(DOM.bdBody);

        const toasts = new Vue({
            el: 'bd-toasts',
            components: { BdToasts },
            template: '<BdToasts/>'
        });

        this.modals = new Vue({
            el: '#bd-modals',
            components: { BdModals },
            template: '<BdModals />'
        });

        this.vueInstance = new Vue({
            el: '#bd-settings',
            components: { BdSettingsWrapper },
            template: '<BdSettingsWrapper />'
        });

        return this.vueInstance;
    }

}
