/**
 * BetterDiscord Array Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeManager } from 'modules';
import { Utils } from 'common';
import Setting from './basesetting';
import SettingsSet from '../settingsset';
import SettingsCategory from '../settingscategory';
import SettingsScheme from '../settingsscheme';
import { SettingsUpdatedEvent } from 'structs';

export default class ArraySetting extends Setting {

    constructor(args, ...merge) {
        super(args, ...merge);

        this.args.categories = this.categories.map(category => new SettingsCategory(category));
        this.args.schemes = this.schemes.map(scheme => new SettingsScheme(scheme));
        this.args.items = this.value ? this.value.map(item => this.createItem(item.args || item)) : [];

        this._setValue(this.getValue());
    }

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return [];
    }

    /**
     * An array of sets currently in this array setting.
     */
    get items() {
        return this.args.items || [];
    }

    set items(items) {
        this.args.items = items ? items.map(item => this.createItem(item)) : [];
        this.updateValue();
    }

    /**
     * Whether the setting should take the full width of the settings panel.
     * This is always false for array settings.
     */
    get fullwidth() {
        return false;
    }

    /**
     * An array of SettingsCategory objects that each set in this setting should have.
     */
    get categories() {
        return this.args.categories || this.args.settings || [];
    }

    get settings() {
        return this.categories;
    }

    /**
     * An array of SettingsScheme objects that can be used in this array's sets.
     */
    get schemes() {
        return this.args.schemes || [];
    }

    /**
     * Whether to display this array setting's sets inline instead of opening them in a modal.
     */
    get inline() {
        return this.args.inline || false;
    }

    /**
     * Whether to allow opening this array setting's sets in a modal.
     * This is always true when inline is false.
     */
    get allow_external() {
        return this.args.allow_external || !this.inline;
    }

    /**
     * The minimum amount of sets the user may create.
     * This only restricts deleting sets when there is less or equal sets than this, and does not ensure that this number of items actually exists.
     */
    get min() {
        return this.args.min || 0;
    }

    /**
     * The maximum amount of sets the user may create.
     */
    get max() {
        return this.args.max || null;
    }

    /**
     * Adds a new set to this array setting.
     * This ignores the maximum value.
     * @param {SettingsSet} item Values to merge into the new set (optional)
     * @return {SettingsSet} The new set
     */
    async addItem(_item) {
        const item = this.createItem(_item);
        this.args.items.push(item);
        await this.updateValue();

        await this.emit('item-added', { item });

        return item;
    }

    /**
     * Removes a set from this array setting.
     * This ignores the minimum value.
     * @param {SettingsSet} item The set to remove
     * @return {Promise}
     */
    async removeItem(item) {
        this.args.items = this.items.filter(i => i !== item);
        await this.updateValue();

        await this.emit('item-removed', { item });
    }

    /**
     * Creates a new set for this array setting.
     * @param {SettingsSet} item Values to merge into the new set (optional)
     * @return {SettingsSet} The new set
     */
    createItem(item) {
        if (item instanceof SettingsSet)
            return item;

        const set = new SettingsSet({
            id: item ? item.args ? item.args.id : item.id : Math.random(),
            categories: this.categories.map(c => c.clone()),
            schemes: this.schemes
        }, item ? item.args || item : undefined);

        set.setSaved();
        set.on('settings-updated', async event => {
            await this.emit('item-updated', { item: set, event, updatedSettings: event.updatedSettings });
            if (event.args.updating_array !== this) await this.updateValue();
        });
        return set;
    }

    /**
     * Function to be called after the value changes.
     * This can be overridden by other settings types.
     * This function is used when the value needs to be updated synchronously (basically just in the constructor - so there won't be any events to emit anyway).
     * @param {SettingUpdatedEvent} updatedSetting
     */
    setValueHookSync(updatedSetting) {
        this.args.items = updatedSetting.value ? updatedSetting.value.map(item => this.createItem(item)) : [];
    }

    /**
     * Function to be called after the value changes.
     * This can be overridden by other settings types.
     * @param {SettingUpdatedEvent} updatedSetting
     */
    async setValueHook(updatedSetting) {
        const newItems = [];
        let error;

        for (const newItem of updatedSetting.value) {
            try {
                const item = this.items.find(i => i.id && i.id === newItem.id);

                if (item) {
                    // Merge the new item into the original item
                    newItems.push(item);
                    const updatedSettings = await item.merge(newItem, false);
                    if (!updatedSettings.length) continue;

                    const event = new SettingsUpdatedEvent({
                        updatedSettings,
                        updating_array: this
                    });

                    await item.emit('settings-updated', event);
                    // await this.emit('item-updated', { item, event, updatedSettings });
                } else {
                    // Add a new item
                    const item = this.createItem(newItem);
                    newItems.push(item);
                    await this.emit('item-added', { item });
                }
            } catch (e) { error = e; }
        }

        for (const item of this.items) {
            if (newItems.includes(item)) continue;

            try {
                // Item removed
                await this.emit('item-removed', { item });
            } catch (e) { error = e; }
        }

        this.args.items = newItems;

        // We can't throw anything before the items array is updated, otherwise the array setting would be in an inconsistent state where the values in this.items wouldn't match the values in this.value
        if (error) throw error;
    }

    /**
     * Updates the value of this array setting.
     * This only exists for use by array settings.
     * @return {Promise}
     */
    getValue() {
        return this.items.map(item => {
            if (!item) return;
            item.setSaved();
            return item.strip();
        });
    }

    /**
     * Updates the value of this array setting.
     * This only exists for use by array settings.
     * @return {Promise}
     */
    updateValue(emit_multi = true, emit = true) {
        return this.setValue(this.getValue(), emit_multi, emit);
    }

    /**
     * Sets the path of the plugin/theme this setting is part of.
     * This is passed to this array setting's settings.
     * @param {String} contentPath The plugin/theme's directory path
     */
    setContentPath(contentPath) {
        this.args.path = contentPath;

        for (const category of this.categories) {
            for (const setting of category.settings) {
                setting.setContentPath(contentPath);
            }
        }

        for (const scheme of this.schemes) {
            scheme.setContentPath(contentPath);
        }
    }

    /**
     * Returns a representation of this setting's value in SCSS.
     * @return {Promise}
     */
    async toSCSS() {
        const maps = [];
        for (const item of this.items)
            maps.push(await ThemeManager.getConfigAsSCSSMap(item));

        // Final comma ensures the variable is a list
        return maps.length ? `${maps.join(', ')},` : '()';
    }

}
