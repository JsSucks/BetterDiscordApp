/**
 * BetterDiscord CSS Editor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM } from 'ui';
import { FileUtils, ClientLogger as Logger, ClientIPC } from 'common';
import path from 'path';
import electron from 'electron';
import filewatcher from 'filewatcher';
import Settings from './settings';

/**
 * Custom css editor communications
 */
export default new class {

    constructor() {
        this._scss = '';
        this._css = '';
        this._error = undefined;
        this.editor_bounds = undefined;
        this._files = undefined;
        this._filewatcher = undefined;
        this._watchfiles = undefined;
        this.compiling = false;
    }

    /**
     * Init css editor.
     */
    init() {
        ClientIPC.on('bd-get-scss', () => this.scss, true);
        ClientIPC.on('bd-update-scss', (e, scss) => this.updateScss(scss));
        ClientIPC.on('bd-save-csseditor-bounds', (e, bounds) => this.saveEditorBounds(bounds));

        ClientIPC.on('bd-save-scss', async (e, scss) => {
            await this.updateScss(scss);
            await this.save();
        }, true);

        this.liveupdate = Settings.getSetting('css', 'default', 'live-update');
        this.liveupdate.on('setting-updated', event => {
            this.sendToEditor('set-liveupdate', event.value);
        });

        ClientIPC.on('bd-get-liveupdate', () => this.liveupdate.value, true);
        ClientIPC.on('bd-set-liveupdate', (e, value) => this.liveupdate.value = value);

        this.watchfilessetting = Settings.getSetting('css', 'default', 'watch-files');
        this.watchfilessetting.on('setting-updated', event => {
            if (event.value) this.watchfiles = this.files;
            else this.watchfiles = [];
        });
    }

    /**
     * Show css editor, flashes if already visible.
     */
    async show() {
        await ClientIPC.send('openCssEditor', this.editor_bounds);
    }

    /**
     * Update css in client.
     * @param {String} scss SCSS to compile
     * @param {bool} sendSource Whether to send to css editor instance
     */
    async updateScss(scss, sendSource) {
        if (sendSource)
            this.sendToEditor('set-scss', scss);

        if (!scss && !await this.fileExists()) {
            this._scss = this.css = '';
            this.sendToEditor('scss-error', null);
            return;
        }

        try {
            this.compiling = true;
            const result = await this.compile(scss);
            this.css = result.css.toString();
            this._scss = scss;
            this.files = result.stats.includedFiles;
            this.error = null;
            this.compiling = false;
        } catch (err) {
            this.compiling = false;
            this.error = err;
            throw err;
        }
    }

    /**
     * Save css to file.
     * @return {Promise}
     */
    save() {
        return Settings.saveSettings();
    }

    /**
     * Save current editor bounds.
     * @param {Rectangle} bounds Editor bounds
     * @return {Promise}
     */
    saveEditorBounds(bounds) {
        this.editor_bounds = bounds;
        return Settings.saveSettings();
    }

    /**
     * Send SCSS to core for compilation.
     * @param {String} scss SCSS string
     */
    async compile(scss) {
        return ClientIPC.send('bd-compileSass', {
            data: scss,
            path: await this.fileExists() ? this.filePath : undefined
        });
    }

    /**
     * Recompile the current SCSS.
     * @return {Promise}
     */
    async recompile() {
        return this.updateScss(this.scss);
    }

    /**
     * Send data to open editor.
     * @param {String} channel
     * @param {Any} data
     * @return {Promise}
     */
    async sendToEditor(channel, data) {
        return ClientIPC.sendToCssEditor(channel, data);
    }

    /**
     * Opens an SCSS file in a system editor.
     * @return {Promise}
     */
    async openSystemEditor() {
        try {
            await FileUtils.fileExists(this.filePath);
        } catch (err) {
            // File doesn't exist
            // Create it
            await FileUtils.writeFile(this.filePath, '');
        }

        Logger.log('CSS Editor', `Opening file ${this.filePath} in the user's default editor.`);

        // For some reason this doesn't work
        // if (!electron.shell.openItem(this.filePath))
        if (!electron.shell.openExternal(`file://${this.filePath}`))
            throw {message: 'Failed to open system editor.'};
    }

    /**
     * Set current state
     * @param {String} scss Current uncompiled SCSS
     * @param {String} css Current compiled CSS
     * @param {String} files Files imported in the SCSS
     * @param {String} err Current compiler error
     */
    setState(scss, css, files, err) {
        this._scss = scss;
        this.sendToEditor('set-scss', scss);
        this.css = css;
        this.files = files;
        this.error = err;
    }

    /**
     * Current uncompiled scss.
     */
    get scss() {
        return this._scss || '';
    }

    /**
     * Set current scss.
     */
    set scss(scss) {
        this.updateScss(scss, true);
    }

    /**
     * Current compiled css.
     */
    get css() {
        return this._css || '';
    }

    /**
     * Inject compiled css to head.
     */
    set css(css) {
        this._css = css;
        DOM.injectStyle(css, 'bd-customcss');
    }

    /**
     * Current error.
     */
    get error() {
        return this._error || undefined;
    }

    /**
     * Set current error.
     */
    set error(err) {
        this._error = err;
        this.sendToEditor('scss-error', err);
    }

    /**
     * An array of files that are imported in custom CSS.
     * @return {Array} Files being watched
     */
    get files() {
        return this._files || (this._files = []);
    }

    /**
     * Sets all files that are imported in custom CSS.
     * @param {Array} files Files to watch
     */
    set files(files) {
        this._files = files;
        if (Settings.get('css', 'default', 'watch-files'))
            this.watchfiles = files;
    }

    /**
     * A filewatcher instance.
     */
    get filewatcher() {
        if (this._filewatcher) return this._filewatcher;
        this._filewatcher = filewatcher();
        this._filewatcher.on('change', (file, stat) => {
            // Recompile SCSS
            this.recompile();
        });
        return this._filewatcher;
    }

    /**
     * An array of files that are being watched for changes.
     * @return {Array} Files being watched
     */
    get watchfiles() {
        return this._watchfiles || (this._watchfiles = []);
    }

    /**
     * Sets all files to be watched.
     * @param {Array} files Files to watch
     */
    set watchfiles(files) {
        for (const file of files) {
            if (!this.watchfiles.includes(file)) {
                this.filewatcher.add(file);
                this.watchfiles.push(file);
                Logger.log('CSS Editor', `Watching file ${file} for changes`);
            }
        }

        for (const index in this.watchfiles) {
            let file = this.watchfiles[index];
            while (file && !files.find(f => f === file)) {
                this.filewatcher.remove(file);
                this.watchfiles.splice(index, 1);
                Logger.log('CSS Editor', `No longer watching file ${file} for changes`);
                file = this.watchfiles[index];
            }
        }
    }

    /**
     * The path of the file the system editor should save to.
     * @return {String}
     */
    get filePath() {
        return path.join(Settings.dataPath, 'user.scss');
    }

    /**
     * Checks if the system editor's file exists.
     * @return {Promise}
     */
    async fileExists() {
        try {
            await FileUtils.fileExists(this.filePath);
            return true;
        } catch (err) {
            return false;
        }
    }

}
