/**
 * BetterDiscord Content Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, ClientLogger as Logger, AsyncEventEmitter } from 'common';
import { Modals } from 'ui';
import Database from './database';

export default class Content extends AsyncEventEmitter {

    constructor(internals) {
        super();

        internals.loaded = Date.now();
        internals.started = undefined;
        internals.stopped = undefined;

        Utils.deepfreeze(internals.info);
        Object.freeze(internals.paths);

        this.__internals = internals;

        this.settings.on('setting-updated', event => this.emit('setting-updated', event));
        this.settings.on('settings-updated', event => this.emit('settings-updated', event));
        this.settings.on('settings-updated', event => this.__settingsUpdated(event));

        // Add hooks
        if (this.onstart) this.on('start', event => this.onstart(event));
        if (this.onStart) this.on('start', event => this.onStart(event));
        if (this.onstop) this.on('stop', event => this.onstop(event));
        if (this.onStop) this.on('stop', event => this.onStop(event));
        if (this.onunload) this.on('unload', event => this.onunload(event));
        if (this.onUnload) this.on('unload', event => this.onUnload(event));
        if (this.settingUpdated) this.on('setting-updated', event => this.settingUpdated(event));
        if (this.settingsUpdated) this.on('settings-updated', event => this.settingsUpdated(event));
    }

    get type() { return undefined }
    get configs() { return this.__internals.configs }
    get info() { return this.__internals.info }
    get paths() { return this.__internals.paths }
    get main() { return this.__internals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get configSchemes() { return this.configs.schemes }
    get id() { return this.info.id || this.name.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-') }
    get name() { return this.info.name }
    get icon() { return this.info.icon }
    get description() { return this.info.description }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get loadedTimestamp() { return this.__internals.loaded }
    get startedTimestamp() { return this.__internals.started }
    get stoppedTimestamp() { return this.__internals.stopped }
    get contentPath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get settings() { return this.userConfig.config }
    get config() { return this.settings.categories }
    get data() { return this.userConfig.data || (this.userConfig.data = {}) }

    get packed() { return this.dirName.packed }
    get packagePath() { return this.dirName.packagePath }
    get packageName() { return this.dirName.pkg }

    /**
     * Opens a settings modal for this content.
     * @return {Modal}
     */
    showSettingsModal() {
        return Modals.contentSettings(this);
    }

    /**
     * Whether this content has any settings.
     */
    get hasSettings() {
        return !!this.settings.findSetting(() => true);
    }

    /**
     * Saves the content's current configuration.
     * @return {Promise}
     */
    async saveConfiguration() {
        try {
            Database.insertOrUpdate({ type: `${this.type}-config`, id: this.id }, {
                type: `${this.type}-config`,
                id: this.id,
                enabled: this.enabled,
                config: this.settings.strip().settings,
                data: this.data
            });
            this.settings.setSaved();
        } catch (err) {
            Logger.err(this.name, ['Failed to save configuration', err]);
            throw err;
        }
    }

    /**
     * Called when settings are updated.
     * This can be overridden by other content types.
     */
    __settingsUpdated(event) {
        return this.saveConfiguration();
    }

    /**
     * Enables the content.
     * @param {Boolean} save Whether to save the new enabled state
     * @return {Promise}
     */
    async enable(save = true) {
        if (this.enabled || this.unloaded) return;
        await this.emit('enable');
        await this.emit('start');

        this.__internals.started = Date.now();
        this.__internals.stopped = undefined;
        this.userConfig.enabled = true;
        if (save) await this.saveConfiguration();
    }

    /**
     * Disables the content.
     * @param {Boolean} save Whether to save the new enabled state
     * @return {Promise}
     */
    async disable(save = true) {
        if (!this.enabled) return;
        await this.emit('stop');
        await this.emit('disable');

        this.__internals.started = undefined;
        this.__internals.stopped = Date.now();
        this.userConfig.enabled = false;
        if (save) await this.saveConfiguration();
    }

}

Object.freeze(Content.prototype);
