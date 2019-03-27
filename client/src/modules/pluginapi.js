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
import { BdMenu, Modals, DOM, DOMObserver, VueInjector, Toasts, Notifications, BdContextMenu, DiscordContextMenu } from 'ui';
import * as CommonComponents from 'commoncomponents';
import { default as Components } from '../ui/components/generic';
import { Utils, Filters, ClientLogger as Logger, ClientIPC, AsyncEventEmitter } from 'common';
import Settings from './settings';
import ExtModuleManager from './extmodulemanager';
import PluginManager from './pluginmanager';
import ThemeManager from './thememanager';
import Events from './events';
import EventsWrapper from './eventswrapper';
import Reflection from './reflection/index';
import DiscordApi from './discordapi';
import { ReactComponents, ReactHelpers } from './reactcomponents';
import { Patcher, MonkeyPatch } from './patcher';
import GlobalAc from '../ui/autocomplete';
import semver from 'semver';

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

    async bridge(plugin_id, request_version) {
        const plugin = await PluginManager.waitForPlugin(plugin_id);
        if (!request_version) return plugin.bridge;

        if (plugin.bridges) for (const version of Object.keys(plugin.bridges)) {
            if (semver.satisfies(version, request_version)) return plugin.bridges[version];
        }

        if (!semver.satisfies(plugin.version, request_version)) {
            throw new Error(`Requested version ${request_version} not satisfied by plugin.`);
        }

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

    get CommonComponents() { return CommonComponents }
    get Components() { return Components }
    get Filters() { return Filters }
    get Discord() { return DiscordApi }
    get DiscordApi() { return DiscordApi }
    get ReactComponents() { return ReactComponents }
    get ReactHelpers() { return ReactHelpers }
    get Reflection() { return Reflection }
    get DOM() { return DOM }
    get VueInjector() { return VueInjector }

    get observer() {
        return this._observer || (this._observer = new DOMObserver());
    }

    /**
     * Logger
     */

    get Logger() {
        return Object.defineProperty(this, 'Logger', {value: {
            log: (...message) => Logger.log(this.plugin.name, message),
            error: (...message) => Logger.err(this.plugin.name, message),
            err: (...message) => Logger.err(this.plugin.name, message),
            warn: (...message) => Logger.warn(this.plugin.name, message),
            info: (...message) => Logger.info(this.plugin.name, message),
            debug: (...message) => Logger.dbg(this.plugin.name, message),
            dbg: (...message) => Logger.dbg(this.plugin.name, message)
        }}).Logger;
    }

    /**
     * Utils
     */

    get Utils() {
        return Object.defineProperty(this, 'Utils', {value: {
            overload: (...args) => Utils.overload.apply(Utils, args),
            tryParseJson: (...args) => Utils.tryParseJson.apply(Utils, args),
            toCamelCase: (...args) => Utils.toCamelCase.apply(Utils, args),
            compare: (...args) => Utils.compare.apply(Utils, args),
            deepclone: (...args) => Utils.deepclone.apply(Utils, args),
            deepfreeze: (...args) => Utils.deepfreeze.apply(Utils, args),
            removeFromArray: (...args) => Utils.removeFromArray.apply(Utils, args),
            defineSoftGetter: (...args) => Utils.defineSoftGetter.apply(Utils, args),
            wait: (...args) => Utils.wait.apply(Utils, args),
            until: (...args) => Utils.until.apply(Utils, args),
            findInTree: (...args) => Utils.findInTree.apply(Utils, args),
            findInReactTree: (...args) => Utils.findInReactTree.apply(Utils, args)
        }}).Utils;
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
        return Object.defineProperty(this, 'Settings', {value: {
            createSet: this.createSettingsSet.bind(this),
            createCategory: this.createSettingsCategory.bind(this),
            createSetting: this.createSetting.bind(this),
            createScheme: this.createSettingsScheme.bind(this)
        }}).Settings;
    }

    /**
     * InternalSettings
     */

    getInternalSetting(set, category, setting) {
        return Settings.get(set, category, setting);
    }
    get InternalSettings() {
        return Object.defineProperty(this, 'InternalSettings', {value: {
            get: this.getInternalSetting.bind(this)
        }}).InternalSettings;
    }

    /**
     * BdMenu
     */

    get BdMenu() {
        return Object.defineProperty(this, 'BdMenu', {value: {
            open: BdMenu.open.bind(BdMenu),
            close: BdMenu.close.bind(BdMenu),
            items: this.BdMenuItems,
            BdMenuItems: this.BdMenuItems
        }}).BdMenu;
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
        for (const item of this.menuItems)
            BdMenu.items.remove(item);
    }
    get BdMenuItems() {
        return Object.defineProperty(this, 'BdMenuItems', {value: Object.defineProperty({
            add: this.addMenuItem.bind(this),
            addSettingsSet: this.addMenuSettingsSet.bind(this),
            addVueComponent: this.addMenuVueComponent.bind(this),
            remove: this.removeMenuItem.bind(this),
            removeAll: this.removeAllMenuItems.bind(this)
        }, 'items', {
            get: () => this.menuItems
        })}).BdMenuItems;
    }

    /**
     * BdContextMenu
     */

    showContextMenu(event, groups) {
        BdContextMenu.show(event, groups);
        this.activeMenu.menu = BdContextMenu.activeMenu.menu;
    }
    get activeMenu() {
        return this._activeMenu || (this._activeMenu = { menu: null });
    }
    get BdContextMenu() {
        return Object.defineProperty(this, 'BdContextMenu', {value: Object.defineProperty({
            show: this.showContextMenu.bind(this)
        }, 'activeMenu', {
            get: () => this.activeMenu
        })}).BdContextMenu;
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
    deleteAllStyles(id) {
        for (const id of this.injectedStyles) {
            this.deleteStyle(id);
        }
    }
    get CssUtils() {
        return Object.defineProperty(this, 'CssUtils', {value: {
            compileSass: this.compileSass.bind(this),
            getConfigAsSCSS: this.getConfigAsSCSS.bind(this),
            getConfigAsSCSSMap: this.getConfigAsSCSSMap.bind(this),
            injectStyle: this.injectStyle.bind(this),
            injectSass: this.injectSass.bind(this),
            deleteStyle: this.deleteStyle.bind(this),
            deleteAllStyles: this.deleteAllStyles.bind(this)
        }}).CssUtils;
    }

    /**
     * Modals
     */

    get modalStack() {
        return this._modalStack || (this._modalStack = []);
    }
    addModal(_modal, component) {
        const modal = Modals.add(_modal, component);
        modal.on('close', () => Utils.removeFromArray(this.modalStack, modal));
        this.modalStack.push(modal);
        return modal;
    }
    closeModal(modal, force) {
        return Modals.close(modal, force);
    }
    closeAllModals(force) {
        const promises = [];
        for (const modal of this.modalStack)
            promises.push(modal.close(force));
        return Promise.all(promises);
    }
    closeLastModal(force) {
        if (!this.modalStack.length) return;
        return this.modalStack[this.modalStack.length - 1].close(force);
    }
    basicModal(title, text) {
        return this.addModal(Modals.createBasicModal(title, text));
    }
    settingsModal(settingsset, headertext, options) {
        return this.addModal(Modals.createSettingsModal(settingsset, headertext, options));
    }
    get Modals() {
        return Object.defineProperty(this, 'Modals', {value: Object.defineProperties({
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
                get: () => Modals.baseComponent
            }
        })}).Modals;
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
    get Toasts() {
        return Object.defineProperty(this, 'Toasts', {value: {
            push: this.showToast.bind(this),
            success: this.showSuccessToast.bind(this),
            error: this.showErrorToast.bind(this),
            info: this.showInfoToast.bind(this),
            warning: this.showWarningToast.bind(this),
            get enabled() { return Toasts.enabled }
        }}).Toasts;
    }

    /**
     * Notifications
     */

    get notificationStack() {
        return this._notificationStack || (this._notificationStack = []);
    }
    addNotification(title, text, buttons = []) {
        if (arguments.length <= 1) text = title, title = undefined;
        if (arguments[1] instanceof Array) [text, buttons] = arguments, title = undefined;

        const notification = Notifications.add(title, text, buttons, () => Utils.removeFromArray(this.notificationStack, notification));
        this.notificationStack.push(notification);
        return notification;
    }
    dismissNotification(index) {
        index = Notifications.stack.indexOf(this.notificationStack[index]);
        if (index) Notifications.dismiss(index);
    }
    dismissAllNotifications() {
        for (const index in this.notificationStack) {
            this.dismissNotification(index);
        }
    }
    get Notifications() {
        return Object.defineProperty(this, 'Notifications', {value: Object.defineProperty({
            add: this.addNotification.bind(this),
            dismiss: this.dismissNotification.bind(this),
            dismissAll: this.dismissAllNotifications.bind(this)
        }, 'stack', {
            get: () => this.notificationStack
        })}).Notifications;
    }

    /**
     * Autocomplete
     */

    get autocompleteSets() {
        return this._autocompleteSets || (this._autocompleteSets = new Map());
    }
    addAutocompleteController(prefix, controller) {
        if (!controller) controller = this.plugin;
        if (GlobalAc.validPrefix(prefix)) return;
        GlobalAc.add(prefix, controller);
        this.autocompleteSets.set(prefix, controller);
    }
    removeAutocompleteController(prefix) {
        if (this.autocompleteSets.get(prefix) !== GlobalAc.sets.get(prefix)) return;
        GlobalAc.remove(prefix);
        this.autocompleteSets.delete(prefix);
    }
    removeAllAutocompleteControllers() {
        for (const [prefix] of this.autocompleteSets) {
            this.removeAutocompleteController(prefix);
        }
    }
    validAutocompletePrefix(prefix) {
        return GlobalAc.validPrefix(prefix);
    }
    toggleAutocompleteMode(prefix, sterm) {
        return GlobalAc.toggle(prefix, sterm);
    }
    searchAutocomplete(prefix, sterm) {
        return GlobalAc.items(prefix, sterm);
    }
    get Autocomplete() {
        return Object.defineProperty(this, 'Autocomplete', {value: Object.defineProperty({
            add: this.addAutocompleteController.bind(this),
            remove: this.removeAutocompleteController.bind(this),
            removeAll: this.removeAllAutocompleteControllers.bind(this),
            validPrefix: this.validAutocompletePrefix.bind(this),
            toggle: this.toggleAutocompleteMode.bind(this),
            search: this.searchAutocomplete.bind(this)
        }, 'sets', {
            get: () => this.autocompleteSets
        })}).Autocomplete;
    }

    /**
     * Emotes
     */

    get emotes() {
        return EmoteModule.database;
    }
    get favouriteEmotes() {
        return EmoteModule.favourites;
    }
    get mostUsedEmotes() {
        return EmoteModule.mostUsed;
    }
    setFavouriteEmote(emote, favourite) {
        return EmoteModule[favourite ? 'removeFavourite' : 'addFavourite'](emote);
    }
    addFavouriteEmote(emote) {
        return EmoteModule.addFavourite(emote);
    }
    removeFavouriteEmote(emote) {
        return EmoteModule.removeFavourite(emote);
    }
    isFavouriteEmote(emote) {
        return EmoteModule.isFavourite(emote);
    }
    getEmote(emote) {
        return EmoteModule.findByName(emote, true);
    }
    getEmoteUseCount(emote) {
        const mostUsed = EmoteModule.mostUsed.find(mu => mu.key === emote.name);
        return mostUsed ? mostUsed.useCount : 0;
    }
    incrementEmoteUseCount(emote) {
        return EmoteModule.addToMostUsed(emote);
    }
    searchEmotes(regex, limit) {
        return EmoteModule.search(regex, limit);
    }
    get Emotes() {
        return Object.defineProperty(this, 'Emotes', {value: Object.defineProperties({
            setFavourite: this.setFavouriteEmote.bind(this),
            addFavourite: this.addFavouriteEmote.bind(this),
            removeFavourite: this.removeFavouriteEmote.bind(this),
            isFavourite: this.isFavouriteEmote.bind(this),
            getEmote: this.getEmote.bind(this),
            getUseCount: this.getEmoteUseCount.bind(this),
            incrementUseCount: this.incrementEmoteUseCount.bind(this),
            search: this.searchEmotes.bind(this)
        }, {
            emotes: {
                get: () => this.emotes
            },
            favourites: {
                get: () => this.favouriteEmotes
            },
            mostused: {
                get: () => this.mostUsedEmotes
            }
        })}).Emotes;
    }

    /**
     * Plugins
     */

    async getPlugin(plugin_id) {
        // This should require extra permissions
        return PluginManager.waitForPlugin(plugin_id);
    }
    listPlugins() {
        return PluginManager.localContent.map(plugin => plugin.id);
    }
    get Plugins() {
        return Object.defineProperty(this, 'Plugins', {value: {
            getPlugin: this.getPlugin.bind(this),
            listPlugins: this.listPlugins.bind(this)
        }}).Plugins;
    }

    /**
     * Themes
     */

    async getTheme(theme_id) {
        // This should require extra permissions
        return ThemeManager.waitForContent(theme_id);
    }
    listThemes() {
        return ThemeManager.localContent.map(theme => theme.id);
    }
    get Themes() {
        return Object.defineProperty(this, 'Themes', {value: {
            getTheme: this.getTheme.bind(this),
            listThemes: this.listThemes.bind(this)
        }}).Themes;
    }

    /**
     * ExtModules
     */

    async getModule(module_id) {
        // This should require extra permissions
        return ExtModuleManager.waitForContent(module_id);
    }
    listModules() {
        return ExtModuleManager.localContent.map(module => module.id);
    }
    get ExtModules() {
        return Object.defineProperty(this, 'ExtModules', {value: {
            getModule: this.getModule.bind(this),
            listModules: this.listModules.bind(this)
        }}).ExtModules;
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
        return Object.defineProperty(this, 'Patcher', {value: Object.defineProperty({
            before: this.patchBefore.bind(this),
            after: this.patchAfter.bind(this),
            instead: this.patchInstead.bind(this),
            pushChildPatch: this.pushChildPatch.bind(this),
            unpatchAll: this.unpatchAll.bind(this),
            monkeyPatch: this.monkeyPatch.bind(this)
        }, 'patches', {
            get: () => this.patches
        })}).Patcher;
    }
    get monkeyPatch() {
        return Object.defineProperty(this, 'monkeyPatch', {value: m => MonkeyPatch(this.plugin.id, m)}).monkeyPatch;
    }

    /**
     * DiscordContextMenu
     */

    get discordContextMenus() {
        return this._discordContextMenus || (this._discordContextMenus = []);
    }
    addDiscordContextMenu(items, filter) {
        const menu = DiscordContextMenu.add(items, filter);
        this.discordContextMenus.push(menu);
        return menu;
    }
    removeDiscordContextMenu(menu) {
        DiscordContextMenu.remove(menu);
        Utils.removeFromArray(this.discordContextMenus, menu);
    }
    removeAllDiscordContextMenus() {
        for (const menu of this.discordContextMenus) {
            this.removeDiscordContextMenu(menu);
        }
    }
    get DiscordContextMenu() {
        return Object.defineProperty(this, 'DiscordContextMenu', {value: Object.defineProperty({
            add: this.addDiscordContextMenu.bind(this),
            remove: this.removeDiscordContextMenu.bind(this),
            removeAll: this.removeAllDiscordContextMenus.bind(this)
        }, 'menus', {
            get: () => this.discordContextMenus
        })}).DiscordContextMenu;
    }

    get Vuewrap() {
        return Object.defineProperty(this, 'Vuewrap', {value: (id, component, props) => {
            if (!component.name) component.name = id;
            return VueInjector.createReactElement(component, props);
        }}).Vuewrap;
    }

    unloadAll(closeModals = true) {
        this.Events.unsubscribeAll();
        this.observer.unsubscribeAll();
        this.BdMenuItems.removeAll();
        this.CssUtils.deleteAllStyles();
        if (closeModals) this.Modals.closeAll();
        if (closeModals) this.Notifications.dismissAll();
        this.Autocomplete.removeAll();
        this.Patcher.unpatchAll();
        this.DiscordContextMenu.removeAll();
    }

}

// Stop plugins from modifying the plugin API for all plugins
// Plugins can still modify their own plugin API object
Object.freeze(PluginApi);
Object.freeze(PluginApi.prototype);
