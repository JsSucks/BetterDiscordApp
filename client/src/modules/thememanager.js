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
import { DOM } from 'ui';
import { FileUtils, ClientIPC } from 'common';

class Theme {

    constructor(themeInternals) {
        this.__themeInternals = themeInternals;
        this.hasSettings = this.themeConfig && this.themeConfig.length > 0;
        this.saveSettings = this.saveSettings.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
    }

    get configs() { return this.__themeInternals.configs }
    get info() { return this.__themeInternals.info }
    get icon() { return this.info.icon }
    get paths() { return this.__themeInternals.paths }
    get main() { return this.__themeInternals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get name() { return this.info.name }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get themePath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get themeConfig() { return this.userConfig.config }
    get css() { return this.userConfig.css }
    get id() { return this.name.toLowerCase().replace(/\s+/g, '-') }

    async saveSettings(newSettings) {
        for (let category of newSettings) {
            const oldCategory = this.themeConfig.find(c => c.category === category.category);
            for (let setting of category.settings) {
                const oldSetting = oldCategory.settings.find(s => s.id === setting.id);
                if (oldSetting.value === setting.value) continue;
                oldSetting.value = setting.value;
                if (this.settingChanged) this.settingChanged(category.category, setting.id, setting.value);
            }
        }

        // As the theme's configuration has changed it needs recompiling
        // When the compiled CSS has been save it will also save the configuration
        await this.recompile();

        if (this.settingsChanged) this.settingsChanged(this.themeConfig);

        return this.pluginConfig;
    }

    async saveConfiguration() {
        try {
            await FileUtils.writeFile(`${this.themePath}/user.config.json`, JSON.stringify({
                enabled: this.enabled,
                config: this.themeConfig.map(category => {
                    return {
                        category: category.category,
                        settings: category.settings.map(setting => {
                            return {
                                id: setting.id,
                                value: setting.value
                            };
                        })
                    };
                }),
                css: this.css
            }));
        } catch (err) {
            throw err;
        }
    }

    enable() {
        if (!this.enabled) {
            this.userConfig.enabled = true;
            this.saveConfiguration();
        }
        DOM.injectTheme(this.css, this.id);
    }

    disable() {
        this.userConfig.enabled = false;
        this.saveConfiguration();
        DOM.deleteTheme(this.id);
    }

    async compile() {
        console.log('Compiling CSS');

        let css = '';
        if (this.info.type === 'sass') {
            css = await ClientIPC.send('bd-compileSass', {
                scss: ThemeManager.getConfigAsSCSS(this.themeConfig),
                path: this.paths.mainPath.replace(/\\/g, '/')
            });
            console.log(css);
        } else {
            css = await FileUtils.readFile(this.paths.mainPath);
        }

        return css;
    }

    async recompile() {
        const css = await this.compile();
        this.userConfig.css = css;

        await this.saveConfiguration();

        if (this.enabled) {
            DOM.deleteTheme(this.id);
            DOM.injectTheme(this.css, this.id);
        }
    }

}

export default class ThemeManager extends ContentManager {

    static get localThemes() {
        return this.localContent;
    }

    static get pathId() {
        return 'themes';
    }

    static get loadAllThemes() {
        return this.loadAllContent;
    }

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

    static enableTheme(theme) {
        theme.enable();
    }

    static disableTheme(theme) {
        theme.disable();
    }

    static reloadTheme(theme) {
        theme.recompile();
    }

    static getConfigAsSCSS(config) {
        const variables = [];

        for (let category of config) {
            for (let setting of category.settings) {
                variables.push(this.parseSetting(setting));
            }
        }
        return variables.join('\n');
    }

    static parseSetting(setting) {
        const { type, id, value } = setting;
        const name = id.replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-');

        if (type === 'slider') {
            return `$${name}: ${value * setting.multi || 1};`;
        }

        if (type === 'dropdown' || type === 'radio') {
            return `$${name}: ${setting.options.find(opt => opt.id === value).value};`;
        }

        if (typeof value === 'boolean' || typeof value === 'number') {
            return `$${name}: ${value};`; 
        }

        if (typeof value === 'string') {
            return `$${name}: ${setting.scss_raw ? value : `'${setting.value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`};`; 
        }

    }

}
