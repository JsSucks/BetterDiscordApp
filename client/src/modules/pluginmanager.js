/**
 * BetterDiscord Plugin Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Permissions } from 'modules';
import { Modals } from 'ui';
import { ErrorEvent } from 'structs';
import { ClientLogger as Logger } from 'common';
import Globals from './globals';
import ContentManager from './contentmanager';
import ExtModuleManager from './extmodulemanager';
import Plugin from './plugin';
import PluginApi from './pluginapi';
import Vendor from './vendor';

export default class extends ContentManager {

    static get localPlugins() {
        return this.localContent;
    }

    static get contentType() {
        return 'plugin';
    }

    static get moduleName() {
        return 'Plugin Manager';
    }

    static get pathId() {
        return 'plugins';
    }

    static async loadAllPlugins(suppressErrors) {
        this.loaded = false;
        const loadAll = await this.loadAllContent(true);
        this.loaded = true;
        for (const plugin of this.localPlugins) {
            if (!plugin.enabled) continue;
            plugin.userConfig.enabled = false;

            try {
                plugin.start(false);
            } catch (err) {
                // Disable the plugin but don't save it - the next time BetterDiscord is started the plugin will attempt to start again
                this.errors.push(new ErrorEvent({
                    module: this.moduleName,
                    message: `Failed to start ${plugin.name}`,
                    err
                }));

                Logger.err(this.moduleName, [`Failed to start plugin ${plugin.name}:`, err]);
            }
        }

        if (this.errors.length && !suppressErrors) {
            Modals.error({
                header: `${this.moduleName} - ${this.errors.length} ${this.contentType}${this.errors.length !== 1 ? 's' : ''} failed to load`,
                module: this.moduleName,
                type: 'err',
                content: this.errors
            });
            this._errors = [];
        }

        return loadAll;
    }
    static get refreshPlugins() { return this.refreshContent }

    static get loadContent() { return this.loadPlugin }
    static async loadPlugin(paths, configs, info, main, dependencies, permissions, mainExport) {
        if (permissions && permissions.length > 0) {
            for (const perm of permissions) {
                Logger.log(this.moduleName, `Permission: ${Permissions.permissionText(perm).HEADER} - ${Permissions.permissionText(perm).BODY}`);
            }
            try {
                const allowed = await Modals.permissions(`${info.name} wants to:`, info.name, permissions).promise;
            } catch (err) {
                return;
            }
        }

        const deps = {};
        if (dependencies) {
            for (const [key, value] of Object.entries(dependencies)) {
                const extModule = ExtModuleManager.findModule(key);
                if (!extModule) {
                    throw {message: `Dependency ${key}:${value} is not loaded.`};
                }
                deps[key] = extModule.__require;
            }
        }

        const pluginExports = Globals.require(paths.mainPath);

        const pluginFunction = mainExport ? pluginExports[mainExport]
            : pluginExports.__esModule ? pluginExports.default : pluginExports;
        if (typeof pluginFunction !== 'function')
            throw {message: `Plugin ${info.name} did not export a function.`};

        const plugin = pluginFunction.call(pluginExports, Plugin, new PluginApi(info, paths.contentPath), Vendor, deps);
        if (!plugin || !(plugin.prototype instanceof Plugin))
            throw {message: `Plugin ${info.name} did not return a class that extends Plugin.`};

        const instance = new plugin({
            configs, info, main,
            paths: {
                contentPath: paths.contentPath,
                dirName: paths.dirName,
                mainPath: paths.mainPath
            }
        });

        if (instance.enabled && this.loaded) {
            instance.userConfig.enabled = false;
            instance.start(false);
        }
        return instance;
    }

    static get deletePlugin() { return this.deleteContent }
    static get unloadPlugin() { return this.unloadContent }
    static get reloadPlugin() { return this.reloadContent }

    /**
     * Stops a plugin.
     * @param {Plugin|String} plugin
     * @return {Promise}
     */
    static stopPlugin(plugin) {
        plugin = this.isPlugin(plugin) ? plugin : this.getPluginById(plugin);
        return plugin.stop();
    }

    /**
     * Starts a plugin.
     * @param {Plugin|String} plugin
     * @return {Promise}
     */
    static startPlugin(plugin) {
        plugin = this.isPlugin(plugin) ? plugin : this.getPluginById(plugin);
        return plugin.start();
    }

    static get isPlugin() { return this.isThisContent }
    static isThisContent(plugin) {
        return plugin instanceof Plugin;
    }

    static get findPlugin() { return this.findContent }
    static get getPluginIndex() { return this.getContentIndex }
    static get getPluginByName() { return this.getContentByName }
    static get getPluginById() { return this.getContentById }
    static get getPluginByPath() { return this.getContentByPath }
    static get getPluginByDirName() { return this.getContentByDirName }

    static get waitForPlugin() { return this.waitForContent }

}
