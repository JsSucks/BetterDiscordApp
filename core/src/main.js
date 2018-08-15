/**
 * BetterDiscord Core Entry
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import path from 'path';
import sass from 'node-sass';
import { BrowserWindow, dialog, session } from 'electron';
import deepmerge from 'deepmerge';
import ContentSecurityPolicy from 'csp-parse';

import { FileUtils, BDIpc, Config, WindowUtils, CSSEditor, Database } from './modules';

const tests = typeof PRODUCTION === 'undefined';

const _basePath = tests ? path.resolve(__dirname, '..', '..') : __dirname;
const _baseDataPath = tests ? path.resolve(_basePath, 'tests') : _basePath;

const sparkplug = path.resolve(__dirname, 'sparkplug.js');

const _clientScript = tests
    ? path.resolve(_basePath, 'client', 'dist', 'betterdiscord.client.js')
    : path.resolve(_basePath, 'betterdiscord.client.js');
const _cssEditorPath = tests
    ? path.resolve(__dirname, '..', '..', 'csseditor', 'dist')
    : path.resolve(__dirname, 'csseditor');

const _dataPath = path.resolve(_baseDataPath, 'data');
const _extPath = path.resolve(_baseDataPath, 'ext');
const _pluginPath = path.resolve(_extPath, 'plugins');
const _themePath = path.resolve(_extPath, 'themes');
const _modulePath = path.resolve(_extPath, 'modules');

const version = require(path.resolve(_basePath, 'package.json')).version;

const paths = [
    { id: 'base', path: _basePath },
    { id: 'cs', path: _clientScript },
    { id: 'data', path: _dataPath },
    { id: 'ext', path: _extPath },
    { id: 'plugins', path: _pluginPath },
    { id: 'themes', path: _themePath },
    { id: 'modules', path: _modulePath },
    { id: 'csseditor', path: _cssEditorPath }
];

const globals = {
    version,
    paths
};

const CSP = {
    'img-src': ['https://cdn.betterttv.net', 'https://cdn.frankerfacez.com'],
    'script-src': [
        '\'sha256-fSHKdpQGCHaIqWP3SpJOuUHrLp49jy4dWHzZ/RBJ/p4=\'', // React Devtools
        '\'sha256-VFJcfKY5B3EBkFDgQnv3CozPwBlZcxwssfLVWlPFfZU=\'', // Vue Devtools
        '\'sha256-VzDmLZ4PxPkOS/KY7ITzLQsSWhfCnvUrNculcj8UNgE=\' \'sha256-l6K+77Z1cmldR9gIvaVWlboF/zr5MXCQHcsEHfnr5TU=\''] // Vue Detector
};

class PatchedBrowserWindow extends BrowserWindow {
    constructor(originalOptions) {
        const userOptions = PatchedBrowserWindow.userWindowPreferences;

        const options = deepmerge(originalOptions, userOptions);
        options.webPreferences = Object.assign({}, options.webPreferences);

        // Make sure Node integration is enabled
        options.webPreferences.preload = sparkplug;

        super(options);

        this.__bd_preload = [];

        if (originalOptions.webPreferences && originalOptions.webPreferences.preload) {
            this.__bd_preload.push(originalOptions.webPreferences.preload);
        }
        if (userOptions.webPreferences && userOptions.webPreferences.preload) {
            this.__bd_preload.push(path.resolve(_dataPath, userOptions.webPreferences.preload));
        }
    }

    static get userWindowPreferences() {
        try {
            const userWindowPreferences = require(path.join(_dataPath, 'window'));
            if (typeof userWindowPreferences === 'object') return userWindowPreferences;
        } catch (err) {
            console.log('[BetterDiscord] Error getting window preferences:', err);
        }

        return {};
    }
}

class Comms {
    constructor(bd) {
        this.bd = bd;
        this.initListeners();
    }

    initListeners() {
        BDIpc.on('ping', () => 'pong', true);

        BDIpc.on('bd-getConfig', () => this.bd.config.config, true);

        BDIpc.on('bd-sendToDiscord', (event, m) => this.sendToDiscord(m.channel, m.message), true);

        BDIpc.on('bd-openCssEditor', (event, options) => this.bd.csseditor.openEditor(options), true);
        BDIpc.on('bd-sendToCssEditor', (event, m) => this.sendToCssEditor(m.channel, m.message), true);

        BDIpc.on('bd-native-open', (event, options) => {
            dialog.showOpenDialog(BrowserWindow.fromWebContents(event.ipcEvent.sender), options, filenames => {
                event.reply(filenames);
            });
        });

        BDIpc.on('bd-compileSass', (event, options) => {
            if (typeof options.path === 'string' && typeof options.data === 'string') {
                options.data = `${options.data} @import '${options.path.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}';`;
                options.path = undefined;
            }

            sass.render(options, (err, result) => {
                if (err) event.reject(err);
                else event.reply(result);
            });
        });

        BDIpc.on('bd-dba', (event, options) => this.bd.dbInstance.exec(options), true);
    }

    async send(channel, message) {
        BDIpc.send(channel, message);
    }

    async sendToDiscord(channel, message) {
        return this.bd.windowUtils.send(channel, message);
    }

    async sendToCssEditor(channel, message) {
        return this.bd.csseditor.send(channel, message);
    }
}

export class BetterDiscord {

    constructor(args) {
        if (BetterDiscord.loaded) {
            console.log('Creating two BetterDiscord objects???');
            return null;
        }
        BetterDiscord.loaded = true;

        this.injectScripts = this.injectScripts.bind(this);
        this.ignite = this.ignite.bind(this);

        this.config = new Config(args || globals);
        this.dbInstance = new Database(this.config.getPath('data'));
        this.comms = new Comms(this);

        this.init();
    }

    async init() {
        await this.waitForWindowUtils();

        if (!tests) {
            const basePath = this.config.getPath('base');
            const files = await FileUtils.listDirectory(basePath);
            const latestCs = FileUtils.resolveLatest(files, file => file.endsWith('.js') && file.startsWith('client.'), file => file.replace('client.', '').replace('.js', ''), 'client.', '.js');
            this.config.getPath('cs', true).path = path.resolve(basePath, latestCs);
        }

        await FileUtils.ensureDirectory(this.config.getPath('ext'));

        this.csseditor = new CSSEditor(this, this.config.getPath('csseditor'));

        this.windowUtils.on('did-finish-load', () => this.injectScripts(true));

        this.windowUtils.on('did-navigate-in-page', (event, url, isMainFrame) => {
            this.windowUtils.send('did-navigate-in-page', { event, url, isMainFrame });
        });

        setTimeout(() => {
            this.injectScripts();
        }, 500);
    }

    async waitForWindow() {
        return new Promise(resolve => {
            const defer = setInterval(() => {
                const windows = BrowserWindow.getAllWindows();

                if (windows.length === 1 && windows[0].webContents.getURL().includes('discordapp.com')) {
                    resolve(windows[0]);
                    clearInterval(defer);
                }
            }, 10);
        });
    }

    async waitForWindowUtils() {
        if (this.windowUtils) return this.windowUtils;
        const window = await this.waitForWindow();
        return this.windowUtils = new WindowUtils({ window });
    }

    get window() {
        return this.windowUtils ? this.windowUtils.window : undefined;
    }

    /**
     * Hooks things that Discord removes from global. These will be removed again in the client script.
     */
    ignite() {
        return BetterDiscord.ignite(this.window);
    }

    /**
     * Hooks things that Discord removes from global. These will be removed again in the client script.
     * @param {BrowserWindow} window The window to inject the sparkplug script into
     */
    static ignite(window) {
        return WindowUtils.injectScript(window, sparkplug);
    }

    /**
     * Injects the client script into the main window.
     * @param {Boolean} reload Whether the main window was reloaded
     */
    async injectScripts(reload = false) {
        console.log(`RELOAD? ${reload}`);
        return this.windowUtils.injectScript(this.config.getPath('cs'));
    }

    /**
     * Patches Electron's BrowserWindow so all windows have Node integration enabled.
     * This needs to be called only once before the main window is created (or BrowserWindow is put in a variable).
     * Basically BetterDiscord needs to load before discord_desktop_core.
     */
    static patchBrowserWindow() {
        const electron_path = require.resolve('electron');
        const browser_window_path = require.resolve(path.resolve(electron_path, '..', '..', 'browser-window.js'));
        const browser_window_module = require.cache[browser_window_path];

        browser_window_module.exports = PatchedBrowserWindow;
    }

    /**
     * Attaches an event handler for HTTP requests to update the Content Security Policy.
     */
    static hookSessionRequest() {
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            for (const [header, values] of Object.entries(details.responseHeaders)) {
                if (!header.match(/^Content-Security-Policy(-Report-Only)?$/i)) continue;

                details.responseHeaders[header] = values.map(value => {
                    const policy = new ContentSecurityPolicy(value);
                    for (const [key, value] of Object.entries(CSP)) {
                        if (!policy.get(key)) continue;
                        policy.add(key, value.join(' '));
                    }
                    return policy.toString();
                });
            }

            callback({ responseHeaders: details.responseHeaders });
        });
    }

}

BetterDiscord.patchBrowserWindow();
BetterDiscord.hookSessionRequest();
