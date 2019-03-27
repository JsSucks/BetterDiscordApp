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
import { ErrorEvent, CustomSetting } from 'structs';
import { ClientLogger as Logger } from 'common';
import Globals from './globals';
import ContentManager from './contentmanager';
import ExtModuleManager from './extmodulemanager';
import Plugin from './plugin';
import PluginApi from './pluginapi';
import Vendor from './vendor';
import path from 'path';
import semver from 'semver';

export default class PluginManager extends ContentManager {

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

    static get pluginApiInstances() {
        return this._pluginApiInstances || (this._pluginApiInstances = {});
    }

    static get pluginDependencies() {
        return this._pluginDependencies || (this._pluginDependencies = {});
    }

    static get pluginInstanceModules() {
        return this._pluginInstanceModules || (this._pluginInstanceModules = {});
    }

    static async loadAllContent(suppressErrors) {
        this.loaded = false;
        const loadAll = await super.loadAllContent(true);
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
    static get loadAllPlugins() { return this.loadAllContent }
    static get refreshPlugins() { return this.refreshContent }

    static get loadContent() { return this.loadPlugin }
    static async loadPlugin(paths, configs, info, main, alternateVersions, dependencies, permissions, mainExport, packed = false) {
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

        const pluginapi = this.pluginApiInstances[paths.contentPath] = new PluginApi(info, paths.contentPath);

        const deps = this.pluginDependencies[paths.contentPath] = {};
        if (dependencies) {
            let refreshedModules = false;

            for (const [key, value] of Object.entries(dependencies)) {
                if (key === 'betterdiscord') {
                    if (semver.satisfies(Globals.version, value)) continue;

                    throw {message: 'This plugin requires a different version of BetterDiscord.'};
                }

                let extModule = ExtModuleManager.findModule(key);
                if (!extModule) {
                    if (!refreshedModules) {
                        await ExtModuleManager.refreshContent(true);
                        refreshedModules = true;
                    }

                    extModule = ExtModuleManager.findModule(key);
                    if (!extModule) throw {message: `Dependency ${key} is not loaded.`};
                }

                deps[key] = deps[extModule.id] = extModule.getVersion(value);
            }
        }

        this.pluginInstanceModules[paths.contentPath] = Object.freeze(Object.defineProperty({
            __esModule: true
        }, 'default', {
            get: () => instance
        }));

        const pluginExports = Globals.require(paths.mainPath);

        let plugin = mainExport ? pluginExports[mainExport]
            : pluginExports.__esModule ? pluginExports.default : pluginExports;
        if (typeof plugin === 'function' && !(plugin.prototype instanceof Plugin))
            plugin = plugin.call(pluginExports, Plugin, pluginapi, Vendor, deps);

        if (!plugin || !(plugin.prototype instanceof Plugin))
            throw {message: `Plugin ${info.name} did not export a class that extends Plugin or a function that returns a class that extends Plugin.`};

        const instance = new plugin({
            configs, info, main, paths
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

    static unloadContentHook(content, reload) {
        const pluginapi = this.pluginApiInstances[content.contentPath];
        pluginapi.unloadAll();

        delete this.pluginApiInstances[content.contentPath];
        delete this.pluginDependencies[content.contentPath];
        delete this.pluginInstanceModules[content.contentPath];

        delete Globals.require.cache[Globals.require.resolve(content.paths.mainPath)];
        const uncache = [];
        for (const required in Globals.require.cache) {
            if (!required.includes(content.paths.contentPath)) continue;
            uncache.push(Globals.require.resolve(required));
        }
        for (const u of uncache) delete Globals.require.cache[u];
    }

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

    static patchModuleLoad() {
        const Module = Globals.require('module');
        const load = Module._load;
        const resolveFilename = Module._resolveFilename;

        Module._load = function (request, parent, isMain) {
            if (request === 'betterdiscord' || request.startsWith('betterdiscord/')) {
                const plugin = PluginManager.getPluginByModule(parent);
                const contentPath = plugin ? plugin.contentPath : PluginManager.getPluginPathByModule(parent);

                if (contentPath) {
                    const module = PluginManager.requireApi(request, plugin, contentPath, parent);

                    if (module) return module;
                }
            }

            return load.apply(this, arguments);
        };

        Module._resolveFilename = function (request, parent, isMain) {
            if (request === 'betterdiscord' || request.startsWith('betterdiscord/')) {
                const contentPath = PluginManager.getPluginPathByModule(parent);
                if (contentPath) return request;
            }

            return resolveFilename.apply(this, arguments);
        };
    }

    static getPluginByModule(module) {
        return this.localContent.find(plugin => module.filename === plugin.contentPath || module.filename.startsWith(plugin.contentPath + path.sep));
    }

    static getPluginPathByModule(module) {
        return Object.keys(this.pluginApiInstances).find(contentPath => module.filename === contentPath || module.filename.startsWith(contentPath + path.sep));
    }

    static requireApi(request, plugin, contentPath, parent) {
        if (request === 'betterdiscord/plugin') return Plugin;
        if (request === 'betterdiscord/plugin-api') return this.pluginApiInstances[contentPath];
        if (request === 'betterdiscord/vendor') return Vendor;
        if (request === 'betterdiscord/dependencies') return this.pluginDependencies[contentPath];

        if (request.startsWith('betterdiscord/vendor/')) {
            return Vendor[request.substr(21)];
        }

        if (request.startsWith('betterdiscord/dependencies/')) {
            return this.pluginDependencies[contentPath][request.substr(27)];
        }

        if (request === 'betterdiscord/plugin-instance') return this.pluginInstanceModules[contentPath];

        if (request.startsWith('betterdiscord/bridge/')) {
            const plugin = this.getPluginById(request.substr(21));
            return plugin.bridge;
        }

        if (request.startsWith('betterdiscord/extmodule/')) {
            const module = ExtModuleManager.findModule(request.substr(24));
            return module && module.__require ? module.__require : null;
        }

        if (request.startsWith('betterdiscord/plugin-api/')) {
            const api = this.pluginApiInstances[contentPath];
            const apirequest = request.substr(25);

            if (apirequest === 'async-eventemitter') return api.AsyncEventEmitter;
            if (apirequest === 'eventswrapper') return api.EventsWrapper;
            if (apirequest === 'commoncomponents') return api.CommonComponents;
            if (apirequest === 'components') return api.Components;
            if (apirequest === 'filters') return api.Filters;
            if (apirequest === 'discord-api') return api.DiscordApi;
            if (apirequest === 'react-components') return api.ReactComponents;
            if (apirequest === 'react-helpers') return api.ReactHelpers;
            if (apirequest === 'reflection') return api.Reflection;
            if (apirequest === 'dom') return api.DOM;
            if (apirequest === 'vueinjector') return api.VueInjector;

            if (apirequest === 'reflection/modules') return api.Reflection.modules;

            if (apirequest === 'observer') return api.observer;

            if (apirequest === 'logger') return api.Logger;
            if (apirequest === 'utils') return api.Utils;
            if (apirequest === 'settings') return api.Settings;
            if (apirequest === 'internalsettings') return api.InternalSettings;
            if (apirequest === 'bdmenu') return api.BdMenu;
            if (apirequest === 'bdmenuitems') return api.BdMenuItems;
            if (apirequest === 'bdcontextmenu') return api.BdContextMenu;
            if (apirequest === 'cssutils') return api.CssUtils;
            if (apirequest === 'modals') return api.Modals;
            if (apirequest === 'toasts') return api.Toasts;
            if (apirequest === 'notifications') return api.Notifications;
            if (apirequest === 'autocomplete') return api.Autocomplete;
            if (apirequest === 'emotes') return api.Emotes;
            if (apirequest === 'patcher') return api.Patcher;
            if (apirequest === 'discordcontextmenu') return api.DiscordContextMenu;
            if (apirequest === 'vuewrap') return api.Vuewrap.bind(api);

            if (apirequest === 'settings/custom') return CustomSetting;
        }
    }

}

PluginManager.patchModuleLoad();
