/**
 * BetterDiscord Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeManager } from 'modules';
import { Utils, AsyncEventEmitter } from 'common';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';

export default class Setting extends AsyncEventEmitter {

    constructor(args, ...merge) {
        super();
        this.args = args.args || args;

        this.args.id = this.args.id || 'default';
        this.args.text = this.args.text || undefined;
        this.args.hint = this.args.hint || undefined;
        this.args.path = this.args.path || undefined;
        this.args.disabled = !!this.args.disabled;
        this.args.fullwidth = !!this.args.fullwidth;

        if (!this.args.hasOwnProperty('value'))
            this.args.value = this.defaultValue;
        if (!this.args.hasOwnProperty('saved_value'))
            this.args.saved_value = this.args.value;

        for (const newSetting of merge) {
            this._merge(newSetting);
        }

        this.changed = !Utils.compare(this.args.value, this.args.saved_value);
    }

    /**
     * Setting ID
     */
    get id() {
        return this.args.id;
    }

    /**
     * Setting type
     * This defines how this class will be extended.
     */
    get type() {
        return this.args.type;
    }

    /**
     * The current value.
     */
    get value() {
        return this.args.value;
    }

    set value(value) {
        this.setValue(value);
    }

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return undefined;
    }

    /**
     * Setting name
     */
    get text() {
        return this.args.text;
    }

    set text(value) {
        this.args.text = value;
    }

    /**
     * Text to be displayed with the setting.
     */
    get hint() {
        return this.args.hint;
    }

    set hint(value) {
        this.args.hint = value;
    }

    /**
     * The path of the plugin/theme this setting is part of.
     * Used by settings of type "array", "custom" and "file".
     * Use set/category/setting.setContentPath to change.
     */
    get path() {
        return this.args.path;
    }

    /**
     * Whether the user should be able to change the value of the setting.
     * This does not prevent the setting being changed by a plugin.
     */
    get disabled() {
        return this.args.disabled || false;
    }

    set disabled(value) {
        this.args.disabled = !!value;
    }

    /**
     * Whether the setting should take the full width of the settings panel.
     * This is only customisable in some setting types.
     */
    get fullwidth() {
        return this.args.fullwidth || false;
    }

    set fullwidth(value) {
        this.args.fullwidth = !!value;
    }

    /**
     * Merges a setting into this setting without emitting events (and therefore synchronously).
     * This only exists for use by the constructor and SettingsCategory.
     */
    _merge(newSetting, hook = true) {
        const value = newSetting.args ? newSetting.args.value : newSetting.value;
        return this._setValue(value, hook);
    }

    /**
     * Merges another setting into this setting.
     * @param {SettingsSetting} newSetting The setting to merge into this setting
     * @return {Promise}
     */
    async merge(newSetting, emit_multi = true, emit = true) {
        const updatedSettings = this._merge(newSetting, false);
        if (!updatedSettings.length) return [];

        await this.setValueHook(updatedSettings[0]);

        if (emit)
            await this.emit('setting-updated', updatedSettings[0]);

        if (emit_multi)
            await this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings
            }));

        return updatedSettings;
    }

    /**
     * Sets the value of this setting.
     * This only exists for use by the constructor and SettingsCategory.
     */
    _setValue(value, hook = true) {
        const old_value = this.args.value;
        if (Utils.compare(value, old_value)) return [];
        this.args.value = value;
        this.changed = !Utils.compare(this.args.value, this.args.saved_value);

        const updatedSetting = new SettingUpdatedEvent({
            setting: this, setting_id: this.id,
            value, old_value
        });

        if (hook)
            this.setValueHookSync(updatedSetting);

        return [updatedSetting];
    }

    /**
     * Function to be called after the value changes.
     * This can be overridden by other settings types.
     * @param {SettingUpdatedEvent} updatedSetting
     */
    async setValueHook(updatedSetting) {}
    setValueHookSync(updatedSetting) {}

    /**
     * Sets the value of this setting.
     * @param {Any} value The new value of this setting
     * @return {Promise}
     */
    async setValue(value, emit_multi = true, emit = true) {
        const updatedSettings = this._setValue(value, false);
        if (!updatedSettings.length) return [];

        await this.setValueHook(updatedSettings[0]);

        if (emit)
            await this.emit('setting-updated', updatedSettings[0]);

        if (emit_multi)
            await this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings
            }));

        return updatedSettings;
    }

    /**
     * Marks this setting as saved (not changed).
     */
    setSaved() {
        this.args.saved_value = this.args.value;
        this.changed = false;
    }

    /**
     * Sets the path of the plugin/theme this setting is part of.
     * Used by settings of type "array", "custom" and "file".
     * @param {String} contentPath The plugin/theme's directory path
     */
    setContentPath(contentPath) {
        this.args.path = contentPath;
    }

    /**
     * Returns an object that can be stored as JSON and later merged back into a setting with setting.merge.
     * @return {Object}
     */
    strip() {
        return {
            id: this.id,
            value: this.args.value
        };
    }

    /**
     * Returns a copy of this setting that can be changed and then merged back into a set with setting.merge.
     * @param {Setting} ...merge A setting to merge into the new setting
     * @return {Setting}
     */
    clone(...merge) {
        return new this.constructor(Utils.deepclone(this.args), ...merge);
    }

    /**
     * Returns a representation of this setting's value in SCSS.
     * @return {String|Promise}
     */
    toSCSS() {
        if (typeof this.value === 'boolean' || typeof this.value === 'number') {
            return this.value;
        }

        if (typeof this.value === 'string') {
            return ThemeManager.toSCSSString(this.value);
        }
    }

}
