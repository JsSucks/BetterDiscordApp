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
import { FileUtils } from 'common';

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
                configs, info, main,
                paths: {
                    contentPath: paths.contentPath,
                    dirName: paths.dirName,
                    mainPath: paths.mainPath
                }
            });
            if (!instance.css) instance.recompile();
            else if (instance.enabled) instance.enable();
            return instance;
        } catch (err) {
            throw err;
        }
    }

    static get unloadTheme() { return this.unloadContent }
    static async reloadTheme(theme) {
        theme = await this.reloadContent(theme);
        theme.recompile();
    }

    static enableTheme(theme) {
        theme.enable();
    }

    static disableTheme(theme) {
        theme.disable();
    }

    static get isTheme() { return this.isThisContent }
    static isThisContent(theme) {
        return theme instanceof Theme;
    }

    static async getConfigAsSCSS(config) {
        const variables = [];

        for (let category of config) {
            for (let setting of category.settings) {
                const setting_scss = await this.parseSetting(setting);
                if (setting_scss) variables.push(`$${setting_scss[0]}: ${setting_scss[1]};`);
            }
        }

        return variables.join('\n');
    }

    static async getConfigAsSCSSMap(config) {
        const variables = [];

        for (let category of config) {
            for (let setting of category.settings) {
                const setting_scss = await this.parseSetting(setting);
                if (setting_scss) variables.push(`${setting_scss[0]}: (${setting_scss[1]})`);
            }
        }

        return '(' + variables.join(', ') + ')';
    }

    static async parseSetting(setting) {
        const { type, id, value } = setting;
        const name = id.replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-');

        if (type === 'array') {
            const items = JSON.parse(JSON.stringify(value)) || [];
            const settings_json = JSON.stringify(setting.settings);

            for (let item of items) {
                const settings = JSON.parse(settings_json);

                for (let category of settings) {
                    const newCategory = item.settings.find(c => c.category === category.category);
                    for (let setting of category.settings) {
                        const newSetting = newCategory.settings.find(s => s.id === setting.id);
                        setting.value = setting.old_value = newSetting.value;
                        setting.changed = false;
                    }
                }

                item.settings = settings;
            }

            console.log('items', items);

            // Final comma ensures the variable is a list
            const maps = [];
            for (let item of items)
                maps.push(await this.getConfigAsSCSSMap(item.settings));
            return [name, maps.length ? maps.join(', ') + ',' : '()'];
        }

        if (type === 'file' && Array.isArray(value)) {
            if (!value || !value.length) return [name, '(),'];

            const files = [];
            for (let filepath of value) {
                const buffer = await FileUtils.readFileBuffer(filepath);
                const type = await FileUtils.getFileType(buffer);
                files.push(`(data: ${this.toSCSSString(buffer.toString('base64'))}, type: ${this.toSCSSString(type.mime)}, url: ${this.toSCSSString(await FileUtils.toDataURI(buffer, type.mime))})`);
            }

            return [name, files.length ? files.join(', ') : '()'];
        }

        if (type === 'slider') {
            return [name, value * setting.multi || 1];
        }

        if (type === 'dropdown' || type === 'radio') {
            return [name, setting.options.find(opt => opt.id === value).value];
        }

        if (type === 'color') {
            console.log(value);
            return [name, value];
        }

        if (typeof value === 'boolean' || typeof value === 'number') {
            return [name, value];
        }

        if (typeof value === 'string') {
            return [name, this.toSCSSString(value)];
        }
    }

    static deQuote(value) {
        return value.replace('"', '');
    }

    static toSCSSString(value) {
        if (typeof value !== 'string' && value.toString) value = value.toString();
        return `'${typeof value === 'string' ? value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') : ''}'`;
    }

}
