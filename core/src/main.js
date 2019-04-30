/**
 * BetterDiscord Core Entry
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

/*PRODUCTION*/
const TESTS = typeof PRODUCTION === 'undefined';
const TEST_ARGS = () => {
    const _basePath = path.resolve(__dirname, '..', '..');
    const _baseDataPath = path.resolve(_basePath, 'tests');

    const _corePkg = require(path.resolve(_basePath, 'core', 'package.json'));
    const _clientPkg = require(path.resolve(_basePath, 'client', 'package.json'));
    const _editorPkg = require(path.resolve(_basePath, 'editor', 'package.json'));

    const coreVersion = _corePkg.version;
    const clientVersion = _clientPkg.version;
    const editorVersion = _editorPkg.version;

    return {
        coreVersion,
        clientVersion,
        editorVersion,
        'options': {
            'autoInject': true,
            'commonCore': true,
            'commonData': true
        },
        'paths': {
            'client': path.resolve(_basePath, 'client', 'dist'),
            'core': path.resolve(_basePath, 'core', 'dist'),
            'data': path.resolve(_baseDataPath, 'data'),
            'editor': path.resolve(_basePath, 'editor', 'dist'),
            // tmp: path.join(_basePath, 'tmp')
        }
    }
}
const TEST_EDITOR = TESTS && true;

import process from 'process';
import os from 'os';
import path from 'path';
import sass from 'node-sass';
import { BrowserWindow as OriginalBrowserWindow, dialog, session, shell } from 'electron';
import deepmerge from 'deepmerge';
import ContentSecurityPolicy from 'csp-parse';
import keytar from 'keytar';

import { FileUtils, BDIpc, Config, WindowUtils, Updater, Editor, Database } from './modules';

const sparkplug = path.resolve(__dirname, 'sparkplug.js');

let configProxy;

const CSP = TESTS ? require('../src/csp.json') : require('./csp.json');

class Comms {
    constructor(bd) {
        this.bd = bd;
        this.initListeners();
    }

