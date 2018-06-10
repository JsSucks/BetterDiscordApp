/**
 * BetterDiscord Plugin API
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { EmoteModule } from 'builtin';
import { SettingsSet, SettingsCategory, Setting, SettingsScheme } from 'structs';
import { BdMenu, Modals, DOM, Reflection, Toasts } from 'ui';
import { Utils, ClientLogger as Logger, ClientIPC, AsyncEventEmitter } from 'common';
import Settings from './settings';
import ExtModuleManager from './extmodulemanager';
import PluginManager from './pluginmanager';
import ThemeManager from './thememanager';
import Events from './events';
import EventsWrapper from './eventswrapper';
import { WebpackModules } from './webpackmodules';
import DiscordApi from './discordapi';
import { ReactComponents } from './reactcomponents';
import { Patcher, MonkeyPatch } from './patcher';

export default class PluginApi {

    constructor(pluginInfo, pluginPath) {
        this.pluginInfo = pluginInfo;
        this.pluginPath = pluginPath;

        this.Events = new EventsWrapper(Events);
        Utils.defineSoftGetter(this.Events, 'bind', () => this.plugin);

        this._menuItems = undefined;
        this._injectedStyles = undefined;
        this._modalStack = undefined;
    }

    get plugin() {
        return PluginManager.getPluginByPath(this.pluginPath);
    }

    async bridge(plugin_id) {
        const plugin = await PluginManager.waitForPlugin(plugin_id);
        return plugin.bridge;
    }

    get require() { return this.import }
    import(m) {
        const module = ExtModuleManager.findModule(m);
        if (module && module.__require) return module.__require;
        return null;
    }

    get Api() { return this }

    get AsyncEventEmitter() { return AsyncEventEmitter }
    get EventsWrapper() { return EventsWrapper }

    /**
     * Logger
     */

    get Logger() {
        return {
            log: (...message) => Logger.log(this.plugin.name, message),
            error: (...message) => Logger.err(this.plugin.name, message),
            err: (...message) => Logger.err(this.plugin.name, message),
            warn: (...message) => Logger.warn(this.plugin.name, message),
            info: (...message) => Logger.info(this.plugin.name, message),
            debug: (...message) => Logger.dbg(this.plugin.name, message),
            dbg: (...message) => Logger.dbg(this.plugin.name, message)
        };
    }

    /**
     * Utils
     */

    get Utils() {
        return {
            overload: (...args) => Utils.overload.apply(Utils, args),
            tryParseJson: (...args) => Utils.tryParseJson.apply(Utils, args),
            toCamelCase: (...args) => Utils.toCamelCase.apply(Utils, args),
            compare: (...args) => Utils.compare.apply(Utils, args),
            deepclone: (...args) => Utils.deepclone.apply(Utils, args),
            deepfreeze: (...args) => Utils.deepfreeze.apply(Utils, args),
            removeFromArray: (...args) => Utils.removeFromArray.apply(Utils, args),
            defineSoftGetter: (...args) => Utils.defineSoftGetter.apply(Utils, args),
            wait: (...args) => Utils.wait.apply(Utils, args),
            until: (...args) => Utils.until.apply(Utils, args)
        };
    }

    /**
     * Settings
     */

    createSettingsSet(args, ...merge) {
        return new SettingsSet(args || {}, ...merge);
    }
    createSettingsCategory(args, ...merge) {
        return new SettingsCategory(args, ...merge);
    }
    createSetting(args, ...merge) {
        return new Setting(args, ...merge);
    }
    createSettingsScheme(args) {
        return new SettingsScheme(args);
    }
    get Settings() {
        return {
            createSet: this.createSettingsSet.bind(this),
            createCategory: this.createSettingsCategory.bind(this),
            createSetting: this.createSetting.bind(this),
            createScheme: this.createSettingsScheme.bind(this)
        };
    }

    /**
     * InternalSettings
     */

    getInternalSetting(set, category, setting) {
        return Settings.get(set, category, setting);
    }
    get InternalSettings() {
        return {
            get: this.getInternalSetting.bind(this)
        };
    }

    /**
     * BdMenu
     */

    get BdMenu() {
        return {
            open: BdMenu.open.bind(BdMenu),
            close: BdMenu.close.bind(BdMenu),
            items: this.BdMenuItems,
            BdMenuItems: this.BdMenuItems
        };
    }

    /**
     * BdMenuItems
     */

    get menuItems() {
        return this._menuItems || (this._menuItems = []);
    }
    addMenuItem(item) {
        return BdMenu.items.add(item);
    }
    addMenuSettingsSet(category, set, text) {
        const item = BdMenu.items.addSettingsSet(category, set, text);
        return this.menuItems.push(item);
    }
    addMenuVueComponent(category, text, component) {
        const item = BdMenu.items.addVueComponent(category, text, component);
        return this.menuItems.push(item);
    }
    removeMenuItem(item) {
        BdMenu.items.remove(item);
        Utils.removeFromArray(this.menuItems, item);
    }
    removeAllMenuItems() {
        for (let item of this.menuItems)
            BdMenu.items.remove(item);
    }
    get BdMenuItems() {
        return Object.defineProperty({
            add: this.addMenuItem.bind(this),
            addSettingsSet: this.addMenuSettingsSet.bind(this),
            addVueComponent: this.addMenuVueComponent.bind(this),
            remove: this.removeMenuItem.bind(this),
            removeAll: this.removeAllMenuItems.bind(this)
        }, 'items', {
            get: () => this.menuItems
        });
    }

    /**
     * CssUtils
     */

    get injectedStyles() {
        return this._injectedStyles || (this._injectedStyles = []);
    }
    compileSass(scss, options) {
        return ClientIPC.send('bd-compileSass', Object.assign({ data: scss }, options));
    }
    getConfigAsSCSS(settingsset) {
        return ThemeManager.getConfigAsSCSS(settingsset ? settingsset : this.plugin.settings);
    }
    getConfigAsSCSSMap(settingsset) {
        return ThemeManager.getConfigAsSCSSMap(settingsset ? settingsset : this.plugin.settings);
    }
    injectStyle(id, css) {
        if (id && !css) css = id, id = undefined;
        this.deleteStyle(id);
        const styleid = `plugin-${this.plugin.id}-${id}`;
        this.injectedStyles.push(id);
        DOM.injectStyle(css, styleid);
    }
    async injectSass(id, scss, options) {
        // In most cases a plugin's styles should be precompiled instead of using this
        if (id && !scss && !options) scss = id, id = undefined;
        const css = (await this.compileSass(scss, options)).css.toString();
        this.injectStyle(id, css, options);
    }
    deleteStyle(id) {
        const styleid = `plugin-${this.plugin.id}-${id}`;
        this.injectedStyles.splice(this.injectedStyles.indexOf(styleid), 1);
        DOM.deleteStyle(styleid);
    }
    deleteAllStyles(id, css) {
        for (let id of this.injectedStyles) {
            this.deleteStyle(id);
        }
    }
    get CssUtils() {
        return {
            compileSass: this.compileSass.bind(this),
            getConfigAsSCSS: this.getConfigAsSCSS.bind(this),
            getConfigAsSCSSMap: this.getConfigAsSCSSMap.bind(this),
            injectStyle: this.injectStyle.bind(this),
            injectSass: this.injectSass.bind(this),
            deleteStyle: this.deleteStyle.bind(this),
            deleteAllStyles: this.deleteAllStyles.bind(this)
        };
    }

    /**
     * Modals
     */

    get modalStack() {
        return this._modalStack || (this._modalStack = []);
    }
    get baseModalComponent() {
        return Modals.baseComponent;
    }
    addModal(_modal, component) {
        const modal = Modals.add(_modal, component);
        modal.on('close', () => {
            let index;
            while ((index = this.modalStack.findIndex(m => m === modal)) > -1)
                this.modalStack.splice(index, 1);
        });
        this.modalStack.push(modal);
        return modal;
    }
    closeModal(modal, force) {
        return Modals.close(modal, force);
    }
    closeAllModals(force) {
        const promises = [];
        for (let modal of this.modalStack)
            promises.push(modal.close(force));
        return Promise.all(promises);
    }
    closeLastModal(force) {
        if (!this.modalStack.length) return;
        return this.modalStack[this.modalStack.length - 1].close(force);
    }
    basicModal(title, text) {
        return this.addModal(Modals.basic(title, text));
    }
    settingsModal(settingsset, headertext, options) {
        return this.addModal(Modals.settings(settingsset, headertext, options));
    }
    get Modals() {
        return Object.defineProperties({
            add: this.addModal.bind(this),
            close: this.closeModal.bind(this),
            closeAll: this.closeAllModals.bind(this),
            closeLast: this.closeLastModal.bind(this),
            basic: this.basicModal.bind(this),
            settings: this.settingsModal.bind(this)
        }, {
            stack: {
                get: () => this.modalStack
            },
            baseComponent: {
                get: () => this.baseModalComponent
            }
        });
    }
	
	
	/**
     * Toasts
     */
    showToast(message, options = {}) {
        return Toasts.push(message, options);
    }
    showSuccessToast(message, options = {}) {
        return Toasts.success(message, options);
    }
    showInfoToast(message, options = {}) {
        return Toasts.info(message, options);
    }
    showErrorToast(message, options = {}) {
        return Toasts.error(message, options);
    }
    showWarningToast(message, options = {}) {
        return Toasts.warning(message, options);
    }
	

    /**
     * Emotes
     */

    get emotes() {
        return EmoteModule.emotes;
    }
    get favourite_emotes() {
        return EmoteModule.favourite_emotes;
    }
    setFavouriteEmote(emote, favourite) {
        return EmoteModule.setFavourite(emote, favourite);
    }
    addFavouriteEmote(emote) {
        return EmoteModule.addFavourite(emote);
    }
    removeFavouriteEmote(emote) {
        return EmoteModule.addFavourite(emote);
    }
    isFavouriteEmote(emote) {
        return EmoteModule.isFavourite(emote);
    }
    getEmote(emote) {
        return EmoteModule.getEmote(emote);
    }
    filterEmotes(regex, limit, start = 0) {
        return EmoteModule.filterEmotes(regex, limit, start);
    }
    get Emotes() {
        return Object.defineProperties({
            setFavourite: this.setFavouriteEmote.bind(this),
            addFavourite: this.addFavouriteEmote.bind(this),
            removeFavourite: this.removeFavouriteEmote.bind(this),
            isFavourite: this.isFavouriteEmote.bind(this),
            getEmote: this.getEmote.bind(this),
            filter: this.filterEmotes.bind(this)
        }, {
            emotes: {
                get: () => this.emotes
            },
            favourite_emotes: {
                get: () => this.favourite_emotes
            }
        });
    }

    /**
     * Plugins
     */

    async getPlugin(plugin_id) {
        // This should require extra permissions
        return await PluginManager.waitForPlugin(plugin_id);
    }
    listPlugins() {
        return PluginManager.localContent.map(plugin => plugin.id);
    }
    get Plugins() {
        return {
            getPlugin: this.getPlugin.bind(this),
            listPlugins: this.listPlugins.bind(this)
        };
    }

    /**
     * Themes
     */

    async getTheme(theme_id) {
        // This should require extra permissions
        return await ThemeManager.waitForContent(theme_id);
    }
    listThemes() {
        return ThemeManager.localContent.map(theme => theme.id);
    }
    get Themes() {
        return {
            getTheme: this.getTheme.bind(this),
            listThemes: this.listThemes.bind(this)
        };
    }

    /**
     * ExtModules
     */

    async getModule(module_id) {
        // This should require extra permissions
        return await ExtModuleManager.waitForContent(module_id);
    }
    listModules() {
        return ExtModuleManager.localContent.map(module => module.id);
    }
    get ExtModules() {
        return {
            getModule: this.getModule.bind(this),
            listModules: this.listModules.bind(this)
        };
    }

    /**
     * WebpackModules
     */

    get webpackRequire() {
        return WebpackModules.require;
    }
    getWebpackModule(filter, first = true) {
        return WebpackModules.getModule(filter, first);
    }
    getWebpackModuleByName(name, fallback) {
        return WebpackModules.getModuleByName(name, fallback);
    }
    getWebpackModuleByRegex(regex) {
        return WebpackModules.getModuleByRegex(regex, true);
    }
    getWebpackModulesByRegex(regex) {
        return WebpackModules.getModuleByRegex(regex, false);
    }
    getWebpackModuleByProperties(...props) {
        return WebpackModules.getModuleByProps(props, true);
    }
    getWebpackModuleByPrototypeFields(...props) {
        return WebpackModules.getModuleByPrototypes(props, true);
    }
    getWebpackModulesByProperties(...props) {
        return WebpackModules.getModuleByProps(props, false);
    }
    getWebpackModulesByPrototypeFields(...props) {
        return WebpackModules.getModuleByPrototypes(props, false);
    }
    get WebpackModules() {
        return Object.defineProperty({
            getModule: this.getWebpackModule.bind(this),
            getModuleByName: this.getWebpackModuleByName.bind(this),
            getModuleByDisplayName: this.getWebpackModuleByName.bind(this),
            getModuleByRegex: this.getWebpackModuleByRegex.bind(this),
            getModulesByRegex: this.getWebpackModulesByRegex.bind(this),
            getModuleByProperties: this.getWebpackModuleByProperties.bind(this),
            getModuleByPrototypeFields: this.getWebpackModuleByPrototypeFields.bind(this),
            getModulesByProperties: this.getWebpackModulesByProperties.bind(this),
            getModulesByPrototypeFields: this.getWebpackModulesByPrototypeFields.bind(this)
        }, 'require', {
            get: () => this.webpackRequire
        });
    }

    /**
     * DiscordApi
     */

    get Discord() {
        return DiscordApi;
    }

    get ReactComponents() {
        return ReactComponents;
    }

    get Reflection() {
        return Reflection;
    }

    /**
     * Patcher
     */

    get patches() {
        return Patcher.getPatchesByCaller(this.plugin.id);
    }
    patchBefore(...args) { return this.pushChildPatch(...args, 'before') }
    patchAfter(...args) { return this.pushChildPatch(...args, 'after') }
    patchInstead(...args) { return this.pushChildPatch(...args, 'instead') }
    pushChildPatch(...args) {
        return Patcher.pushChildPatch(this.plugin.id, ...args);
    }
    unpatchAll(patches) {
        return Patcher.unpatchAll(patches || this.plugin.id);
    }
    get Patcher() {
        return Object.defineProperty({
            before: this.patchBefore.bind(this),
            after: this.patchAfter.bind(this),
            instead: this.patchInstead.bind(this),
            pushChildPatch: this.pushChildPatch.bind(this),
            unpatchAll: this.unpatchAll.bind(this),
            monkeyPatch: this.monkeyPatch.bind(this)
        }, 'patches', {
            get: () => this.patches
        });
    }
    get monkeyPatch() {
        return m => MonkeyPatch(this.plugin.id, m);
    }

}

// Stop plugins from modifying the plugin API for all plugins
// Plugins can still modify their own plugin API object
Object.freeze(PluginApi);
Object.freeze(PluginApi.prototype);
