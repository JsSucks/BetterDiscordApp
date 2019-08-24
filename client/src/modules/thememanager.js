/**
 * BetterDiscord Theme Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ContentManager from './contentmanager';
import Theme from './theme';

export default class ThemeManager extends ContentManager {

    static get localThemes() {
        return this.localContent;
    }

    static get contentType() {
        return 'theme';
    }

    static get moduleName() {
        return 'Theme Manager';
    }

    static get pathId() {
        return 'themes';
    }

    static get loadAllThemes() { return this.loadAllContent }
    static get refreshThemes() { return this.refreshContent }

    static get loadContent() { return this.loadTheme }
    static async loadTheme(paths, configs, info, main) {
        try {
            const instance = new Theme({
                configs, info, main, paths
            });
            if (instance.enabled) {
                instance.userConfig.enabled = false;
                instance.enable(false);
            }
            return instance;
        } catch (err) {
            throw err;
        }
    }

    static get deleteTheme() { return this.deleteContent }
    static get unloadTheme() { return this.unloadContent }
    static async reloadTheme(theme) {
        theme = await this.reloadContent(theme);
        theme.recompile();
    }

    static enableTheme(theme) {
        return theme.enable();
    }

    static disableTheme(theme) {
        return theme.disable();
    }

    static get isTheme() { return this.isThisContent }
    static isThisContent(theme) {
        return theme instanceof Theme;
    }

    /**
     * Returns a representation of a settings set's values in SCSS.
     * @param {SettingsSet} settingsset The set to convert to SCSS
     * @return {Promise}
     */
    static async getConfigAsSCSS(settingsset) {
        const variables = [];

        for (const category of settingsset.categories) {
            for (const setting of category.settings) {
                const setting_scss = await this.parseSetting(setting);
                if (setting_scss) variables.push(`$${setting_scss[0]}: ${setting_scss[1]};`);
            }
        }

        return variables.join('\n');
    }

    /**
     * Returns a representation of a settings set's values as an SCSS map.
     * @param {SettingsSet} settingsset The set to convert to an SCSS map
     * @return {Promise}
     */
    static async getConfigAsSCSSMap(settingsset) {
        const variables = [];

        for (const category of settingsset.categories) {
            for (const setting of category.settings) {
                const setting_scss = await this.parseSetting(setting);
                if (setting_scss) variables.push(`${setting_scss[0]}: (${setting_scss[1]})`);
            }
        }

        return `(${variables.join(', ')})`;
    }

    /**
     * Returns a setting's name and value as a string that can be included in SCSS.
     * @param {Setting} setting The setting to convert to SCSS
     * @return {Promise}
     */
    static async parseSetting(setting) {
        const name = setting.id.replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-');
        const scss = await setting.toSCSS();

        if (scss) return [name, scss];
    }

    /**
     * Escapes a string so it can be included in SCSS.
     * @param {String} value The string to escape
     * @return {String}
     */
    static toSCSSString(value) {
        if (typeof value !== 'string' && value.toString) value = value.toString();
        return `'${typeof value === 'string' ? value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') : ''}'`;
    }

}
