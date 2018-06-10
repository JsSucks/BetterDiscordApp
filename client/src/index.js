/**
 * BetterDiscord Client Core
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM, BdUI, BdMenu, Modals, Reflection, Toasts } from 'ui';
import BdCss from './styles/index.scss';
import { Events, CssEditor, Globals, Settings, Database, Updater, ModuleManager, PluginManager, ThemeManager, ExtModuleManager, Vendor, WebpackModules, Patcher, MonkeyPatch, ReactComponents, ReactAutoPatcher, DiscordApi } from 'modules';
import { ClientLogger as Logger, ClientIPC, Utils } from 'common';
import { EmoteModule } from 'builtin';
import electron from 'electron';
import path from 'path';

const tests = typeof PRODUCTION === 'undefined';
const ignoreExternal = false;

class BetterDiscord {

    constructor() {
        Logger.file = tests ? path.resolve(__dirname, '..', '..', 'tests', 'log.txt') : path.join(__dirname, 'log.txt');
        Logger.log('main', 'BetterDiscord starting');

        this._bd = {
            DOM, BdUI, BdMenu, Modals, Reflection, Toasts,

            Events, CssEditor, Globals, Settings, Database, Updater,
            ModuleManager, PluginManager, ThemeManager, ExtModuleManager,
            Vendor,

            WebpackModules, Patcher, MonkeyPatch, ReactComponents, DiscordApi,
            EmoteModule,

            Logger, ClientIPC, Utils
        };

        const developermode = Settings.getSetting('core', 'advanced', 'developer-mode');
        if (developermode.value) window._bd = this._bd;
        developermode.on('setting-updated', event => {
            if (event.value) window._bd = this._bd;
            else if (window._bd) delete window._bd;
        });

        const debuggerkeybind = Settings.getSetting('core', 'advanced', 'debugger-keybind');
        debuggerkeybind.on('keybind-activated', () => {
            const currentWindow = electron.remote.getCurrentWindow();
            if (currentWindow.isDevToolsOpened()) return eval('debugger;');
            currentWindow.openDevTools();
            setTimeout(() => eval('debugger;'), 1000);
        });

        DOM.injectStyle(BdCss, 'bdmain');
        this.globalReady = this.globalReady.bind(this);
        Events.on('global-ready', this.globalReady);
        Globals.initg();
    }

    async init() {
        try {
            await Database.init();
            await Settings.loadSettings();
            await ModuleManager.initModules();

            if (!ignoreExternal) {
                await ExtModuleManager.loadAllModules(true);
                await PluginManager.loadAllPlugins(true);
                await ThemeManager.loadAllThemes(true);
            }

            if (!Settings.get('core', 'advanced', 'ignore-content-manager-errors'))
                Modals.showContentManagerErrors();

            Events.emit('ready');
            Events.emit('discord-ready');
            EmoteModule.init();
        } catch (err) {
            Logger.err('main', ['FAILED TO LOAD!', err]);
        }
    }

    globalReady() {
        BdUI.initUiEvents();
        this.vueInstance = BdUI.injectUi();
        this.init();
    }

}

if (window.BetterDiscord) {
    Logger.log('main', 'Attempting to inject again?');
} else {
    let instance;
    Events.on('autopatcher', () => instance = new BetterDiscord());
    ReactAutoPatcher.autoPatch().then(() => Events.emit('autopatcher'));
}
