/**
 * BetterDiscord Client Core
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM, BdUI, BdMenu, Modals, Toasts, Notifications, BdContextMenu, DiscordContextMenu, Autocomplete } from 'ui';
import BdCss from './styles/index.scss';
import { Events, Globals, Settings, Database, Updater, ModuleManager, PluginManager, ThemeManager, ExtModuleManager, Vendor, Patcher, MonkeyPatch, ReactComponents, ReactHelpers, ReactAutoPatcher, DiscordApi, BdWebApi, Connectivity, Cache, Reflection, PackageInstaller } from 'modules';
import { ClientLogger as Logger, ClientIPC, Utils, Axi } from 'common';
import { BuiltinManager, EmoteModule, ReactDevtoolsModule, VueDevtoolsModule, TrackingProtection, E2EE } from 'builtin';
import electron from 'electron';
import path from 'path';

const tests = typeof PRODUCTION === 'undefined';
const ignoreExternal = tests && true;

class BetterDiscord {

    constructor() {
        Logger.file = tests ? path.resolve(__dirname, '..', '..', 'tests', 'log.txt') : `${__dirname}-log.txt`;
        Logger.trimLogFile();
        Logger.log('main', 'BetterDiscord starting');

        this._bd = {
            DOM, BdUI, BdMenu, Modals, Reflection, Toasts, Notifications, BdContextMenu, DiscordContextMenu, Autocomplete,

            Events, Globals, Settings, Database, Updater,
            ModuleManager, PluginManager, ThemeManager, ExtModuleManager, PackageInstaller,
            Vendor,

            Patcher, MonkeyPatch, ReactComponents, ReactHelpers, ReactAutoPatcher, DiscordApi,
            BuiltinManager, EmoteModule,
            BdWebApi,
            Connectivity,
            Cache,
            Logger, ClientIPC, Utils, Axi,

            plugins: PluginManager.localContent,
            themes: ThemeManager.localContent,
            extmodules: ExtModuleManager.localContent,

            __filename, __dirname,
            module: Globals.require.cache[__filename],
            require: Globals.require,
            webpack_require: __webpack_require__, // eslint-disable-line no-undef
            get discord_require() { return Reflection.require }
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

    globalReady() {
        BdUI.initUiEvents();
        this.vueInstance = BdUI.injectUi();
        this.init();
    }

    async init() {
        try {
            await Database.init();
            await Settings.loadSettings();
            await ModuleManager.initModules();
            BuiltinManager.initAll();

            if (tests) this.initTests();

            if (!ignoreExternal) {
                await ExtModuleManager.loadAllModules(true);
                await PluginManager.loadAllPlugins(true);
                await ThemeManager.loadAllThemes(true);
            }

            Events.emit('ready');
            Events.emit('discord-ready');

            if (!Settings.get('core', 'advanced', 'ignore-content-manager-errors'))
                Modals.showContentManagerErrors();
        } catch (err) {
            Logger.err('main', ['FAILED TO LOAD!', err]);
        }
    }

    initTests() {
        let notifications = 0;
        function showDummyNotif() { // eslint-disable-line no-inner-declarations
            Notifications.add(notifications++ ? `Notification ${notifications}` : undefined, 'Dummy Notification', [
                {
                    text: 'Show Again', onClick: function () {
                        setTimeout(showDummyNotif, 5000);
                        return true;
                    }
                },
                {
                    text: 'Ignore', onClick: function () {
                        return true;
                    }
                }
            ]);
        }
        showDummyNotif();

        DiscordContextMenu.add([
            {
                text: 'Hello',
                onClick: () => { Toasts.info('Hello!'); }
            }
        ]);
    }

}

if (window.BetterDiscord) {
    Logger.log('main', 'Attempting to inject again?');
} else {
    let instance;
    Events.on('autopatcher', () => instance = new BetterDiscord());
    ReactAutoPatcher.autoPatch().then(() => Events.emit('autopatcher'));
}
