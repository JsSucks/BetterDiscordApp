/**
 * BetterDiscord Settings Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Toasts } from 'ui';
import { EmoteModule } from 'builtin';
import { SettingsSet, SettingUpdatedEvent } from 'structs';
import { Utils, FileUtils, ClientLogger as Logger } from 'common';
import path from 'path';
import Globals from './globals';
import CssEditor from './csseditor';
import Events from './events';
import defaultSettings from '../data/user.settings.default';

export default new class Settings {

    constructor() {
        this.settings = defaultSettings.map(_set => {
            const set = new SettingsSet(_set);

            set.on('setting-updated', event => {
                const { category, setting, value, old_value } = event;
                Logger.log('Settings', [`${set.id}/${category.id}/${setting.id} was changed from`, old_value, 'to', value]);
                Events.emit('setting-updated', event);
                Events.emit(`setting-updated-${set.id}_${category.id}_${setting.id}`, event);
				Toasts.success(`${set.id}/${category.id}/${setting.id} was changed from ${old_value} to ${value}`); // Just for debugging purposes remove in prod
            });

            set.on('settings-updated', async event => {
                if (!event.data || !event.data.dont_save) await this.saveSettings();
                Events.emit('settings-updated', event);
            });

            return set;
        });
    }

    /**
     * Loads BetterDiscord's settings.
     */
    async loadSettings() {
        Logger.log('Settings', ['Loading settings']);

        try {
            await FileUtils.ensureDirectory(this.dataPath);

            const settingsPath = path.resolve(this.dataPath, 'user.settings.json');
            const user_config = await FileUtils.readJsonFromFile(settingsPath);
            const { settings, scss, css, css_editor_files, scss_error, css_editor_bounds, favourite_emotes } = user_config;

            for (let set of this.settings) {
                const newSet = settings.find(s => s.id === set.id);
                if (!newSet) continue;
                await set.merge(newSet, {dont_save: true});
                set.setSaved();
            }

            CssEditor.setState(scss, css, css_editor_files, scss_error);
            CssEditor.editor_bounds = css_editor_bounds || {};
            EmoteModule.favourite_emotes = favourite_emotes;
        } catch (err) {
            // There was an error loading settings
            // This probably means that the user doesn't have any settings yet
            Logger.warn('Settings', ['Failed to load internal settings', err]);
        }
    }

    /**
     * Saves BetterDiscord's settings including CSS editor data.
     */
    async saveSettings() {
        Logger.log('Settings', ['Saving settings']);

        try {
            await FileUtils.ensureDirectory(this.dataPath);

            const settingsPath = path.resolve(this.dataPath, 'user.settings.json');
            await FileUtils.writeJsonToFile(settingsPath, {
                settings: this.settings.map(set => set.strip()),
                scss: CssEditor.scss,
                css: CssEditor.css,
                css_editor_files: CssEditor.files,
                scss_error: CssEditor.error,
                css_editor_bounds: CssEditor.editor_bounds,
                favourite_emotes: EmoteModule.favourite_emotes
            });

            for (let set of this.settings) {
                set.setSaved();
            }
        } catch (err) {
            // There was an error saving settings
            Logger.err('Settings', err);
            throw err;
        }
    }

    /**
     * Finds one of BetterDiscord's settings sets.
     * @param {String} set_id The ID of the set to find
     * @return {SettingsSet}
     */
    getSet(set_id) {
        return this.settings.find(s => s.id === set_id);
    }

    get core() { return this.getSet('core') }
    get ui() { return this.getSet('ui') }
    get emotes() { return this.getSet('emotes') }
    get css() { return this.getSet('css') }
    get security() { return this.getSet('security') }

    /**
     * Finds a category in one of BetterDiscord's settings sets.
     * @param {String} set_id The ID of the set to look in
     * @param {String} category_id The ID of the category to find
     * @return {SettingsCategory}
     */
    getCategory(set_id, category_id) {
        const set = this.getSet(set_id);
        return set ? set.getCategory(category_id) : undefined;
    }

    /**
     * Finds a setting in one of BetterDiscord's settings sets.
     * @param {String} set_id The ID of the set to look in
     * @param {String} category_id The ID of the category to look in
     * @param {String} setting_id The ID of the setting to find
     * @return {Setting}
     */
    getSetting(set_id, category_id, setting_id) {
        const set = this.getSet(set_id);
        return set ? set.getSetting(category_id, setting_id) : undefined;
    }

    /**
     * Returns a setting's value in one of BetterDiscord's settings sets.
     * @param {String} set_id The ID of the set to look in
     * @param {String} category_id The ID of the category to look in
     * @param {String} setting_id The ID of the setting to find
     * @return {Any}
     */
    get(set_id, category_id, setting_id) {
        const set = this.getSet(set_id);
        return set ? set.get(category_id, setting_id) : undefined;
    }

    /**
     * The path to store user data in.
     */
    get dataPath() {
        return Globals.getPath('data');
    }

}
