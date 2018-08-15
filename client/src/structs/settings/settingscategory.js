/**
 * BetterDiscord Settings Category Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';
import { ClientLogger as Logger, AsyncEventEmitter } from 'common';
import Setting from './setting';
import BaseSetting from './types/basesetting';
import SettingsProxy from './settingsproxy';

export default class SettingsCategory extends AsyncEventEmitter {

    constructor(args, ...merge) {
        super();

        if (typeof args === 'string')
            args = {id: args};
        this.args = args.args || args || {};

        this.args.id = this.args.id || this.args.category || 'default';
        this.args.name = this.args.name || this.args.category_name || this.id;
        this.type = this.args.type;

        this.args.settings = this.settings.map(setting => new Setting(setting));

        for (const newCategory of merge) {
            this._merge(newCategory);
        }

        this.__settingUpdated = this.__settingUpdated.bind(this);
        this.__settingsUpdated = this.__settingsUpdated.bind(this);

        for (const setting of this.settings) {
            setting.on('setting-updated', this.__settingUpdated);
            setting.on('settings-updated', this.__settingsUpdated);
        }
    }

    /**
     * Category ID
     */
    get id() {
        return this.args.id || this.args.category;
    }

    get category() {
        return this.id;
    }

    /**
     * Category name
     */
    get name() {
        return this.args.name || this.args.category_name;
    }

    get category_name() {
        return this.name;
    }

    set name(value) {
        this.args.name = value;
    }

    /**
     * Category type
     * Currently either "drawer", "static", or undefined.
     */
    get type() {
        return this.args.type;
    }

    set type(value) {
        if (!value) this.args.type = undefined;
        else if (value === 'drawer' || value === 'static')
            this.args.type = value;
        else throw {message: `Invalid category type ${value}`};
    }

    /**
     * An array of settings in this category.
     */
    get settings() {
        return this.args.settings || [];
    }

    /**
     * Whether any setting in this category has been changed.
     */
    get changed() {
        if (this.settings.find(setting => setting.changed)) return true;
        return false;
    }

    /**
     * Setting event listeners.
     * This only exists for use by the constructor and settingscategory.addSetting.
     */
    __settingUpdated({ setting, value, old_value }) {
        return this.emit('setting-updated', new SettingUpdatedEvent({
            category: this, category_id: this.id,
            setting, setting_id: setting.id,
            value, old_value
        }));
    }

    __settingsUpdated({ updatedSettings }) {
        return this.emit('settings-updated', new SettingsUpdatedEvent({
            updatedSettings: updatedSettings.map(updatedSetting => new SettingUpdatedEvent(Object.assign({
                category: this, category_id: this.id
            }, updatedSetting)))
        }));
    }

    /**
     * Dynamically adds a setting to this category.
     * @param {Setting} category The setting to add to this category
     * @param {Number} index The index to add the setting at (optional)
     * @return {Promise}
     */
    async addSetting(setting, index) {
        if (this.settings.find(s => s === setting)) return;

        if (!(setting instanceof BaseSetting))
            setting = new Setting(setting);

        if (this.getSetting(setting.id))
            throw {message: 'A setting with this ID already exists.'};

        setting.on('setting-updated', this.__settingUpdated);
        setting.on('settings-updated', this.__settingsUpdated);

        if (index === undefined) index = this.settings.length;
        this.settings.splice(index, 0, setting);

        const event = {
            category: this, category_id: this.id,
            setting, setting_id: setting.id,
            at_index: index
        };

        await setting.emit('added-to', event);
        await this.emit('added-setting', event);
        return setting;
    }

    /**
     * Dynamically removes a setting from this category.
     * @param {Setting} setting The setting to remove from this category
     * @return {Promise}
     */
    async removeSetting(setting) {
        setting.off('setting-updated', this.__settingUpdated);
        setting.off('settings-updated', this.__settingsUpdated);

        let index;
        while ((index = this.settings.findIndex(s => s === setting)) > -1) {
            this.settings.splice(index, 0);
        }

        const event = {
            set: this, set_id: this.id,
            category: this, category_id: this.id,
            from_index: index
        };

        await setting.emit('removed-from', event);
        await this.emit('removed-category', event);
    }

    /**
     * Returns a proxy which can be used to access the category's values like a normal object.
     * @return {SettingsCategoryProxy}
     */
    get proxy() {
        return this._proxy || (this._proxy = SettingsProxy.createProxy(this));
    }

    /**
     * Returns the first setting where calling {function} returns true.
     * @param {Function} function A function to call to filter settings
     * @return {Setting}
     */
    find(f) {
        return this.settings.find(f);
    }

    /**
     * Returns all settings where calling {function} returns true.
     * @param {Function} function A function to call to filter settings
     * @return {Array} An array of matching Setting objects
     */
    findSettings(f) {
        return this.settings.filter(f);
    }

    /**
     * Returns the setting with the ID {id}.
     * @param {String} id The ID of the setting to look for
     * @return {Setting}
     */
    getSetting(id) {
        return this.find(setting => setting.id === id);
    }

    /**
     * Merges a category into this category without emitting events (and therefore synchronously).
     * This only exists for use by the constructor and SettingsSet.
     */
    _merge(newCategory) {
        let updatedSettings = [];

        for (const newSetting of newCategory.settings) {
            const setting = this.settings.find(setting => setting.id === newSetting.id);
            if (!setting) {
                Logger.warn('SettingsCategory', `Trying to merge setting ${this.id}/${newSetting.id}, which does not exist.`);
                continue;
            }

            const updatedSetting = setting._merge(newSetting);
            if (!updatedSetting) continue;
            updatedSettings = updatedSettings.concat(updatedSetting.map(({ setting, value, old_value }) => ({
                category: this, category_id: this.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
        }

        return updatedSettings;
    }

    /**
     * Merges another category into this category.
     * @param {SettingsCategory} newCategory The category to merge into this category
     * @return {Promise}
     */
    async merge(newCategory, emit_multi = true) {
        let updatedSettings = [];

        for (const newSetting of newCategory.settings) {
            const setting = this.settings.find(setting => setting.id === newSetting.id);
            if (!setting) {
                Logger.warn('SettingsCategory', `Trying to merge setting ${this.id}/${newSetting.id}, which does not exist.`);
                continue;
            }

            const updatedSetting = await setting.merge(newSetting, false);
            if (!updatedSetting) continue;
            updatedSettings = updatedSettings.concat(updatedSetting.map(({ setting, value, old_value }) => ({
                category: this, category_id: this.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
        }

        if (emit_multi)
            await this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings
            }));

        return updatedSettings;
    }

    /**
     * Marks all settings in this set as saved (not changed).
     */
    setSaved() {
        for (const setting of this.settings) {
            setting.setSaved();
        }
    }

    /**
     * Returns an object that can be stored as JSON and later merged back into a category with settingscategory.merge.
     * @return {Object}
     */
    strip() {
        return {
            category: this.category,
            settings: this.settings.map(setting => setting.strip())
        };
    }

    /**
     * Returns a copy of this category that can be changed and then merged back into a set with settingscategory.merge.
     * @param {SettingsCategory} ...merge A set to merge into the new set
     * @return {SettingsCategory}
     */
    clone(...merge) {
        return new SettingsCategory({
            id: this.id,
            category: this.id,
            name: this.name,
            category_name: this.category_name,
            type: this.type,
            settings: this.settings.map(setting => setting.clone())
        }, ...merge);
    }

}