    initListeners() {
        BDIpc.on('ping', () => 'pong', true);

        BDIpc.on('bd-getConfig', () => this.bd.config.config, true);

        BDIpc.on('bd-sendToDiscord', (event, m) => this.sendToDiscord(m.channel, m.message), true);

        // BDIpc.on('bd-openCssEditor', (event, options) => this.bd.csseditor.openEditor(options), true);
        // BDIpc.on('bd-sendToCssEditor', (event, m) => this.sendToCssEditor(m.channel, m.message), true);
        // BDIpc.on('bd-openCssEditor', (event, options) => this.bd.editor.openEditor(options), true);

        BDIpc.on('bd-native-open', (event, options) => {
            dialog.showOpenDialog(OriginalBrowserWindow.fromWebContents(event.ipcEvent.sender), options, filenames => {
                event.reply(filenames);
            });
        });

        BDIpc.on('bd-native-save', (event, options) => {
            dialog.showSaveDialog(OriginalBrowserWindow.fromWebContents(event.ipcEvent.sender), options, filename => {
                event.reply(filename);
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

        BDIpc.on('bd-dba', (event, options) => this.bd.database.exec(options), true);

        BDIpc.on('bd-keytar-get', (event, { service, account }) => keytar.getPassword(service, account), true);
        BDIpc.on('bd-keytar-set', (event, { service, account, password }) => keytar.setPassword(service, account, password), true);
        BDIpc.on('bd-keytar-delete', (event, { service, account }) => keytar.deletePassword(service, account), true);
        BDIpc.on('bd-keytar-find-credentials', (event, { service }) => keytar.findCredentials(service), true);

        BDIpc.on('bd-readDataFile', async (event, fileName) => {
            const rf = await FileUtils.readFile(path.resolve(this.bd.config.getPath('data'), fileName));
            event.reply(rf);
        });

        BDIpc.on('bd-explorer', (_, _path) => {
            if (_path.static) _path = this.bd.config.getPath(_path.static);
            else if (_path.full) _path = _path.full;
            else if (_path.sub) _path = path.resolve(this.bd.config.getPath(_path.sub.base), [..._path.sub.subs]);
            try {
                shell.openItem(_path);
            } catch (err) {
                console.log(err);
            }
        });

        BDIpc.on('bd-getPath', (event, paths) => {
            event.reply(path.resolve(this.bd.config.getPath(paths[0]), ...paths.splice(1)));
        });

        BDIpc.on('bd-rmFile', async (event, paths) => {
            const fullPath = path.resolve(this.bd.config.getPath(paths[0]), ...paths.splice(1));
            try {
                await FileUtils.rm(fullPath);
                event.reply('ok');
            } catch (err) {
                event.reject(err);
            }
        });

        BDIpc.on('bd-rnFile', async (event, paths) => {
            const oldPath = path.resolve(this.bd.config.getPath(paths.oldName[0]), ...paths.oldName.splice(1));
            const newPath = path.resolve(this.bd.config.getPath(paths.newName[0]), ...paths.newName.splice(1));

            try {
                await FileUtils.rn(oldPath, newPath);
                event.reply('ok');
            } catch (err) {
                event.reject(err);
            }
        });
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

class BrowserWindow extends OriginalBrowserWindow {
    constructor(originalOptions) {
        const userOptions = BrowserWindow.userWindowPreferences;

        const options = deepmerge(originalOptions, userOptions);
        options.webPreferences = Object.assign({}, options.webPreferences);

        // Make sure Node integration is enabled
        options.webPreferences.preload = sparkplug;

        super(options);

        Object.defineProperty(this, '__bd_preload', { value: [] });

        if (originalOptions.webPreferences && originalOptions.webPreferences.preload) {
            this.__bd_preload.push(originalOptions.webPreferences.preload);
        }
        if (userOptions.webPreferences && userOptions.webPreferences.preload) {
            this.__bd_preload.push(path.resolve(configProxy().getPath('data'), userOptions.webPreferences.preload));
        }

        Object.defineProperty(this, '__bd_options', { value: options });
        Object.freeze(options);
        Object.freeze(options.webPreferences);
        Object.freeze(this.__bd_preload);
    }

    static get userWindowPreferences() {
        try {
            const userWindowPreferences = require(path.join(configProxy().getPath('data'), 'window'));
            if (typeof userWindowPreferences === 'object') return userWindowPreferences;
        } catch (err) {
            console.log('[BetterDiscord] Error getting window preferences:', err);
        }

        return {};
    }
}

// Some Electron APIs depend on browserWindow.constructor being BrowserWindow
Object.defineProperty(BrowserWindow.prototype, 'constructor', {
    value: OriginalBrowserWindow
});

export class BetterDiscord {

    get comms() { return this._comms ? this._comms : (this._commas = new Comms(this)); }
    get database() { return this._db ? this._db : (this._db = new Database(this.config.getPath('data'))); }
    get config() { return this._config ? this._config : (this._config = new Config(this._args)); }
    get window() { return this.windowUtils ? this.windowUtils.window : undefined; }
    get editor() { return this._editor ? this._editor : (this._editor = new Editor(this, this.config.getPath('editor'))); }
    get updater() { return this._updater ? this._updater : (this._updater = new Updater(this)); }
    get sendToDiscord() { return this.windowUtils.send; }

    constructor(...args) {
        if (TESTS) args.unshift(TEST_ARGS());

        args = deepmerge.all(args);

        console.log('[BetterDiscord|args] ', JSON.stringify(args, null, 4));

        if (BetterDiscord.loaded) {
            console.log('[BetterDiscord] Creating two BetterDiscord objects???');
            return null;
        }

        BetterDiscord.loaded = true;
        this._args = args;
        this.config.compatibility();

        this.bindings();
        this.extraPaths();
        this.parseClientPackage();
        this.parseEditorPackage();
        this.parseCorePackage();

        configProxy = () => this.config;
        const autoInitComms = this.comms;
        const autoInitEditor = this.editor;
        this.updater.start();
        this.init();
    }

    bindings() {
        this.injectScripts = this.injectScripts.bind(this);
        this.ignite = this.ignite.bind(this);
        this.ensureDirectories = this.ensureDirectories.bind(this);
    }

    async init() {
        console.log('[BetterDiscord] init');
        await this.waitForWindowUtils();
        await this.ensureDirectories();

        this.windowUtils.on('did-finish-load', () => this.injectScripts(true));

        this.windowUtils.on('did-navigate-in-page', (event, url, isMainFrame) => {
            this.windowUtils.send('did-navigate-in-page', { event, url, isMainFrame });
        });

        setTimeout(() => {
            this.injectScripts();
            if (TEST_EDITOR) this.editor.openEditor({});
        }, 500);
    }

    async ensureDirectories() {
        await FileUtils.ensureDirectory(this.config.getPath('ext'));
        await FileUtils.ensureDirectory(this.config.getPath('userdata'));
        await Promise.all([
            FileUtils.ensureDirectory(this.config.getPath('plugins')),
            FileUtils.ensureDirectory(this.config.getPath('themes')),
            FileUtils.ensureDirectory(this.config.getPath('modules')),
            FileUtils.ensureDirectory(this.config.getPath('userfiles'))
        ]);
    }

    async waitForWindowUtils() {
        if (this.windowUtils) return this.windowUtils;
        const window = await this.waitForWindow();
        return this.windowUtils = new WindowUtils({ window });
    }

    /**
     * Wait for Discord to load before doing any injection
     */
    async waitForWindow() {
        return new Promise(resolve => {
            const defer = setInterval(() => {
                const windows = OriginalBrowserWindow.getAllWindows();

                if (windows.length === 1 && windows[0].webContents.getURL().includes('discordapp.com')) {
                    resolve(windows[0]);
                    clearInterval(defer);
                }
            }, 10);
        });
    }

    /**
     * Parses the package.json of client script into config
     */
    parseClientPackage() {
        const clientPath = this.config.getPath('client');
        const clientPkg = TESTS ? require(`${path.resolve(clientPath, '..')}/package.json`) : require(`${clientPath}/package.json`);
        const { version } = clientPkg;
        const main = TESTS ? 'betterdiscord.client.js' : clientPkg.main;
        this.config.addPath('client_script', `${clientPath}/${main}`);
        this.config.setClientVersion(version);
        console.log(`[BetterDiscord] Client v${this.config.clientVersion} - ${this.config.getPath('client_script')}`);
    }

    parseCorePackage() {
        const corePath = this.config.getPath('core');
        const corePkg = TESTS ? require(`${path.resolve(corePath, '..')}/package.json`) : require(`${corePath}/package.json`);
        const { version } = corePkg;
        this.config.setCoreVersion(version);
    }

    parseEditorPackage() {
        const editorPath = this.config.getPath('editor');
        const editorPkg = TESTS ? require(`${path.resolve(editorPath, '..')}/package.json`) : require(`${editorPath}/package.json`);
        const { version } = editorPkg;
        this.config.setEditorVersion(version);
    }

    /**
     * Add extra paths to config
     */
    extraPaths() {
        const base = path.resolve(this.config.getPath('data'), '..');
        const userdata = path.resolve(base, 'userdata');
        const ext = path.resolve(base, 'ext');
        const plugins = path.resolve(ext, 'plugins');
        const themes = path.resolve(ext, 'themes');
        const modules = path.resolve(ext, 'modules');
        const userfiles = path.resolve(userdata, 'files');
        const snippets = path.resolve(userdata, 'snippets.json');

        this.config.addPath('base', base);
        this.config.addPath('ext', ext);
        this.config.addPath('plugins', plugins);
        this.config.addPath('themes', themes);
        this.config.addPath('modules', modules);
        this.config.addPath('userdata', userdata);
        this.config.addPath('userfiles', userfiles);
        this.config.addPath('snippets', snippets);
        if (!this.config.getPath('editor')) this.config.addPath('editor', path.resolve(base, 'editor'));

        if (!this.config.getPath('tmp')) this.config.addPath('tmp', process.platform !== 'win32' ?
            path.join(os.tmpdir(), 'betterdiscord', `${process.getuid()}`) :
            path.join(os.tmpdir(), 'betterdiscord'));
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
        console.log(`[BetterDiscord] injecting ${this.config.getPath('client_script')}. Reload: ${reload}`);
        return this.windowUtils.injectScript(this.config.getPath('client_script'));
    }

    /**
     * Patches Electron's BrowserWindow so all windows have Node integration enabled.
     * This needs to be called only once before the main window is created (or BrowserWindow is put in a variable).
     * Basically BetterDiscord needs to load before discord_desktop_core.
     */
    static patchBrowserWindow() {
        console.log('[BetterDiscord] patching BrowserWindow');
        const electron = require('electron');
        const electron_path = require.resolve('electron');
        Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific ones
        const newElectron = Object.assign({}, electron, { BrowserWindow });
        require.cache[electron_path].exports = newElectron;
    }

    /**
     * Attaches an event handler for HTTP requests to update the Content Security Policy.
     */
    static hookSessionRequest() {
        console.log('[BetterDiscord] hook session request');
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
