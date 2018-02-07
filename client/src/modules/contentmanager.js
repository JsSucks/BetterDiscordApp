/**
 * BetterDiscord Content Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Globals from './globals';
import { FileUtils, ClientLogger as Logger } from 'common';
import path from 'path';
import { Events } from 'modules';

export default class {

    static get localContent() {
        return this._localContent ? this._localContent : (this._localContent = []);
    }

    static get contentPath() {
        return this._contentPath ? this._contentPath : (this._contentPath = Globals.getObject('paths').find(path => path.id === this.pathId).path);
    }

    static async loadAllContent() {
        try {
            await FileUtils.ensureDirectory(this.contentPath);
            const directories = await FileUtils.listDirectory(this.contentPath);

            for (let dir of directories) {
                try {
                    await this.preloadContent(dir);
                } catch (err) {
                    //We don't want every plugin/theme to fail loading when one does
                    Events.emit('bd-error', {
                        header: `${this.moduleName} - Failed to load plugin: ${dir}`,
                        text: err.message,
                        type: 'err'
                    });
                    Logger.err(this.moduleName, err);
                }
            }

            return this.localContent;
        } catch (err) {
            throw err;
        }
    }

    static async refreshContent() {
        if (!this.localContent.length) return this.loadAllContent();

        try {
            await FileUtils.ensureDirectory(this.contentPath);
            const directories = await FileUtils.listDirectory(this.contentPath);

            for (let dir of directories) {
                // If content is already loaded this should resolve.
                if (this.getContentByDirName(dir)) continue;

                try {
                    // Load if not
                    await this.preloadContent(dir);
                } catch (err) {
                    //We don't want every plugin/theme to fail loading when one does
                    Logger.err(this.moduleName, err);
                }
            }

            for (let content of this.localContent) {
                if (directories.includes(content.dirName)) continue;
                //Plugin/theme was deleted manually, stop it and remove any reference
                this.unloadContent(content);
            }

            return this.localContent;

        } catch (err) {
            throw err;
        }
    }

    static async preloadContent(dirName, reload = false, index) {
        try {
            const contentPath = path.join(this.contentPath, dirName);

            await FileUtils.directoryExists(contentPath);

            if (!reload) {
                const loaded = this.localContent.find(content => content.contentPath === contentPath);
                if (loaded) {
                    throw { 'message': `Attempted to load already loaded user content: ${path}` };
                }
            }

            const readConfig = await this.readConfig(contentPath);
            const mainPath = path.join(contentPath, readConfig.main);

            const userConfig = {
                enabled: false,
                config: readConfig.defaultConfig
            };

            try {
                const readUserConfig = await this.readUserConfig(contentPath);
                userConfig.enabled = readUserConfig.enabled || false;
                userConfig.config = readConfig.defaultConfig.map(config => {
                    const userSet = readUserConfig.config.find(c => c.category === config.category);
                    // return userSet || config;
                    if (!userSet) return config;

                    config.settings = config.settings.map(setting => {
                        const userSetting = userSet.settings.find(s => s.id === setting.id);
                        if (!userSetting) return setting;

                        setting.value = userSetting.value;
                        return setting;
                    });
                    return config;
                });
                // userConfig.config = readUserConfig.config;
            } catch (err) { /*We don't care if this fails it either means that user config doesn't exist or there's something wrong with it so we revert to default config*/

            }

            const configs = {
                defaultConfig: readConfig.defaultConfig,
                userConfig
            }

            const paths = {
                contentPath,
                dirName,
                mainPath
            }

            const content = await this.loadContent(paths, configs, readConfig.info, readConfig.main);
            if (reload) this.localContent[index] = content;
            else this.localContent.push(content);
            return content;

        } catch (err) {
            throw err;
        }
    }

    static async readConfig(configPath) {
        configPath = path.resolve(configPath, 'config.json');
        return FileUtils.readJsonFromFile(configPath);
    }

    static async readUserConfig(configPath) {
        configPath = path.resolve(configPath, 'user.config.json');
        return FileUtils.readJsonFromFile(configPath);
    }

    //TODO make this nicer
    static findContent(wild) {
        let content = this.getContentByName(wild);
        if (content) return content;
        content = this.getContentById(wild);
        if (content) return content;
        content = this.getContentByPath(wild);
        if (content) return content;
        return this.getContentByDirName(wild);
    }

    static getContentIndex(content) { return this.localContent.findIndex(c => c === content) }
    static getContentByName(name) { return this.localContent.find(c => c.name === name) }
    static getContentById(id) { return this.localContent.find(c => c.id === id) }
    static getContentByPath(path) { return this.localContent.find(c => c.contentPath === path) }
    static getContentByDirName(dirName) { return this.localContent.find(c => c.dirName === dirName) }

}
