/**
 * BetterDiscord Client Core
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM, BdUI, Modals } from 'ui';
import BdCss from './styles/index.scss';
import { Events, CssEditor, Globals, ExtModuleManager, PluginManager, ThemeManager, ModuleManager, WebpackModules, Settings } from 'modules';
import { ClientLogger as Logger, ClientIPC } from 'common';

class BetterDiscord {

    constructor() {
        window.bdglobals = Globals;
        window.ClientIPC = ClientIPC;
        window.css = CssEditor;
        window.pm = PluginManager;
        window.events = Events;
        window.wpm = WebpackModules;
        window.bdsettings = Settings;
        window.bdmodals = Modals;
        DOM.injectStyle(BdCss, 'bdmain');
        Events.on('global-ready', this.globalReady.bind(this));
    }

    async init() {
        await Settings.loadSettings();
        await ModuleManager.initModules();
        await ExtModuleManager.loadAllModules(true);
        await PluginManager.loadAllPlugins(true);
        await ThemeManager.loadAllThemes(true);
        Modals.showContentManagerErrors();
        Events.emit('ready');
        Events.emit('discord-ready');
    }

    globalReady() {
        BdUI.initUiEvents();
        this.vueInstance = BdUI.injectUi();
        (async () => {
            this.init();
        })();
    }
}

if (window.BetterDiscord) {
    Logger.log('main', 'Attempting to inject again?');
} else {
    let bdInstance = new BetterDiscord();
}
