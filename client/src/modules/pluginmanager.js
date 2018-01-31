/**
 * BetterDiscord Plugin Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ContentManager from './contentmanager';
import Plugin from './plugin';

export default class extends ContentManager {

    static get localPlugins() {
        return this.localContent;
    }

    static get moduleName() {
        return 'PluginManager';
    }

    static get pathId() {
        return 'plugins';
    }

    static get loadAllPlugins() { return this.loadAllContent }
    static get refreshPlugins() { return this.refreshContent }

    static get loadContent() { return this.loadPlugin }
    static async loadPlugin(paths, configs, info, main) {
        const plugin = window.require(paths.mainPath)(Plugin, {}, {});
        const instance = new plugin({ configs, info, main, paths: { contentPath: paths.contentPath, dirName: paths.dirName } });

        if (instance.enabled) instance.start();
        return instance;
    }

    static get unloadContent() { return this.unloadPlugin }
    static async unloadPlugin(plugin) {
        try {
            if (plugin.enabled) plugin.stop();
            const { pluginPath } = plugin;
            const index = this.getPluginIndex(plugin);

            delete window.require.cache[window.require.resolve(pluginPath)];
            this.localPlugins.splice(index, 1);
        } catch (err) {
            //This might fail but we don't have any other option at this point
            Logger.err('PluginManager', err);
        }
    }

    static async reloadPlugin(plugin) {
        const _plugin = plugin instanceof Plugin ? plugin : this.findPlugin(plugin);
        if (!_plugin) throw { 'message': 'Attempted to reload a plugin that is not loaded?' };
        if (!_plugin.stop()) throw { 'message': 'Plugin failed to stop!' };
        const index = this.getPluginIndex(_plugin);
        const { pluginPath, dirName } = _plugin;

        delete window.require.cache[window.require.resolve(pluginPath)];

        return this.preloadContent(dirName, true, index);
    }

    static stopPlugin(name) {
        const plugin = name instanceof Plugin ? name : this.getPluginByName(name);
        try {
            if (plugin) return plugin.stop();
        } catch (err) {
           // Logger.err('PluginManager', err);
        }
        return true; //Return true anyways since plugin doesn't exist
    }

    static startPlugin(name) {
        const plugin = name instanceof Plugin ? name : this.getPluginByName(name);
        try {
            if (plugin) return plugin.start();
        } catch (err) {
           // Logger.err('PluginManager', err);
        }
        return true; //Return true anyways since plugin doesn't exist
    }

    static get findPlugin() { return this.findContent }
    static get getPluginIndex() { return this.getContentIndex }
    static get getPluginByName() { return this.getContentByName }
    static get getPluginById() { return this.getContentById }
    static get getPluginByPath() { return this.getContentByPath }
    static get getPluginByDirName() { return this.getContentByDirName }

}
